"use server";

import { z } from "zod";
import { getActionTenant } from "@/lib/data/dashboard";
import { revalidateTenant } from "@/lib/data/mutations";
import { SESSION_EXPIRED } from "@/lib/forms";
import { SITE_URL } from "@/lib/config";
import { plans, type PlanId } from "@/lib/payments/plans";
import {
  PaymentError,
  cancelSubscription,
  changeSubscriptionVariant,
  createCheckout,
  getSubscription,
  isPaymentsConfigured,
  resumeSubscription,
  variantFor,
  type SubscriptionSnapshot,
} from "@/lib/payments/lemon-squeezy";
import { applySubscription, getLemonSqueezyId, grantsAccess } from "@/lib/payments/subscriptions";
import { formatDate } from "@/lib/utils/dates";
import type { BillingInterval } from "@/types";

/**
 * Billing actions. Checkout and the customer portal are hosted by Lemon
 * Squeezy (these return a URL to open). Plan changes, cancel and resume call
 * its API and store the subscription it sends back right away, so the page is
 * up to date without waiting for the webhook (which then arrives as a no-op).
 */

export type BillingResult = { ok: true; message?: string; url?: string } | { ok: false; error: string };

const NOT_READY = "Checkout isn't available yet. Keep building in the meantime; nothing is lost.";
const FAILED = "Something went wrong. Nothing was changed. Please try again.";

const choiceSchema = z.object({
  plan: z.enum(plans.map((p) => p.id) as [PlanId, ...PlanId[]]),
  interval: z.enum(["month", "year"]),
});

const planLabel = (plan: PlanId, interval: BillingInterval) =>
  `${plans.find((p) => p.id === plan)?.name} (${interval === "year" ? "yearly" : "monthly"})`;

/** Session + configuration checks and error mapping shared by every action. */
async function billingAction(
  run: (ctx: NonNullable<Awaited<ReturnType<typeof getActionTenant>>>) => Promise<BillingResult>
): Promise<BillingResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  if (!isPaymentsConfigured()) return { ok: false, error: NOT_READY };
  try {
    return await run(ctx);
  } catch (error) {
    if (error instanceof PaymentError) return { ok: false, error: error.message };
    console.error("[billing]", error);
    return { ok: false, error: FAILED };
  }
}

/** Store what Lemon Squeezy just answered and refresh the dashboard + live site. */
async function store(tenant: { id: string; slug: string }, snapshot: SubscriptionSnapshot) {
  const outcome = await applySubscription(tenant.id, snapshot);
  if (outcome === "unknown_variant") throw new Error(`variant ${snapshot.variantId} isn't configured`);
  revalidateTenant(tenant.slug);
}

export async function startCheckout(plan: string, interval: string): Promise<BillingResult> {
  return billingAction(async ({ tenant, user, name }) => {
    const choice = choiceSchema.safeParse({ plan, interval });
    if (!choice.success) return { ok: false, error: "Choose one of the plans." };

    const current = await getLemonSqueezyId(tenant.id);
    if (current && grantsAccess(current.status)) {
      return { ok: false, error: "You already have a plan. Switch or manage it on the Billing page." };
    }

    const url = await createCheckout({
      variantId: variantFor(choice.data.plan, choice.data.interval)!,
      tenantId: tenant.id,
      email: user.email,
      name,
      redirectUrl: `${SITE_URL}/dashboard/billing?checkout=success`,
    });
    return { ok: true, url };
  });
}

export async function changePlan(plan: string, interval: string): Promise<BillingResult> {
  return billingAction(async ({ tenant }) => {
    const choice = choiceSchema.safeParse({ plan, interval });
    if (!choice.success) return { ok: false, error: "Choose one of the plans." };

    const current = await getLemonSqueezyId(tenant.id);
    if (!current || !grantsAccess(current.status)) return { ok: false, error: "You don't have a plan to switch yet." };
    if (current.status === "cancelled") return { ok: false, error: "Resume your plan first, then switch." };

    const variantId = variantFor(choice.data.plan, choice.data.interval)!;
    if (current.variantId === variantId) return { ok: false, error: "That's already your plan." };

    await store(tenant, await changeSubscriptionVariant(current.id, variantId));
    return { ok: true, message: `You're on ${planLabel(choice.data.plan, choice.data.interval)} now.` };
  });
}

export async function cancelPlan(): Promise<BillingResult> {
  return billingAction(async ({ tenant }) => {
    const current = await getLemonSqueezyId(tenant.id);
    if (!current || !grantsAccess(current.status)) return { ok: false, error: "You don't have a plan to cancel." };
    if (current.status === "cancelled") return { ok: false, error: "Your plan is already cancelled." };

    const snapshot = await cancelSubscription(current.id);
    await store(tenant, snapshot);
    const until = formatDate(snapshot.endsAt);
    return {
      ok: true,
      message: until ? `Plan cancelled. Your portfolio stays live until ${until}.` : "Plan cancelled.",
    };
  });
}

export async function resumePlan(): Promise<BillingResult> {
  return billingAction(async ({ tenant }) => {
    const current = await getLemonSqueezyId(tenant.id);
    if (!current || current.status !== "cancelled") return { ok: false, error: "There's no cancelled plan to resume." };

    await store(tenant, await resumeSubscription(current.id));
    return { ok: true, message: "Your plan is active again." };
  });
}

/** Lemon Squeezy's customer portal: card, invoices, billing address. Its link is signed and short-lived, so fetched per click. */
export async function openBillingPortal(): Promise<BillingResult> {
  return billingAction(async ({ tenant }) => {
    const current = await getLemonSqueezyId(tenant.id);
    if (!current) return { ok: false, error: "You don't have a subscription yet." };

    const snapshot = await getSubscription(current.id);
    if (!snapshot.customerPortalUrl) return { ok: false, error: "The billing portal isn't available right now. Try again in a minute." };
    return { ok: true, url: snapshot.customerPortalUrl };
  });
}

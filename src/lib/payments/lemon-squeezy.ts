import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { PlanId } from "@/lib/payments/plans";
import type { BillingInterval, SubscriptionStatus } from "@/types";

/**
 * Minimal Lemon Squeezy client (REST / JSON:API, no SDK). Server-only: reads
 * LEMON_SQUEEZY_* env vars. Lemon Squeezy is the Merchant of Record: it hosts
 * checkout, charges, handles tax and sends webhooks; we only keep a snapshot
 * of each subscription (see lib/payments/subscriptions.ts).
 */

/** Overridable so tests can point at a local mock. */
const API = process.env.LEMON_SQUEEZY_API_URL ?? "https://api.lemonsqueezy.com/v1";
const TIMEOUT_MS = 15_000;

const VARIANT_ENV: Record<PlanId, Record<BillingInterval, string>> = {
  starter: { month: "LEMON_SQUEEZY_VARIANT_STARTER_MONTHLY", year: "LEMON_SQUEEZY_VARIANT_STARTER_ANNUAL" },
  pro: { month: "LEMON_SQUEEZY_VARIANT_PRO_MONTHLY", year: "LEMON_SQUEEZY_VARIANT_PRO_ANNUAL" },
};

/** Everything checkout and plan changes need. The webhook only needs the secret. */
export function isPaymentsConfigured(): boolean {
  return (
    Boolean(process.env.LEMON_SQUEEZY_API_KEY && process.env.LEMON_SQUEEZY_STORE_ID && process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) &&
    Object.values(VARIANT_ENV).every((byInterval) => Object.values(byInterval).every((key) => process.env[key]))
  );
}

export function variantFor(plan: PlanId, interval: BillingInterval): string | null {
  return process.env[VARIANT_ENV[plan][interval]] || null;
}

/** Which plan a Lemon Squeezy variant sells, or null for a variant we don't know. */
export function planForVariant(variantId: string): { plan: PlanId; interval: BillingInterval } | null {
  for (const plan of Object.keys(VARIANT_ENV) as PlanId[]) {
    for (const interval of ["month", "year"] as const) {
      if (variantFor(plan, interval) === variantId) return { plan, interval };
    }
  }
  return null;
}

/**
 * Webhook signature: hex HMAC-SHA256 of the raw body with the signing secret,
 * sent in the X-Signature header. Compared in constant time.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "hex");
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/* ─── Subscription snapshots ─── */

const id = z.union([z.string(), z.number()]).transform(String);
const date = z.string().nullish().transform((v) => v ?? null);

const subscriptionSchema = z.object({
  type: z.literal("subscriptions"),
  id,
  attributes: z.object({
    customer_id: id,
    variant_id: id,
    status: z.enum(["on_trial", "active", "paused", "past_due", "unpaid", "cancelled", "expired"]),
    renews_at: date,
    ends_at: date,
    card_brand: z.string().nullish().transform((v) => v || null),
    card_last_four: z.string().nullish().transform((v) => v || null),
    test_mode: z.boolean().default(false),
    updated_at: z.string(),
    urls: z
      .object({ customer_portal: z.string().nullish(), update_payment_method: z.string().nullish() })
      .partial()
      .default({}),
  }),
});

/** One subscription as Lemon Squeezy reports it right now. */
export interface SubscriptionSnapshot {
  id: string;
  customerId: string;
  variantId: string;
  status: SubscriptionStatus;
  renewsAt: string | null;
  endsAt: string | null;
  cardBrand: string | null;
  cardLastFour: string | null;
  testMode: boolean;
  updatedAt: string;
  /** Signed, valid for 24 hours: fetch fresh, never store */
  customerPortalUrl: string | null;
}

/** Parse the `data` object of a webhook or API response; null if it isn't a subscription. */
export function parseSubscription(data: unknown): SubscriptionSnapshot | null {
  const parsed = subscriptionSchema.safeParse(data);
  if (!parsed.success) return null;
  const { id, attributes: a } = parsed.data;
  return {
    id,
    customerId: a.customer_id,
    variantId: a.variant_id,
    status: a.status,
    renewsAt: a.renews_at,
    endsAt: a.ends_at,
    cardBrand: a.card_brand,
    cardLastFour: a.card_last_four,
    testMode: a.test_mode,
    updatedAt: a.updated_at,
    customerPortalUrl: a.urls.customer_portal ?? null,
  };
}

/* ─── API calls ─── */

/** Anything the user should see as "the payment provider couldn't do it, nothing changed". */
export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

async function call(path: string, init: { method: string; body?: unknown }): Promise<unknown> {
  const key = process.env.LEMON_SQUEEZY_API_KEY;
  if (!key) throw new PaymentError("Payments aren't set up yet.");

  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      method: init.method,
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${key}`,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[lemon-squeezy] ${init.method} ${path}`, error);
    throw new PaymentError("Couldn't reach the payment provider. Nothing was changed. Try again in a minute.");
  }

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`[lemon-squeezy] ${init.method} ${path} → ${response.status}`, JSON.stringify(json)?.slice(0, 1000));
    throw new PaymentError("The payment provider couldn't do that. Nothing was changed. Try again in a minute.");
  }
  return json;
}

async function subscriptionCall(path: string, init: { method: string; body?: unknown }): Promise<SubscriptionSnapshot> {
  const json = (await call(path, init)) as { data?: unknown } | null;
  const snapshot = parseSubscription(json?.data);
  if (!snapshot) {
    console.error(`[lemon-squeezy] ${init.method} ${path}: unexpected response`, JSON.stringify(json)?.slice(0, 1000));
    throw new PaymentError("The payment provider sent an unexpected answer. Refresh the page to see your current plan.");
  }
  return snapshot;
}

/** A hosted checkout for one variant. `tenantId` comes back in every webhook as meta.custom_data. */
export async function createCheckout(input: {
  variantId: string;
  tenantId: string;
  email: string;
  name: string;
  redirectUrl: string;
}): Promise<string> {
  const json = (await call("/checkouts", {
    method: "POST",
    body: {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: { email: input.email, name: input.name, custom: { tenant_id: input.tenantId } },
          product_options: { redirect_url: input.redirectUrl, enabled_variants: [Number(input.variantId)] },
          checkout_options: { embed: false },
        },
        relationships: {
          store: { data: { type: "stores", id: String(process.env.LEMON_SQUEEZY_STORE_ID) } },
          variant: { data: { type: "variants", id: input.variantId } },
        },
      },
    },
  })) as { data?: { attributes?: { url?: unknown } } } | null;

  const url = json?.data?.attributes?.url;
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    console.error("[lemon-squeezy] checkout without a url", JSON.stringify(json)?.slice(0, 1000));
    throw new PaymentError("Couldn't open checkout. Nothing was charged. Try again in a minute.");
  }
  return url;
}

export function getSubscription(subscriptionId: string) {
  return subscriptionCall(`/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: "GET" });
}

/** Switch plan or billing interval. Lemon Squeezy prorates the difference on the next invoice. */
export function changeSubscriptionVariant(subscriptionId: string, variantId: string) {
  return subscriptionCall(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "PATCH",
    body: { data: { type: "subscriptions", id: subscriptionId, attributes: { variant_id: Number(variantId) } } },
  });
}

/** Cancel at the end of the paid period (status → cancelled, ends_at set). */
export function cancelSubscription(subscriptionId: string) {
  return subscriptionCall(`/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: "DELETE" });
}

/** Undo a cancellation before the period ends. */
export function resumeSubscription(subscriptionId: string) {
  return subscriptionCall(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "PATCH",
    body: { data: { type: "subscriptions", id: subscriptionId, attributes: { cancelled: false } } },
  });
}

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { planForVariant, type SubscriptionSnapshot } from "@/lib/payments/lemon-squeezy";
import type { Subscription, SubscriptionStatus } from "@/types";

/**
 * The subscription row that decides tenants.plan. Lemon Squeezy is the source
 * of truth; we store its latest snapshot through apply_subscription() in
 * schema.sql, which writes the row and the tenant's plan in one transaction
 * and ignores stale or superseded snapshots.
 */

/** Statuses that keep the portfolio online. Mirrors subscription_grants_access() in schema.sql. */
const ACCESS_STATUSES: SubscriptionStatus[] = ["on_trial", "active", "past_due", "cancelled"];

export function grantsAccess(status: SubscriptionStatus): boolean {
  return ACCESS_STATUSES.includes(status);
}

export type ApplyOutcome = "applied" | "stale" | "superseded" | "unknown_variant";

export async function applySubscription(tenantId: string, s: SubscriptionSnapshot): Promise<ApplyOutcome> {
  const variant = planForVariant(s.variantId);
  if (!variant) return "unknown_variant";

  const { data, error } = await createAdminClient().rpc("apply_subscription", {
    p_tenant_id: tenantId,
    p_ls_subscription_id: s.id,
    p_ls_customer_id: s.customerId,
    p_variant_id: s.variantId,
    p_plan: variant.plan,
    p_billing_interval: variant.interval,
    p_status: s.status,
    p_renews_at: s.renewsAt,
    p_ends_at: s.endsAt,
    p_card_brand: s.cardBrand,
    p_card_last_four: s.cardLastFour,
    p_test_mode: s.testMode,
    p_ls_updated_at: s.updatedAt,
  });
  if (error) throw new Error(`Could not save the subscription: ${error.message}`);
  return data as ApplyOutcome;
}

const SUBSCRIPTION_COLUMNS =
  "plan, status, billing_interval, renews_at, ends_at, card_brand, card_last_four, test_mode";

/** The signed-in tenant's subscription (RLS: owner can read), or null if they never had one. */
export async function getSubscriptionRow(tenantId: string): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("tenant_id", tenantId)
    .maybeSingle<Subscription>();
  if (error) throw new Error(`Could not load your plan: ${error.message}`);
  return data;
}

/** For actions that talk to Lemon Squeezy: the stored subscription id, status and variant. */
export async function getLemonSqueezyId(tenantId: string): Promise<{ id: string; status: SubscriptionStatus; variantId: string | null } | null> {
  const { data, error } = await createAdminClient()
    .from("subscriptions")
    .select("ls_subscription_id, status, variant_id")
    .eq("tenant_id", tenantId)
    .maybeSingle<{ ls_subscription_id: string | null; status: SubscriptionStatus; variant_id: string | null }>();
  if (error) throw new Error(`Could not load your plan: ${error.message}`);
  if (!data?.ls_subscription_id) return null;
  return { id: data.ls_subscription_id, status: data.status, variantId: data.variant_id };
}

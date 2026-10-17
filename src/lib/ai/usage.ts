import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminConfigured } from "@/lib/supabase/env";
import { UNPAID_AI_IMPORTS, getPlan } from "@/lib/payments/plans";
import type { AiUsage } from "@/lib/ai/gemini-client";
import type { Tenant } from "@/types";

/**
 * AI usage limits, counted from the ai_usage table. Only successful calls are
 * recorded, so a failed or refused request never uses up an allowance.
 * ai_usage is read-only for users (RLS): reads and writes go through the
 * service role, always filtered by tenant_id.
 */

export type AiAction = "cv_parse" | "generate" | "rewrite";
const IMPORT_ACTIONS: AiAction[] = ["cv_parse", "generate"];

export interface AiAllowance {
  /** AI imports (CV or interview) still available; null = no fixed limit (paid, within the daily cap) */
  importsLeft: number | null;
  /** Rewrites left this month; null = unlimited (within the daily cap); 0 when the plan has none */
  rewritesLeft: number | null;
  /** Whether rewrites exist on this plan at all (unpaid: no) */
  canRewrite: boolean;
  /** Daily cap reached: nothing works until tomorrow (UTC) */
  dailyCapReached: boolean;
}

const startOfUtcDay = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
};
const startOfUtcMonth = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
};

async function countUsage(tenantId: string, actions: AiAction[], since?: string): Promise<number> {
  let query = createAdminClient()
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .in("action", actions);
  if (since) query = query.gte("created_at", since);
  const { count, error } = await query;
  if (error) throw new Error(`Could not check AI usage: ${error.message}`);
  return count ?? 0;
}

export async function getAiAllowance(tenant: Pick<Tenant, "id" | "plan">): Promise<AiAllowance> {
  if (!isAdminConfigured()) return { importsLeft: 0, rewritesLeft: 0, canRewrite: false, dailyCapReached: false };
  const plan = getPlan(tenant);

  if (!plan) {
    const used = await countUsage(tenant.id, IMPORT_ACTIONS);
    return { importsLeft: Math.max(0, UNPAID_AI_IMPORTS - used), rewritesLeft: 0, canRewrite: false, dailyCapReached: false };
  }

  const [today, rewritesThisMonth] = await Promise.all([
    countUsage(tenant.id, ["cv_parse", "generate", "rewrite"], startOfUtcDay()),
    plan.limits.aiRewrites === null ? Promise.resolve(0) : countUsage(tenant.id, ["rewrite"], startOfUtcMonth()),
  ]);
  return {
    importsLeft: null,
    rewritesLeft: plan.limits.aiRewrites === null ? null : Math.max(0, plan.limits.aiRewrites - rewritesThisMonth),
    canRewrite: true,
    dailyCapReached: today >= plan.limits.aiDaily,
  };
}

/** null when allowed, otherwise the message to show. */
export async function checkAiAllowance(tenant: Pick<Tenant, "id" | "plan">, action: AiAction): Promise<string | null> {
  const a = await getAiAllowance(tenant);
  if (a.dailyCapReached) return "You've reached today's AI limit. It resets at midnight UTC.";
  if (action === "rewrite") {
    if (!a.canRewrite) return "AI rewrites come with Starter and Pro.";
    if (a.rewritesLeft === 0) return "You've used this month's AI rewrites. Pro has unlimited rewrites.";
    return null;
  }
  if (a.importsLeft === 0) return "You've used your free AI import. Choose a plan to import again.";
  return null;
}

/** Record a successful call. Failing to record must not fail the user's request. */
export async function recordAiUsage(tenantId: string, action: AiAction, usage: AiUsage) {
  const { error } = await createAdminClient()
    .from("ai_usage")
    .insert({ tenant_id: tenantId, action, tokens_in: usage.tokensIn, tokens_out: usage.tokensOut });
  if (error) console.error("[recordAiUsage]", error);
}

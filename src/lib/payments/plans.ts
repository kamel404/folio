/**
 * Folio has no free tier. Anyone can sign up, import a CV and preview
 * their portfolio privately; publishing requires Starter or Pro.
 */
import type { Tenant } from "@/types";

export type PlanId = "starter" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  blurb: string;
  monthly: number;
  annual: number;
  features: string[];
  limits: {
    aiRewrites: number | null; // per month; null = unlimited
    /** Every AI call (imports + rewrites) per UTC day — a cost guard, not a selling point */
    aiDaily: number;
    customDomain: boolean;
    analytics: "basic" | "full";
  };
}

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    blurb: "A complete portfolio at your own Folio address.",
    monthly: 4.99,
    annual: 39,
    features: [
      "yourname.getfolio.dev",
      "AI import from CV or interview",
      "Unlimited projects, roles & skills",
      "All five palettes + custom colours",
      "3 AI rewrites a month",
      "Basic visitor analytics",
    ],
    limits: { aiRewrites: 3, aiDaily: 10, customDomain: false, analytics: "basic" },
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "Your own domain and the full toolkit.",
    monthly: 9.99,
    annual: 79,
    features: [
      "Everything in Starter",
      "Connect your own domain",
      "Unlimited AI rewrites",
      "Portfolio quality review",
      "Full analytics",
    ],
    limits: { aiRewrites: null, aiDaily: 20, customDomain: true, analytics: "full" },
  },
];

/** Before paying: one AI import (CV or interview) to see what Folio can do. No rewrites. */
export const UNPAID_AI_IMPORTS = 1;

export function getPlan(tenant: Pick<Tenant, "plan">): Plan | null {
  return plans.find((p) => p.id === tenant.plan) ?? null;
}

/**
 * The publishing gate. Everyone can edit and preview; only a paid plan
 * publishes. Mirrors tenant_is_live() in supabase/schema.sql, which enforces
 * the same rule for public reads.
 */
export function canPublish(tenant: Pick<Tenant, "plan">): boolean {
  return tenant.plan !== "none";
}

/** Publicly visible right now: a paid plan and not suspended. */
export function isLive(tenant: Pick<Tenant, "plan" | "active">): boolean {
  return canPublish(tenant) && tenant.active;
}

/** Lowest monthly price, for marketing copy ("from $4.99/month"). */
export const startingPrice = Math.min(...plans.map((p) => p.monthly));

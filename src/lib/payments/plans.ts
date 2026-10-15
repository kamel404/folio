/**
 * Folio has no free tier. Anyone can sign up, import a CV and preview
 * their portfolio privately; publishing requires Starter or Pro.
 */
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
    limits: { aiRewrites: 3, customDomain: false, analytics: "basic" },
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
    limits: { aiRewrites: null, customDomain: true, analytics: "full" },
  },
];

/** Lowest monthly price, for marketing copy ("from $4.99/month"). */
export const startingPrice = Math.min(...plans.map((p) => p.monthly));

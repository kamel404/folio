export type TenantPlan = "none" | "starter" | "pro";
export type OnboardingState = "pending" | "in_progress" | "completed";

export interface Tenant {
  id: string;
  slug: string;
  plan: TenantPlan;
  active: boolean;
  onboarding: OnboardingState;
  custom_domain: string | null;
}

export interface CurrentTenant {
  user: { id: string; email: string };
  tenant: Tenant;
  name: string;
}

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

export type AvailabilityStatus = "open" | "selective" | "unavailable";

export interface Profile {
  id: string;
  tenant_id: string;
  name: string;
  title: string;
  short_bio: string | null;
  long_bio: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  cv_url: string | null;
  profile_image_url: string | null;
  location: string | null;
  availability_status: AvailabilityStatus | null;
  updated_at: string;
}

export interface Project {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string | null;
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  category: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  /** Technology names, alphabetical (the pivot table has no order column) */
  technologies: string[];
}

export interface Experience {
  id: string;
  tenant_id: string;
  company: string;
  position: string;
  description: string;
  /** "YYYY-MM" */
  start_date: string;
  /** "YYYY-MM", null while current */
  end_date: string | null;
  current: boolean;
  sort_order: number;
}

export interface Skill {
  id: string;
  tenant_id: string;
  name: string;
  category: string;
  sort_order: number;
}

export interface CurrentTenant {
  user: { id: string; email: string };
  tenant: Tenant;
  name: string;
}

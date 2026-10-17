import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentTenant, getTenantBySlug } from "@/lib/data/tenant";
import {
  EXPERIENCE_COLUMNS,
  PROFILE_COLUMNS,
  PROJECT_COLUMNS,
  SKILL_COLUMNS,
  THEME_COLUMNS,
  toProject,
  type ProjectRow,
} from "@/lib/data/columns";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient, siteTag } from "@/lib/supabase/public";
import { isLive } from "@/lib/payments/plans";
import { DEFAULT_FONT } from "@/lib/themes/fonts";
import type {
  CurrentTenant,
  Experience,
  PortfolioContent,
  Profile,
  Project,
  Skill,
  Tenant,
  ThemeConfig,
} from "@/types";

/**
 * Reads for the rendered portfolio — the public site at slug.getfolio.dev
 * and the owner's private preview at /preview. Both go through the same
 * loader so the preview is exactly what visitors will see.
 *
 *   public   anon client, no cookies (ISR-safe). RLS only returns rows of
 *            live tenants and published projects, on top of our filters.
 *            Every read carries the siteTag(slug) cache tag, which
 *            revalidateTenant() expires after a dashboard save.
 *   preview  the owner's session; tenant_id filter as in the dashboard.
 *
 * Errors throw (→ error.tsx). ISR keeps serving the last good page when a
 * background regeneration throws, so a blip never takes a live site down.
 */

const DEFAULT_THEME: ThemeConfig = {
  palette_id: "warm-earth",
  custom_colors: null,
  font_heading: DEFAULT_FONT,
  font_body: DEFAULT_FONT,
  show_photo: true,
};

/** Featured projects first ("highlighted at the top"), otherwise the owner's order. */
function displayOrder(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
}

async function loadPortfolio(supabase: SupabaseClient, tenantId: string): Promise<PortfolioContent | null> {
  const [profile, projects, experiences, skills, theme] = await Promise.all([
    supabase.from("profiles").select(PROFILE_COLUMNS).eq("tenant_id", tenantId).maybeSingle<Profile>(),
    supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("tenant_id", tenantId)
      .eq("published", true)
      .order("sort_order")
      .order("created_at")
      .returns<ProjectRow[]>(),
    supabase
      .from("experiences")
      .select(EXPERIENCE_COLUMNS)
      .eq("tenant_id", tenantId)
      .order("sort_order")
      .order("created_at")
      .returns<Experience[]>(),
    supabase
      .from("skills")
      .select(SKILL_COLUMNS)
      .eq("tenant_id", tenantId)
      .order("sort_order")
      .order("name")
      .returns<Skill[]>(),
    supabase.from("theme_configs").select(THEME_COLUMNS).eq("tenant_id", tenantId).maybeSingle<ThemeConfig>(),
  ]);

  for (const result of [profile, projects, experiences, skills, theme]) {
    if (result.error) throw new Error(`Could not load the portfolio: ${result.error.message}`);
  }
  if (!profile.data) return null;

  return {
    profile: profile.data,
    projects: displayOrder((projects.data ?? []).map(toProject)),
    experiences: experiences.data ?? [],
    skills: skills.data ?? [],
    // The nullable columns fall back to the defaults
    theme: theme.data
      ? {
          ...theme.data,
          font_heading: theme.data.font_heading ?? DEFAULT_FONT,
          font_body: theme.data.font_body ?? DEFAULT_FONT,
          show_photo: theme.data.show_photo ?? DEFAULT_THEME.show_photo,
        }
      : DEFAULT_THEME,
  };
}

export type Site =
  | { status: "missing" }
  | { status: "offline" }
  | { status: "live"; tenant: Tenant; content: PortfolioContent };

/**
 * The public site for a subdomain. Cached per request: the layout (theme),
 * page and generateMetadata share one set of queries.
 */
export const getSite = cache(async (slug: string): Promise<Site> => {
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return { status: "missing" };
  if (!isLive(tenant)) return { status: "offline" };

  const content = await loadPortfolio(createPublicClient([siteTag(slug)]), tenant.id);
  // RLS returns nothing for a tenant that isn't live: it went offline between the two reads
  if (!content) return { status: "offline" };
  return { status: "live", tenant, content };
});

/** The signed-in owner's portfolio for /preview, whatever their plan. Null when signed out. */
export const getPreview = cache(async (): Promise<(CurrentTenant & { content: PortfolioContent }) | null> => {
  const current = await getCurrentTenant();
  if (!current) return null;

  const content = await loadPortfolio(await createClient(), current.tenant.id);
  if (!content) throw new Error("Your profile is missing. Contact support.");
  return { ...current, content };
});

export function findProject(content: PortfolioContent, slug: string): Project | undefined {
  return content.projects.find((p) => p.slug === slug);
}

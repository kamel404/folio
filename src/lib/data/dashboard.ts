import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentTenant } from "@/lib/data/tenant";
import { createClient } from "@/lib/supabase/server";
import {
  EXPERIENCE_COLUMNS,
  PROFILE_COLUMNS,
  PROJECT_COLUMNS,
  SKILL_COLUMNS,
  toProject,
  type ProjectRow,
} from "@/lib/data/columns";
import type { CurrentTenant, Experience, Profile, Project, Skill } from "@/types";

/**
 * Data access for the tenant dashboard.
 *
 * Every query filters on tenant_id explicitly. RLS already blocks writes to
 * other tenants, but the public-read policies let any signed-in user SELECT
 * rows of *live* tenants — so a missing filter would leak their content.
 *
 * Read helpers throw on database errors (the dashboard error.tsx catches them)
 * and call notFound() for ids that don't exist or belong to someone else.
 */

/** For pages: the signed-in tenant, or a redirect to /login. */
export async function requirePageTenant(): Promise<CurrentTenant> {
  const current = await getCurrentTenant();
  if (!current) redirect("/login");
  return current;
}

/** For actions: the signed-in tenant plus a client, or null (session expired). */
export async function getActionTenant() {
  const current = await getCurrentTenant();
  if (!current) return null;
  return { ...current, supabase: await createClient() };
}

function fail(what: string, error: { message: string }): never {
  throw new Error(`Could not load ${what}: ${error.message}`);
}

/** Route ids come from the URL — anything that isn't a UUID is simply "not found". */
export function parseId(id: string): string {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) notFound();
  return parsed.data;
}

/* ─── Profile ─── */

export async function getProfile(tenantId: string): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("tenant_id", tenantId)
    .maybeSingle<Profile>();
  if (error) fail("your profile", error);
  if (!data) throw new Error("Your profile is missing. Contact support.");
  return data;
}

/* ─── Projects ─── */

export async function listProjects(tenantId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("sort_order")
    .order("created_at")
    .returns<ProjectRow[]>();
  if (error) fail("your projects", error);
  return data.map(toProject);
}

/** Cached per request: generateMetadata and the page share one query. */
export const getProject = cache(async (tenantId: string, id: string): Promise<Project> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", parseId(id))
    .maybeSingle<ProjectRow>();
  if (error) fail("this project", error);
  if (!data) notFound();
  return toProject(data);
});

/** Categories already used by this tenant, for the category suggestions. */
export async function listProjectCategories(tenantId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("category").eq("tenant_id", tenantId);
  if (error) fail("your project categories", error);
  return [...new Set(data.map((r) => r.category as string))].sort();
}

/* ─── Experience ─── */

export async function listExperiences(tenantId: string): Promise<Experience[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("sort_order")
    .order("created_at")
    .returns<Experience[]>();
  if (error) fail("your experience", error);
  return data;
}

/** Cached per request: generateMetadata and the page share one query. */
export const getExperience = cache(async (tenantId: string, id: string): Promise<Experience> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", parseId(id))
    .maybeSingle<Experience>();
  if (error) fail("this role", error);
  if (!data) notFound();
  return data;
});

/* ─── Skills ─── */

export async function listSkills(tenantId: string): Promise<Skill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select(SKILL_COLUMNS)
    .eq("tenant_id", tenantId)
    .order("sort_order")
    .order("name")
    .returns<Skill[]>();
  if (error) fail("your skills", error);
  return data;
}

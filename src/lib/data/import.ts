import type { SupabaseClient } from "@supabase/supabase-js";
import { draftProfileSchema, parseExperience, parseProject, parseSkill, type PortfolioDraft } from "@/lib/ai/draft";
import { nextSortOrder } from "@/lib/data/mutations";
import { slugify, syncTechnologies, uniqueSlug } from "@/lib/data/projects";

/**
 * Writes a reviewed draft into the tenant's portfolio. The caller has resolved
 * the tenant from the session. Every included item is re-validated with the
 * dashboard form rules (a forged draft gets no further than a form would).
 *
 * Items already in the portfolio are skipped (same role, same project title,
 * same skill), so importing twice — or again after a partial failure — never
 * creates duplicates. Steps are independent: if one fails, what was saved
 * stays saved and the summary says what's missing.
 */

export interface ImportSummary {
  profile: boolean;
  experiences: number;
  projects: number;
  skills: number;
  /** Already in the portfolio, so not added again */
  skipped: number;
}

const lower = (s: string) => s.trim().toLowerCase();
const INVALID = "Some items still have problems. Fix or untick them, then import again.";
const PARTIAL = (what: string) =>
  `Some of it was saved, but we couldn't save your ${what}. Import again to add the rest; anything already saved is skipped.`;

export async function importDraft(
  supabase: SupabaseClient,
  tenantId: string,
  draft: PortfolioDraft
): Promise<{ ok: true; summary: ImportSummary } | { ok: false; error: string; summary: ImportSummary }> {
  const summary: ImportSummary = { profile: false, experiences: 0, projects: 0, skills: 0, skipped: 0 };

  /* Validate everything first, so nothing is written for a draft that would fail */
  const profile = draftProfileSchema.safeParse(draft.profile);
  const experiences = draft.experiences.filter((e) => e?.include).map(parseExperience);
  const projects = draft.projects.filter((p) => p?.include).map(parseProject);
  const skills = draft.skills.filter((s) => s?.include).map(parseSkill);
  if (!profile.success || [...experiences, ...projects, ...skills].some((r) => !r.success)) {
    return { ok: false, error: INVALID, summary };
  }

  /* Profile */
  const { error: profileError } = await supabase.from("profiles").update(profile.data).eq("tenant_id", tenantId);
  if (profileError) {
    console.error("[importDraft] profile", profileError);
    return { ok: false, error: PARTIAL("profile"), summary };
  }
  summary.profile = true;

  /* Experience */
  if (experiences.length > 0) {
    const { data: existing, error } = await supabase
      .from("experiences")
      .select("company, position, start_date")
      .eq("tenant_id", tenantId);
    if (error) return { ok: false, error: PARTIAL("experience"), summary };
    const have = new Set(existing.map((e) => `${lower(e.company)}|${lower(e.position)}|${e.start_date}`));
    const rows = experiences
      .map((r) => r.data!)
      .filter((e) => {
        const id = `${lower(e.company)}|${lower(e.position)}|${e.start_date}`;
        if (have.has(id)) return void summary.skipped++, false;
        return have.add(id), true;
      });
    if (rows.length > 0) {
      const start = await nextSortOrder(supabase, "experiences", tenantId);
      const { error: insertError } = await supabase
        .from("experiences")
        .insert(rows.map((e, i) => ({ ...e, tenant_id: tenantId, sort_order: start + i })));
      if (insertError) {
        console.error("[importDraft] experiences", insertError);
        return { ok: false, error: PARTIAL("experience"), summary };
      }
      summary.experiences = rows.length;
    }
  }

  /* Projects (one at a time: each needs a free URL name and its technologies) */
  if (projects.length > 0) {
    const { data: existing, error } = await supabase.from("projects").select("title").eq("tenant_id", tenantId);
    if (error) return { ok: false, error: PARTIAL("projects"), summary };
    const have = new Set(existing.map((p) => lower(p.title)));
    const reserved = new Set<string>();
    let order = await nextSortOrder(supabase, "projects", tenantId);

    for (const r of projects) {
      // The draft never carries a URL name; one is generated from the title below
      const { technologies, slug: _, ...fields } = r.data!; // eslint-disable-line @typescript-eslint/no-unused-vars
      if (have.has(lower(fields.title))) {
        summary.skipped++;
        continue;
      }
      const slug = await uniqueSlug(supabase, tenantId, slugify(fields.title) || "project", null, reserved);
      reserved.add(slug);
      const { data: created, error: insertError } = await supabase
        .from("projects")
        .insert({ ...fields, slug, tenant_id: tenantId, sort_order: order++ })
        .select("id")
        .single();
      if (insertError) {
        console.error("[importDraft] project", insertError);
        return { ok: false, error: PARTIAL("projects"), summary };
      }
      have.add(lower(fields.title));
      summary.projects++;
      const techs = await syncTechnologies(supabase, created.id, technologies);
      if (!techs.ok) return { ok: false, error: PARTIAL("project technologies"), summary };
    }
  }

  /* Skills: reuse the tenant's spelling of a category ("frontend" → "Frontend") */
  if (skills.length > 0) {
    const { data: existing, error } = await supabase.from("skills").select("name, category").eq("tenant_id", tenantId);
    if (error) return { ok: false, error: PARTIAL("skills"), summary };
    const categories = new Map(existing.map((s) => [lower(s.category), s.category as string]));
    const have = new Set(existing.map((s) => `${lower(s.category)}|${lower(s.name)}`));
    const rows: { name: string; category: string }[] = [];
    for (const r of skills) {
      const name = r.data!.names[0];
      const category = categories.get(lower(r.data!.category)) ?? r.data!.category;
      categories.set(lower(category), category);
      const id = `${lower(category)}|${lower(name)}`;
      if (have.has(id)) {
        summary.skipped++;
        continue;
      }
      have.add(id);
      rows.push({ name, category });
    }
    if (rows.length > 0) {
      const start = await nextSortOrder(supabase, "skills", tenantId);
      const { error: insertError } = await supabase
        .from("skills")
        .insert(rows.map((s, i) => ({ ...s, tenant_id: tenantId, sort_order: start + i })));
      if (insertError) {
        console.error("[importDraft] skills", insertError);
        return { ok: false, error: PARTIAL("skills"), summary };
      }
      summary.skills = rows.length;
    }
  }

  return { ok: true, summary };
}

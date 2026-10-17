import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminConfigured } from "@/lib/supabase/env";
import { SAVE_FAILED } from "@/lib/forms";

/**
 * Project write helpers shared by the project form (saveProject) and the
 * CV / interview import. Kept out of the "use server" actions file: anything
 * exported from there becomes callable from the browser.
 */

/** "My Cool App!" → "my-cool-app" */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** A free slug for this tenant: "app", then "app-2", "app-3"… `reserved` holds slugs claimed earlier in the same batch. */
export async function uniqueSlug(
  supabase: SupabaseClient,
  tenantId: string,
  base: string,
  exceptId: string | null,
  reserved: Set<string> = new Set()
) {
  const { data } = await supabase
    .from("projects")
    .select("id, slug")
    .eq("tenant_id", tenantId)
    .like("slug", `${base}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== exceptId).map((r) => r.slug as string));
  reserved.forEach((s) => taken.add(s));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Point the project at exactly these technologies. Names are matched
 * case-insensitively against the shared `technologies` table so "react" reuses
 * "React"; new names are created with the service role (the table is global).
 */
export async function syncTechnologies(
  supabase: SupabaseClient,
  projectId: string,
  names: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ids: string[] = [];
  const missing: string[] = [];

  const lookups = await Promise.all(
    names.map((name) => supabase.from("technologies").select("id").ilike("name", escapeLike(name)).limit(1))
  );
  lookups.forEach(({ data }, i) => (data?.[0] ? ids.push(data[0].id) : missing.push(names[i])));

  if (missing.length > 0) {
    if (!isAdminConfigured()) return { ok: false, error: "Adding new technologies isn't available right now." };
    const admin = createAdminClient();
    const { error } = await admin
      .from("technologies")
      .upsert(missing.map((name) => ({ name })), { onConflict: "name", ignoreDuplicates: true });
    if (error) return { ok: false, error: SAVE_FAILED };
    const { data: created, error: readError } = await admin.from("technologies").select("id").in("name", missing);
    if (readError) return { ok: false, error: SAVE_FAILED };
    ids.push(...created.map((t) => t.id as string));
  }

  const { data: current, error: currentError } = await supabase
    .from("project_technologies")
    .select("technology_id")
    .eq("project_id", projectId);
  if (currentError) return { ok: false, error: SAVE_FAILED };

  const have = new Set(current.map((r) => r.technology_id as string));
  const want = new Set(ids);
  const toRemove = [...have].filter((id) => !want.has(id));
  const toAdd = [...want].filter((id) => !have.has(id));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("project_technologies")
      .delete()
      .eq("project_id", projectId)
      .in("technology_id", toRemove);
    if (error) return { ok: false, error: SAVE_FAILED };
  }
  if (toAdd.length > 0) {
    const { error } = await supabase
      .from("project_technologies")
      .insert(toAdd.map((technology_id) => ({ project_id: projectId, technology_id })));
    if (error) return { ok: false, error: SAVE_FAILED };
  }
  return { ok: true };
}

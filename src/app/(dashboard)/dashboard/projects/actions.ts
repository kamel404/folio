"use server";

import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getActionTenant } from "@/lib/data/dashboard";
import {
  checkImage,
  imageFromForm,
  nextSortOrder,
  removeImage,
  reorderRows,
  revalidateTenant,
  uploadImage,
} from "@/lib/data/mutations";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminConfigured } from "@/lib/supabase/env";
import {
  PG_UNIQUE_VIOLATION,
  SAVE_FAILED,
  SESSION_EXPIRED,
  checked,
  fieldErrorsFrom,
  optionalText,
  optionalUrl,
  requiredText,
  text,
  type ActionResult,
  type FormState,
} from "@/lib/forms";

const MAX_TECHNOLOGIES = 20;
const PROJECT_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "My Cool App!" → "my-cool-app" */
function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

const projectSchema = z.object({
  title: requiredText("a title", 120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80, "Keep it under 80 characters.")
    .refine((v) => !v || PROJECT_SLUG.test(v), "Use lowercase letters, numbers and single hyphens."),
  short_description: requiredText("a short description", 200),
  description: optionalText(10000),
  category: requiredText("a category", 60),
  github_url: optionalUrl,
  live_url: optionalUrl,
  featured: z.boolean(),
  published: z.boolean(),
  technologies: z
    .string()
    .transform((v) => {
      // Comma-separated; trim, collapse spaces, drop case-insensitive duplicates
      const seen = new Set<string>();
      return v
        .split(",")
        .map((t) => t.trim().replace(/\s+/g, " "))
        .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
    })
    .refine((list) => list.length <= MAX_TECHNOLOGIES, `Add at most ${MAX_TECHNOLOGIES} technologies.`)
    .refine((list) => list.every((t) => t.length <= 40), "Each technology must be under 40 characters."),
});

/** A free slug for this tenant: "app", then "app-2", "app-3"… */
async function uniqueSlug(supabase: SupabaseClient, tenantId: string, base: string, exceptId: string | null) {
  const { data } = await supabase
    .from("projects")
    .select("id, slug")
    .eq("tenant_id", tenantId)
    .like("slug", `${base}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== exceptId).map((r) => r.slug as string));
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
async function syncTechnologies(
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

/**
 * Create (projectId = null) or update a project. Bound with the id on the
 * client: `saveProject.bind(null, id)`. Ownership is re-checked here — the id
 * is just a reference.
 */
export async function saveProject(projectId: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await getActionTenant();
  if (!ctx) return { error: SESSION_EXPIRED };
  const { supabase, tenant } = ctx;

  if (projectId !== null && !z.uuid().safeParse(projectId).success) {
    return { error: "This project no longer exists." };
  }

  const parsed = projectSchema.safeParse({
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    short_description: text(formData, "short_description"),
    description: text(formData, "description"),
    category: text(formData, "category"),
    github_url: text(formData, "github_url"),
    live_url: text(formData, "live_url"),
    featured: checked(formData, "featured"),
    published: checked(formData, "published"),
    technologies: text(formData, "technologies"),
  });
  const fieldErrors: Record<string, string> = parsed.success ? {} : fieldErrorsFrom(parsed.error);

  const image = imageFromForm(formData, "project_image");
  const imageError = image && checkImage(image);
  if (imageError) fieldErrors.project_image = imageError;

  if (!parsed.success || Object.keys(fieldErrors).length > 0) return { fieldErrors };
  const { technologies, ...fields } = parsed.data;

  // Existing row (edit): must belong to this tenant
  let existingImage: string | null = null;
  if (projectId) {
    const { data: existing, error } = await supabase
      .from("projects")
      .select("image_url")
      .eq("tenant_id", tenant.id)
      .eq("id", projectId)
      .maybeSingle<{ image_url: string | null }>();
    if (error) {
      console.error("[saveProject] read", error);
      return { error: SAVE_FAILED };
    }
    if (!existing) return { error: "This project no longer exists. It may have been deleted in another tab." };
    existingImage = existing.image_url;
  }

  // Slug: the user's choice must be free; a generated one is made free
  let slug = fields.slug;
  if (slug) {
    const { data: clash } = await supabase
      .from("projects")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("slug", slug)
      .neq("id", projectId ?? "00000000-0000-0000-0000-000000000000")
      .maybeSingle();
    if (clash) return { fieldErrors: { slug: "You already have a project with this URL name." } };
  } else {
    slug = await uniqueSlug(supabase, tenant.id, slugify(fields.title) || "project", projectId);
  }

  let imageUrl = existingImage;
  if (image) {
    const uploaded = await uploadImage(supabase, tenant.id, image, "project");
    if ("error" in uploaded) return { fieldErrors: { project_image: uploaded.error } };
    imageUrl = uploaded.url;
  } else if (formData.get("project_image_remove") === "on") {
    imageUrl = null;
  }

  const row = { ...fields, slug, image_url: imageUrl };
  const result = projectId
    ? await supabase.from("projects").update(row).eq("tenant_id", tenant.id).eq("id", projectId).select("id").single()
    : await supabase
        .from("projects")
        .insert({ ...row, tenant_id: tenant.id, sort_order: await nextSortOrder(supabase, "projects", tenant.id) })
        .select("id")
        .single();

  if (result.error) {
    if (image && imageUrl) await removeImage(supabase, tenant.id, imageUrl);
    if (result.error.code === PG_UNIQUE_VIOLATION) {
      return { fieldErrors: { slug: "You already have a project with this URL name." } };
    }
    console.error("[saveProject] write", result.error);
    return { error: SAVE_FAILED };
  }

  const savedId = result.data.id as string;
  const techResult = await syncTechnologies(supabase, savedId, technologies);

  if (imageUrl !== existingImage) await removeImage(supabase, tenant.id, existingImage);
  revalidateTenant(tenant.slug);

  if (!techResult.ok) {
    // The project itself saved — send them to it so they can retry the technologies
    return {
      success: projectId ? "Project saved, but its technologies weren't updated." : "Project created, but its technologies weren't saved.",
      redirectTo: `/dashboard/projects/${savedId}`,
    };
  }
  return {
    success: projectId ? "Project saved." : "Project created.",
    redirectTo: "/dashboard/projects",
  };
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  const { supabase, tenant } = ctx;
  if (!z.uuid().safeParse(projectId).success) return { ok: false, error: "This project no longer exists." };

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("tenant_id", tenant.id)
    .eq("id", projectId)
    .select("title, image_url");
  if (error) {
    console.error("[deleteProject]", error);
    return { ok: false, error: "Couldn't delete the project. Please try again." };
  }
  if (data.length === 0) return { ok: false, error: "This project was already deleted." };

  await removeImage(supabase, tenant.id, data[0].image_url as string | null);
  revalidateTenant(tenant.slug);
  return { ok: true };
}

export async function setProjectPublished(projectId: string, published: boolean): Promise<ActionResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  const { supabase, tenant } = ctx;
  if (!z.uuid().safeParse(projectId).success || typeof published !== "boolean") {
    return { ok: false, error: "This project no longer exists." };
  }

  const { data, error } = await supabase
    .from("projects")
    .update({ published })
    .eq("tenant_id", tenant.id)
    .eq("id", projectId)
    .select("id");
  if (error) {
    console.error("[setProjectPublished]", error);
    return { ok: false, error: "Couldn't update the project. Please try again." };
  }
  if (data.length === 0) return { ok: false, error: "This project no longer exists." };

  revalidateTenant(tenant.slug);
  return { ok: true };
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  const parsed = z.array(z.uuid()).max(500).safeParse(ids);
  if (!parsed.success) return { ok: false, error: "That order isn't valid. Refresh the page and try again." };

  const result = await reorderRows(ctx.supabase, "projects", ctx.tenant.id, parsed.data);
  if (result.ok) revalidateTenant(ctx.tenant.slug);
  return result;
}

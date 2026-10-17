"use server";

import { z } from "zod";
import { projectSchema } from "@/lib/validation";
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
import {
  slugify,
  syncTechnologies,
  uniqueSlug,
} from "@/lib/data/projects";
import {
  PG_UNIQUE_VIOLATION,
  SAVE_FAILED,
  SESSION_EXPIRED,
  checked,
  fieldErrorsFrom,
  text,
  type ActionResult,
  type FormState,
} from "@/lib/forms";

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

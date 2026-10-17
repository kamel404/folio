"use server";

import { z } from "zod";
import { addSchema, updateSchema } from "@/lib/validation";
import { getActionTenant } from "@/lib/data/dashboard";
import { nextSortOrder, reorderRows, revalidateTenant } from "@/lib/data/mutations";
import {
  SAVE_FAILED,
  SESSION_EXPIRED,
  fieldErrorsFrom,
  text,
  type ActionResult,
  type FormState,
} from "@/lib/forms";

/**
 * The category as already spelled by this tenant ("frontend" → "Frontend", so
 * case variants don't split into two groups) and the names already in it,
 * lower-cased, for duplicate checks.
 */
async function lookupCategory(
  supabase: NonNullable<Awaited<ReturnType<typeof getActionTenant>>>["supabase"],
  tenantId: string,
  categoryName: string,
  exceptId?: string
) {
  const { data, error } = await supabase
    .from("skills")
    .select("id, name, category")
    .eq("tenant_id", tenantId)
    .ilike("category", categoryName.replace(/[\\%_]/g, (c) => `\\${c}`));
  if (error) return null;
  const others = data.filter((s) => s.id !== exceptId);
  return {
    category: (others[0]?.category as string | undefined) ?? categoryName,
    names: new Set(others.map((s) => (s.name as string).toLowerCase())),
  };
}

/** Add one or more comma-separated skills to a category. Existing ones are skipped. */
export async function addSkills(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await getActionTenant();
  if (!ctx) return { error: SESSION_EXPIRED };
  const { supabase, tenant } = ctx;

  const parsed = addSchema.safeParse({ names: text(formData, "names"), category: text(formData, "category") });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };
  const { names } = parsed.data;

  const existing = await lookupCategory(supabase, tenant.id, parsed.data.category);
  if (!existing) return { error: SAVE_FAILED };
  const categoryName = existing.category;
  const fresh = names.filter((n) => !existing.names.has(n.toLowerCase()));
  if (fresh.length === 0) {
    return {
      fieldErrors: {
        names: names.length === 1 ? `“${names[0]}” is already in ${categoryName}.` : `All of these are already in ${categoryName}.`,
      },
    };
  }

  const start = await nextSortOrder(supabase, "skills", tenant.id);
  const { error } = await supabase
    .from("skills")
    .insert(fresh.map((name, i) => ({ tenant_id: tenant.id, name, category: categoryName, sort_order: start + i })));
  if (error) {
    console.error("[addSkills]", error);
    return { error: SAVE_FAILED };
  }

  revalidateTenant(tenant.slug);
  const skipped = names.length - fresh.length;
  const added = fresh.length === 1 ? `Added “${fresh[0]}”.` : `Added ${fresh.length} skills.`;
  return { success: skipped > 0 ? `${added} Skipped ${skipped} already in ${categoryName}.` : added };
}

export async function updateSkill(skillId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await getActionTenant();
  if (!ctx) return { error: SESSION_EXPIRED };
  const { supabase, tenant } = ctx;
  if (!z.uuid().safeParse(skillId).success) return { error: "This skill no longer exists." };

  const parsed = updateSchema.safeParse({ name: text(formData, "name"), category: text(formData, "category") });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const existing = await lookupCategory(supabase, tenant.id, parsed.data.category, skillId);
  if (!existing) return { error: SAVE_FAILED };
  if (existing.names.has(parsed.data.name.toLowerCase())) {
    return { fieldErrors: { name: `“${parsed.data.name}” is already in ${existing.category}.` } };
  }

  const { data, error } = await supabase
    .from("skills")
    .update({ name: parsed.data.name, category: existing.category })
    .eq("tenant_id", tenant.id)
    .eq("id", skillId)
    .select("id");
  if (error) {
    console.error("[updateSkill]", error);
    return { error: SAVE_FAILED };
  }
  if (data.length === 0) return { error: "This skill no longer exists. It may have been deleted in another tab." };

  revalidateTenant(tenant.slug);
  return { success: "Skill saved." };
}

export async function deleteSkill(skillId: string): Promise<ActionResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  if (!z.uuid().safeParse(skillId).success) return { ok: false, error: "This skill no longer exists." };

  const { data, error } = await ctx.supabase
    .from("skills")
    .delete()
    .eq("tenant_id", ctx.tenant.id)
    .eq("id", skillId)
    .select("id");
  if (error) {
    console.error("[deleteSkill]", error);
    return { ok: false, error: "Couldn't delete the skill. Please try again." };
  }
  if (data.length === 0) return { ok: false, error: "This skill was already deleted." };

  revalidateTenant(ctx.tenant.slug);
  return { ok: true };
}

/** Reorder the skills of one category (ids = that category's skills in their new order). */
export async function reorderSkills(ids: string[]): Promise<ActionResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  const parsed = z.array(z.uuid()).max(500).safeParse(ids);
  if (!parsed.success) return { ok: false, error: "That order isn't valid. Refresh the page and try again." };

  const result = await reorderRows(ctx.supabase, "skills", ctx.tenant.id, parsed.data);
  if (result.ok) revalidateTenant(ctx.tenant.slug);
  return result;
}

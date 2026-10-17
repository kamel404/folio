"use server";

import { z } from "zod";
import { experienceSchema } from "@/lib/validation";
import { getActionTenant } from "@/lib/data/dashboard";
import { nextSortOrder, reorderRows, revalidateTenant } from "@/lib/data/mutations";
import {
  SAVE_FAILED,
  SESSION_EXPIRED,
  checked,
  fieldErrorsFrom,
  text,
  type ActionResult,
  type FormState,
} from "@/lib/forms";

export async function saveExperience(
  experienceId: string | null,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getActionTenant();
  if (!ctx) return { error: SESSION_EXPIRED };
  const { supabase, tenant } = ctx;

  if (experienceId !== null && !z.uuid().safeParse(experienceId).success) {
    return { error: "This role no longer exists." };
  }

  const parsed = experienceSchema.safeParse({
    company: text(formData, "company"),
    position: text(formData, "position"),
    description: text(formData, "description"),
    start_date: text(formData, "start_date"),
    end_date: text(formData, "end_date"),
    current: checked(formData, "current"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const result = experienceId
    ? await supabase
        .from("experiences")
        .update(parsed.data)
        .eq("tenant_id", tenant.id)
        .eq("id", experienceId)
        .select("id")
    : await supabase
        .from("experiences")
        .insert({
          ...parsed.data,
          tenant_id: tenant.id,
          sort_order: await nextSortOrder(supabase, "experiences", tenant.id),
        })
        .select("id");

  if (result.error) {
    console.error("[saveExperience]", result.error);
    return { error: SAVE_FAILED };
  }
  if (result.data.length === 0) {
    return { error: "This role no longer exists. It may have been deleted in another tab." };
  }

  revalidateTenant(tenant.slug);
  return {
    success: experienceId ? "Role saved." : "Role added.",
    redirectTo: "/dashboard/experience",
  };
}

export async function deleteExperience(experienceId: string): Promise<ActionResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  if (!z.uuid().safeParse(experienceId).success) return { ok: false, error: "This role no longer exists." };

  const { data, error } = await ctx.supabase
    .from("experiences")
    .delete()
    .eq("tenant_id", ctx.tenant.id)
    .eq("id", experienceId)
    .select("id");
  if (error) {
    console.error("[deleteExperience]", error);
    return { ok: false, error: "Couldn't delete the role. Please try again." };
  }
  if (data.length === 0) return { ok: false, error: "This role was already deleted." };

  revalidateTenant(ctx.tenant.slug);
  return { ok: true };
}

export async function reorderExperiences(ids: string[]): Promise<ActionResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  const parsed = z.array(z.uuid()).max(500).safeParse(ids);
  if (!parsed.success) return { ok: false, error: "That order isn't valid. Refresh the page and try again." };

  const result = await reorderRows(ctx.supabase, "experiences", ctx.tenant.id, parsed.data);
  if (result.ok) revalidateTenant(ctx.tenant.slug);
  return result;
}

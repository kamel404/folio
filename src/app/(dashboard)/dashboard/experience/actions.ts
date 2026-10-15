"use server";

import { z } from "zod";
import { getActionTenant } from "@/lib/data/dashboard";
import { nextSortOrder, reorderRows, revalidateTenant } from "@/lib/data/mutations";
import {
  SAVE_FAILED,
  SESSION_EXPIRED,
  checked,
  fieldErrorsFrom,
  requiredText,
  text,
  type ActionResult,
  type FormState,
} from "@/lib/forms";

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

const month = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${label}.`)
    .regex(MONTH, "Use the format YYYY-MM, e.g. 2023-09.")
    .refine((v) => {
      const year = Number(v.slice(0, 4));
      return year >= 1950 && year <= new Date().getFullYear() + 1;
    }, "Enter a realistic date.");

const experienceSchema = z
  .object({
    company: requiredText("the company", 120),
    position: requiredText("your role", 120),
    description: requiredText("a description", 5000),
    start_date: month("start date"),
    current: z.boolean(),
    end_date: z.string().trim(),
  })
  .superRefine((v, ctx) => {
    if (v.current) return;
    const end = month("end date").safeParse(v.end_date);
    if (!end.success) {
      ctx.addIssue({ code: "custom", path: ["end_date"], message: end.error.issues[0].message });
    } else if (MONTH.test(v.start_date) && end.data < v.start_date) {
      // "YYYY-MM" strings compare correctly as text
      ctx.addIssue({ code: "custom", path: ["end_date"], message: "The end date can't be before the start date." });
    }
  })
  .transform((v) => ({ ...v, end_date: v.current ? null : v.end_date }));

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

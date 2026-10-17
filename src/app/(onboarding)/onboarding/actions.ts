"use server";

import { redirect } from "next/navigation";
import { getActionTenant } from "@/lib/data/dashboard";
import { revalidateTenant } from "@/lib/data/mutations";
import { SAVE_FAILED, SESSION_EXPIRED, fieldErrorsFrom, text, type ActionResult, type FormState } from "@/lib/forms";
import { palettes } from "@/lib/themes/palettes";
import { profileSchema } from "@/lib/validation";
import type { OnboardingState } from "@/types";

const basicsSchema = profileSchema.pick({ name: true, title: true });

/** Step 1: name and headline (the rest of the profile is left alone). */
export async function saveBasics(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await getActionTenant();
  if (!ctx) return { error: SESSION_EXPIRED };

  const parsed = basicsSchema.safeParse({ name: text(formData, "name"), title: text(formData, "title") });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const { error } = await ctx.supabase.from("profiles").update(parsed.data).eq("tenant_id", ctx.tenant.id);
  if (error) {
    console.error("[saveBasics]", error);
    return { error: SAVE_FAILED };
  }
  revalidateTenant(ctx.tenant.slug);
  return { success: "Saved." };
}

/** `onboarding` is the one tenants column a user may change (column grant in schema.sql). */
async function setState(state: OnboardingState): Promise<ActionResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  const { error } = await ctx.supabase.from("tenants").update({ onboarding: state }).eq("id", ctx.tenant.id);
  if (error) {
    console.error("[onboarding]", error);
    return { ok: false, error: SAVE_FAILED };
  }
  return { ok: true };
}

export async function startOnboarding(): Promise<ActionResult> {
  return setState("in_progress");
}

export async function completeOnboarding(): Promise<ActionResult> {
  return setState("completed");
}

/** "Skip setup" (a form in the header): straight to the dashboard, never shown again. */
export async function skipOnboarding(): Promise<void> {
  const result = await setState("completed");
  redirect(result.ok ? "/dashboard" : "/onboarding?error=skip");
}

/** Theme step: a preset palette (custom colours and fonts live on the Theme page). */
export async function savePalette(paletteId: unknown): Promise<ActionResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  if (typeof paletteId !== "string" || !palettes.some((p) => p.id === paletteId)) {
    return { ok: false, error: "Choose one of the palettes." };
  }
  const { data, error } = await ctx.supabase
    .from("theme_configs")
    .update({ palette_id: paletteId, custom_colors: null })
    .eq("tenant_id", ctx.tenant.id)
    .select("tenant_id");
  if (error || data.length === 0) {
    console.error("[savePalette]", error ?? "no theme_configs row");
    return { ok: false, error: SAVE_FAILED };
  }
  revalidateTenant(ctx.tenant.slug);
  return { ok: true };
}

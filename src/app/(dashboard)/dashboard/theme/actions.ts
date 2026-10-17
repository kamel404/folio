"use server";

import { z } from "zod";
import { getActionTenant } from "@/lib/data/dashboard";
import { revalidateTenant } from "@/lib/data/mutations";
import { SAVE_FAILED, SESSION_EXPIRED, checked, fieldErrorsFrom, text, type FormState } from "@/lib/forms";
import { FONT_NAMES } from "@/lib/themes/fonts";
import { COLOR_KEYS, getPalette, isHexColor, palettes } from "@/lib/themes/palettes";

const themeSchema = z.object({
  palette_id: z.enum(
    palettes.map((p) => p.id) as [string, ...string[]],
    "Choose one of the palettes."
  ),
  font_heading: z.enum(FONT_NAMES, "Choose one of the typefaces."),
  font_body: z.enum(FONT_NAMES, "Choose one of the typefaces."),
});

export async function saveTheme(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await getActionTenant();
  if (!ctx) return { error: SESSION_EXPIRED };
  const { supabase, tenant } = ctx;

  const parsed = themeSchema.safeParse({
    palette_id: text(formData, "palette_id"),
    font_heading: text(formData, "font_heading"),
    font_body: text(formData, "font_body"),
  });
  const fieldErrors: Record<string, string> = parsed.success ? {} : fieldErrorsFrom(parsed.error);

  // Custom colours: only the ones that differ from the chosen palette are stored
  let customColors: Record<string, string> | null = null;
  if (checked(formData, "customize")) {
    const base = getPalette(text(formData, "palette_id")).colors;
    const overrides: Record<string, string> = {};
    for (const key of COLOR_KEYS) {
      const value = text(formData, `color_${key}`).trim().toUpperCase();
      if (!isHexColor(value)) {
        fieldErrors[`color_${key}`] = "Use a hex colour like #1F2937.";
      } else if (value !== base[key].toUpperCase()) {
        overrides[key] = value;
      }
    }
    if (Object.keys(overrides).length > 0) customColors = overrides;
  }

  if (!parsed.success || Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const { data, error } = await supabase
    .from("theme_configs")
    .update({ ...parsed.data, custom_colors: customColors, show_photo: checked(formData, "show_photo") })
    .eq("tenant_id", tenant.id)
    .select("tenant_id");

  if (error || data.length === 0) {
    console.error("[saveTheme]", error ?? "no theme_configs row");
    return { error: SAVE_FAILED };
  }

  revalidateTenant(tenant.slug);
  return { success: "Theme saved." };
}

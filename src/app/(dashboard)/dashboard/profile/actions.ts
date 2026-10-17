"use server";

import { profileSchema } from "@/lib/validation";
import { getActionTenant } from "@/lib/data/dashboard";
import { checkImage, imageFromForm, removeImage, revalidateTenant, uploadImage } from "@/lib/data/mutations";
import {
  SAVE_FAILED,
  SESSION_EXPIRED,
  fieldErrorsFrom,
  text,
  type FormState,
} from "@/lib/forms";

const FIELDS = [
  "name",
  "title",
  "short_bio",
  "long_bio",
  "email",
  "phone",
  "location",
  "availability_status",
  "linkedin_url",
  "github_url",
  "cv_url",
] as const;

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await getActionTenant();
  if (!ctx) return { error: SESSION_EXPIRED };
  const { supabase, tenant } = ctx;

  const parsed = profileSchema.safeParse(Object.fromEntries(FIELDS.map((f) => [f, text(formData, f)])));
  const fieldErrors: Record<string, string> = parsed.success ? {} : fieldErrorsFrom(parsed.error);

  const image = imageFromForm(formData, "profile_image");
  const imageError = image && checkImage(image);
  if (imageError) fieldErrors.profile_image = imageError;

  if (!parsed.success || Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // Current image, so it can be cleaned up after a replace / remove
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("profile_image_url")
    .eq("tenant_id", tenant.id)
    .maybeSingle<{ profile_image_url: string | null }>();
  if (readError || !existing) {
    console.error("[updateProfile] read", readError);
    return { error: SAVE_FAILED };
  }

  let imageUrl = existing.profile_image_url;
  if (image) {
    const uploaded = await uploadImage(supabase, tenant.id, image, "avatar");
    if ("error" in uploaded) return { fieldErrors: { profile_image: uploaded.error } };
    imageUrl = uploaded.url;
  } else if (formData.get("profile_image_remove") === "on") {
    imageUrl = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, profile_image_url: imageUrl })
    .eq("tenant_id", tenant.id);

  if (error) {
    console.error("[updateProfile] update", error);
    if (image && imageUrl) await removeImage(supabase, tenant.id, imageUrl); // don't orphan the new upload
    return { error: SAVE_FAILED };
  }

  if (imageUrl !== existing.profile_image_url) {
    await removeImage(supabase, tenant.id, existing.profile_image_url);
  }

  revalidateTenant(tenant.slug);
  return { success: "Profile saved." };
}

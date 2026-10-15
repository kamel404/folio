import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared write helpers for dashboard Server Actions. Callers must already
 * have resolved the tenant from the session (getActionTenant) — these
 * helpers trust the tenantId they're given.
 */

type OrderedTable = "projects" | "experiences" | "skills";

/** Refresh the dashboard (sidebar counts/names) and the tenant's public site. */
export function revalidateTenant(slug: string) {
  revalidatePath("/dashboard", "layout");
  revalidatePath(`/sites/${slug}`, "layout");
}

/** sort_order for a new row: after everything that's already there. */
export async function nextSortOrder(supabase: SupabaseClient, table: OrderedTable, tenantId: string) {
  const { data } = await supabase
    .from(table)
    .select("sort_order")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();
  return (data?.sort_order ?? -1) + 1;
}

/**
 * Persist a new order. `ids` must be exactly the tenant's rows (or a subset,
 * e.g. one skill category) — anything else is rejected so a forged request
 * can't touch rows it doesn't own. Only rows whose position changed are written.
 */
export async function reorderRows(
  supabase: SupabaseClient,
  table: OrderedTable,
  tenantId: string,
  ids: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (ids.length === 0 || new Set(ids).size !== ids.length) {
    return { ok: false, error: "That order isn't valid. Refresh the page and try again." };
  }

  const { data: rows, error } = await supabase
    .from(table)
    .select("id, sort_order")
    .eq("tenant_id", tenantId)
    .in("id", ids);
  if (error) return { ok: false, error: "Couldn't save the new order. Please try again." };
  if (rows.length !== ids.length) {
    return { ok: false, error: "Some items changed in another tab. Refresh the page and try again." };
  }

  // Reuse the slots these rows already occupy, so ordering a subset leaves the rest in place
  const slots = rows.map((r) => r.sort_order as number).sort((a, b) => a - b);
  // Duplicate slots (rows that were never ordered) would make the new order ambiguous: spread them out
  const unique = new Set(slots).size === slots.length;
  const current = new Map(rows.map((r) => [r.id as string, r.sort_order as number]));

  const updates = ids
    .map((id, i) => ({ id, sort_order: unique ? slots[i] : slots[0] + i }))
    .filter((u) => current.get(u.id) !== u.sort_order);

  const results = await Promise.all(
    updates.map((u) =>
      supabase.from(table).update({ sort_order: u.sort_order }).eq("tenant_id", tenantId).eq("id", u.id)
    )
  );
  if (results.some((r) => r.error)) {
    return { ok: false, error: "Couldn't save the new order. Please try again." };
  }
  return { ok: true };
}

/* ─── Images (bucket: portfolio-images, path: {tenant_id}/…) ─── */

const BUCKET = "portfolio-images";
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Identify the image from its first bytes — the browser-supplied MIME type can't be trusted. */
function sniffImage(bytes: Uint8Array): { ext: string; type: string } | null {
  const at = (i: number) => bytes[i];
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (at(0) === 0x89 && at(1) === 0x50 && at(2) === 0x4e && at(3) === 0x47) return { ext: "png", type: "image/png" };
  if (at(0) === 0x47 && at(1) === 0x49 && at(2) === 0x46 && at(3) === 0x38) return { ext: "gif", type: "image/gif" };
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  return null;
}

/** The uploaded file from a form field, or null when none was chosen. */
export function imageFromForm(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

/** Validate without uploading, so field errors can be reported alongside the others. */
export function checkImage(file: File): string | null {
  if (file.size > MAX_IMAGE_BYTES) return "Images must be 4 MB or smaller.";
  return null;
}

export async function uploadImage(
  supabase: SupabaseClient,
  tenantId: string,
  file: File,
  prefix: string
): Promise<{ url: string } | { error: string }> {
  const sizeError = checkImage(file);
  if (sizeError) return { error: sizeError };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);
  if (!kind) return { error: "Use a JPG, PNG, WebP or GIF image." };

  const path = `${tenantId}/${prefix}-${crypto.randomUUID()}.${kind.ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: kind.type, cacheControl: "31536000", upsert: false });
  if (error) {
    console.error("[uploadImage]", error);
    return { error: "Couldn't upload the image. Please try again." };
  }
  return { url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

/**
 * Best-effort delete of a previously uploaded image. Only touches files inside
 * the tenant's own folder of our bucket; external URLs are ignored. Failures are
 * logged, not surfaced — an orphaned file must never block a save.
 */
export async function removeImage(supabase: SupabaseClient, tenantId: string, url: string | null) {
  if (!url) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return;
  const path = decodeURIComponent(url.slice(at + marker.length));
  if (!path.startsWith(`${tenantId}/`)) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("[removeImage]", error);
}

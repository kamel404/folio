import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminConfigured } from "@/lib/supabase/env";
import { normalizeSlug, validateSlug } from "@/lib/utils/slug";

/**
 * GET /api/tenant/check-slug?slug=lina
 * → { available: true | false | null, reason?: string }
 * `null` means "couldn't check" (e.g. Supabase not configured yet); the
 * database unique constraint is the final authority at signup.
 */
export async function GET(request: NextRequest) {
  const slug = normalizeSlug(request.nextUrl.searchParams.get("slug") ?? "");

  const check = validateSlug(slug);
  if (!check.ok) return NextResponse.json({ available: false, reason: check.reason });

  if (!isAdminConfigured()) {
    return NextResponse.json({ available: null, reason: "not_configured" });
  }

  const { data, error } = await createAdminClient()
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return NextResponse.json({ available: null, reason: "lookup_failed" });
  return NextResponse.json({ available: !data });
}

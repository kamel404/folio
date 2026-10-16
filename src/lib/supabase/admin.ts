import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { taggedFetch } from "@/lib/supabase/public";

/**
 * Service-role client. BYPASSES Row Level Security.
 * Server-side only — never import this from a Client Component, and never
 * return its raw results to the browser without selecting specific columns.
 * Used for: slug availability, public portfolio lookup, webhooks, admin panel.
 *
 * Pass `cacheTags` only for public-site reads: responses are then cached
 * (see taggedFetch). Every other use must stay uncached.
 */
export function createAdminClient(options: { cacheTags?: string[] } = {}) {
  const env = getSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env || !serviceKey) {
    throw new Error("Supabase admin client is not configured (missing SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createSupabaseClient(env.url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(options.cacheTags && { global: { fetch: taggedFetch(options.cacheTags) } }),
  });
}

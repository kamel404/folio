import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** The public portfolio's ISR revalidation window, in seconds (pages and their data). */
export const SITE_REVALIDATE = 60;

/** Cache tag on every public read of one tenant's site. Expire it to refresh all its pages. */
export function siteTag(slug: string): string {
  return `site:${slug}`;
}

/**
 * fetch for Supabase clients used on the public site: responses go into the
 * Next data cache under the given tags, so one updateTag()/revalidateTag()
 * refreshes every page that read them (home, project pages, cached 404s).
 */
export function taggedFetch(tags: string[]): typeof fetch {
  return (input, init) => fetch(input, { ...init, cache: "force-cache", next: { tags, revalidate: SITE_REVALIDATE } });
}

/**
 * Anonymous client with no cookies — reads exactly what a logged-out visitor
 * may read under RLS (live tenants only, published projects only). Used for
 * the public portfolio, which is ISR-cached and so must not touch cookies.
 */
export function createPublicClient(tags: string[]) {
  const env = getSupabaseEnv();
  if (!env) throw new Error("Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_* env vars).");
  return createSupabaseClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: taggedFetch(tags) },
  });
}

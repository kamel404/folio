import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

/** Supabase client for Client Components. */
export function createClient() {
  const env = getSupabaseEnv();
  if (!env) throw new Error("Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_* env vars).");
  return createBrowserClient(env.url, env.anonKey);
}

import { cache } from "react";
import { isAuthApiError, isAuthSessionMissingError, type AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/env";
import type { CurrentTenant, Tenant } from "@/types";

const TENANT_COLUMNS = "id, slug, plan, active, onboarding, custom_domain";

/** No session, or a token the Auth server rejects (expired, revoked, user deleted). */
function isSignedOutError(error: AuthError): boolean {
  return isAuthSessionMissingError(error) || (isAuthApiError(error) && [401, 403].includes(error.status));
}

/**
 * The signed-in user and their tenant, or null. Cached per request so the
 * dashboard layout and page share one round trip. Uses getUser() (verified
 * against the Auth server), not the cookie contents.
 */
export const getCurrentTenant = cache(async (): Promise<CurrentTenant | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  // Only a missing/invalid session means "signed out". Anything else (network
  // blip, Auth outage) must not look like a logout: it surfaces as an error
  // the user can retry, instead of bouncing them to /login.
  if (authError && !isSignedOutError(authError)) throw authError;
  if (!user) return null;

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select(TENANT_COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle<Tenant>();
  if (tenantError) throw new Error(`Could not load your account: ${tenantError.message}`);
  if (!tenant) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("tenant_id", tenant.id)
    .maybeSingle<{ name: string }>();

  return {
    user: { id: user.id, email: user.email ?? "" },
    tenant,
    name: profile?.name ?? user.email?.split("@")[0] ?? "there",
  };
});

/** Public lookup by subdomain (service role — tenants aren't publicly readable). */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (!isAdminConfigured()) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("tenants")
    .select(TENANT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle<Tenant>();
  return data;
}

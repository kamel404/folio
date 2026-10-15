/**
 * Tenant slugs become subdomains (slug.getfolio.dev), so they must be valid
 * DNS labels and must never collide with platform subdomains.
 * Keep RESERVED_SLUGS in sync with supabase/schema.sql (handle_new_user).
 */

export const RESERVED_SLUGS: readonly string[] = [
  "www", "app", "api", "admin", "dashboard", "mail", "smtp", "ftp",
  "blog", "docs", "help", "support", "status", "cdn", "assets",
  "staging", "dev", "test", "beta", "demo",
  "folio", "getfolio", "login", "signup", "pricing", "sites",
];

// 3–50 chars, lowercase letters / digits / hyphens, no leading or trailing hyphen
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export function normalizeSlug(input: string): string {
  return input.trim().toLowerCase();
}

export type SlugCheck = { ok: true } | { ok: false; reason: string };

export function validateSlug(slug: string): SlugCheck {
  if (slug.length < 3) return { ok: false, reason: "Use at least 3 characters." };
  if (slug.length > 50) return { ok: false, reason: "Use 50 characters or fewer." };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { ok: false, reason: "Use lowercase letters, numbers and hyphens only." };
  }
  if (slug.startsWith("-") || slug.endsWith("-")) {
    return { ok: false, reason: "Can't start or end with a hyphen." };
  }
  if (!SLUG_PATTERN.test(slug)) return { ok: false, reason: "That address isn't valid." };
  if (RESERVED_SLUGS.includes(slug)) return { ok: false, reason: "That address is reserved." };
  return { ok: true };
}

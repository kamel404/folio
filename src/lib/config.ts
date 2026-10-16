/** Root domain tenants live under, e.g. "getfolio.dev" (or "localhost:3000" in dev). */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "getfolio.dev";

/** Origin used in links we put in emails. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const PROTOCOL = ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";

/** The Folio main site, e.g. "https://getfolio.dev". */
export const PLATFORM_URL = `${PROTOCOL}://${ROOT_DOMAIN}`;

/** A tenant's public portfolio, e.g. "https://lina.getfolio.dev". */
export function tenantUrl(slug: string): string {
  return `${PROTOCOL}://${slug}.${ROOT_DOMAIN}`;
}

export const NOT_CONFIGURED_MESSAGE =
  "Folio isn't connected to Supabase yet. Add your keys to .env.local (see .env.example) and restart the dev server.";

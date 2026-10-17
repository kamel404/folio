import { NextResponse, type NextRequest } from "next/server";
import { RESERVED_SLUGS } from "@/lib/utils/slug";
import { redirectWithCookies, updateSession } from "@/lib/supabase/proxy";

/**
 * Next 16 "proxy" (formerly middleware):
 *   1. Tenant subdomains  lina.getfolio.dev/x  → rewritten to /sites/lina/x
 *   2. Auth guard         /dashboard, /onboarding and /preview need a session; /login & /signup bounce signed-in users
 */

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "getfolio.dev").toLowerCase();

function tenantSlugFromHost(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  const root = ROOT_DOMAIN.split(":")[0];

  if (hostname === root || hostname === `www.${root}`) return null;
  if (!hostname.endsWith(`.${root}`)) return null; // e.g. *.vercel.app previews

  const sub = hostname.slice(0, -(root.length + 1));
  if (!sub || sub.includes(".")) return null;
  return RESERVED_SLUGS.includes(sub) ? null : sub;
}

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];
/** Need a session: the dashboard, onboarding and the owner's private portfolio preview. */
const PROTECTED = ["/dashboard", "/onboarding", "/preview"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const slug = tenantSlugFromHost(request.headers.get("host") ?? "");

  // 1 ── Tenant portfolio request
  if (slug) {
    const url = request.nextUrl.clone();
    url.pathname = `/sites/${slug}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // The rewrite target must not be reachable directly on the main domain
  if (pathname === "/sites" || pathname.startsWith("/sites/")) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  // 2 ── Auth guard (main domain only)
  const { response, signedIn } = await updateSession(request);

  // Server Action POSTs are let through: a redirect would reach the client as an
  // unreadable response. Every action checks the session itself and answers
  // "session expired" in a form the UI can show.
  const isServerAction = request.method === "POST" && request.headers.has("next-action");

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !signedIn && !isServerAction) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return redirectWithCookies(login, response);
  }

  if (AUTH_PAGES.includes(pathname) && signedIn) {
    return redirectWithCookies(new URL("/dashboard", request.url), response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

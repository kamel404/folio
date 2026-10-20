import { tenantUrl } from "@/lib/config";
import { getSite } from "@/lib/data/portfolio";

/**
 * slug.getfolio.dev/robots.txt (the proxy rewrites it here; app/robots.ts
 * only answers on the main domain). Live portfolios are open to crawlers and
 * point at their own sitemap; offline and unclaimed addresses are closed.
 */
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export async function GET(_request: Request, { params }: RouteContext<"/sites/[slug]/robots.txt">) {
  const { slug } = await params;
  const site = await getSite(slug);

  const body =
    site.status === "live"
      ? `User-Agent: *\nAllow: /\n\nSitemap: ${tenantUrl(site.tenant.slug)}/sitemap.xml\n`
      : "User-Agent: *\nDisallow: /\n";

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

import { tenantUrl } from "@/lib/config";
import { getSite } from "@/lib/data/portfolio";

/**
 * slug.getfolio.dev/sitemap.xml: the home page and every published project.
 * A sitemap may only list URLs on its own host, so each portfolio has its
 * own; app/sitemap.ts covers the main domain.
 */
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET(_request: Request, { params }: RouteContext<"/sites/[slug]/sitemap.xml">) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (site.status !== "live") return new Response("Not found", { status: 404 });

  const base = tenantUrl(site.tenant.slug);
  const urls = [base, ...site.content.projects.map((p) => `${base}/projects/${p.slug}`)];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>\n`).join("") +
    `</urlset>\n`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}

import { getSite } from "@/lib/data/portfolio";
import { siteIcon } from "@/lib/site-icon";

/** slug.getfolio.dev/site-icon — the portfolio's monogram icon. Live sites only. */
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export async function GET(_request: Request, { params }: RouteContext<"/sites/[slug]/site-icon">) {
  const { slug } = await params;
  const site = await getSite(slug);
  // Offline and unclaimed addresses reveal nothing, not even an initial
  if (site.status !== "live") return new Response("Not found", { status: 404 });
  return siteIcon(site.tenant.slug, site.content);
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioOffline } from "@/components/portfolio/portfolio-offline";
import { PortfolioHome } from "@/components/portfolio/portfolio-page";
import { getSite } from "@/lib/data/portfolio";
import { hiddenMetadata, portfolioMetadata } from "@/lib/seo";

/**
 * A tenant's public portfolio. Cached for 60s (ISR); dashboard saves also
 * revalidate it immediately (revalidateTenant in lib/data/mutations.ts).
 */
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/sites/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite(slug);
  if (site.status === "missing") return hiddenMetadata("Not found");
  // Never advertise unpublished portfolios
  if (site.status === "offline") return hiddenMetadata("Offline");
  return portfolioMetadata(site.tenant.slug, site.content);
}

export default async function SitePage({ params }: PageProps<"/sites/[slug]">) {
  const { slug } = await params;
  const site = await getSite(slug);

  if (site.status === "missing") notFound();
  if (site.status === "offline") return <PortfolioOffline />;
  return <PortfolioHome content={site.content} base="" />;
}

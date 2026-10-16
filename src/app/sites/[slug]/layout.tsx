import { PortfolioTheme } from "@/components/portfolio/portfolio-theme";
import { getSite } from "@/lib/data/portfolio";

/**
 * Tenant site shell. proxy.ts rewrites  slug.getfolio.dev/*  →  /sites/slug/*
 * (this route is not reachable on the main domain).
 *
 * Injects the live tenant's palette so everything below — pages, 404s and
 * the error screen — is themed. Unknown and offline addresses keep the
 * platform look and reveal nothing about the owner.
 */

// ISR: every address renders on first visit, then is cached (see page revalidate)
export function generateStaticParams() {
  return [];
}

export default async function SiteLayout({ children, params }: LayoutProps<"/sites/[slug]">) {
  const { slug } = await params;
  // A failed read is left to the page, whose error.tsx sits inside this layout
  const site = await getSite(slug).catch(() => null);

  return (
    <>
      {site?.status === "live" && <PortfolioTheme theme={site.content.theme} />}
      {children}
    </>
  );
}

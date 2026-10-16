import Link from "next/link";
import { PortfolioContainer, portfolioButton, portfolioHref, type PortfolioBase } from "@/components/portfolio/portfolio-ui";

/**
 * 404 inside a portfolio (unknown project or path). Themed by the layout's
 * palette, but without navbar/footer: not-found files don't get route params,
 * so there is no profile to show.
 */
function PortfolioNotFound({ base }: { base: PortfolioBase }) {
  return (
    <main className="portfolio flex flex-1 items-center py-24">
      <PortfolioContainer>
        <p className="font-mono text-sm text-[var(--accent-dark)]">404</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">Page not found.</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-[var(--text-muted)]">
          This page doesn&apos;t exist, or it has been taken down.
        </p>
        <Link href={portfolioHref.home(base)} className={`${portfolioButton.primary} mt-8`}>
          Back to the portfolio
        </Link>
      </PortfolioContainer>
    </main>
  );
}

export { PortfolioNotFound };

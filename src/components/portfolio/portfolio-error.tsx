"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { PortfolioContainer, portfolioButton } from "@/components/portfolio/portfolio-ui";

/** Error boundary body for the public site and the preview. Never shows internals. */
function PortfolioError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="portfolio flex flex-1 items-center py-24">
      <PortfolioContainer>
        <p className="font-mono text-sm text-[var(--accent-dark)]">Error</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">This page didn&apos;t load.</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-[var(--text-muted)]">
          Something went wrong on our side. It&apos;s usually temporary, so trying again often works.
        </p>
        <button type="button" onClick={() => retry()} className={`${portfolioButton.primary} mt-8 cursor-pointer`}>
          <RotateCcw size={16} aria-hidden />
          Try again
        </button>
        {error.digest && (
          <p className="mt-10 font-mono text-xs text-[var(--text-muted)]">Reference: {error.digest}</p>
        )}
      </PortfolioContainer>
    </main>
  );
}

export { PortfolioError };

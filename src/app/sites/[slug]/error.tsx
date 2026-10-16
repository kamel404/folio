"use client";

import { PortfolioError } from "@/components/portfolio/portfolio-error";

/** A read failed on first render. (During ISR revalidation the last good page keeps being served.) */
export default function SiteError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <PortfolioError {...props} />;
}

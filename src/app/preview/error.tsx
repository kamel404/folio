"use client";

import { PortfolioError } from "@/components/portfolio/portfolio-error";

export default function PreviewError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <PortfolioError {...props} />;
}

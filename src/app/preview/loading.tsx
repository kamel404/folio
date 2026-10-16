import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioContainer } from "@/components/portfolio/portfolio-ui";

/** Shown while the preview streams in (matches navbar + hero). */
export default function PreviewLoading() {
  return (
    <div role="status" aria-label="Loading preview" className="flex-1">
      <div className="border-b border-[var(--border)]">
        <PortfolioContainer className="flex h-16 items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="hidden h-4 w-72 md:block" />
        </PortfolioContainer>
      </div>
      <PortfolioContainer className="py-16 sm:py-24">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="mt-6 h-14 w-96 max-w-full" />
        <Skeleton className="mt-4 h-6 w-64 max-w-full" />
        <Skeleton className="mt-8 h-4 w-[32rem] max-w-full" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </PortfolioContainer>
    </div>
  );
}

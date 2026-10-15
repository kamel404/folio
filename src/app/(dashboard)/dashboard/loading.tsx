import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a dashboard page streams in (matches the PageHeader + ruled list layout). */
export default function DashboardLoading() {
  return (
    <div aria-label="Loading" role="status">
      <Container className="pt-10 pb-8 lg:pt-14">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-6 h-12 w-72 max-w-full" />
        <Skeleton className="mt-6 h-4 w-96 max-w-full" />
      </Container>
      <Container className="pb-20">
        <div className="border-t border-[var(--foreground)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 border-b border-[var(--border)] py-5">
              <Skeleton className="h-4 w-6" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-2 h-3 w-72 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

import { cn } from "@/lib/utils";

/**
 * Skeleton — animated placeholder for async content.
 *
 * Usage:
 *   <Skeleton className="h-6 w-48" />
 *   <SkeletonText lines={3} />
 */

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[var(--surface-raised)] rounded-md",
        "after:absolute after:inset-0",
        "after:bg-gradient-to-r after:from-transparent after:via-[var(--surface)]/60 after:to-transparent",
        "after:animate-[shimmer_1.5s_infinite]",
        className
      )}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  );
}

/* ─── SkeletonText: multi-line text placeholder ─── */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  /** Last line width as a percentage (creates the "trailing" look) */
  lastLineWidth?: string;
}

function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = "60%",
}: SkeletonTextProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? lastLineWidth : "100%" }}
        />
      ))}
    </div>
  );
}

/* ─── SkeletonCard: a full card placeholder ─── */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1.5" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard };

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Base
  "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 select-none font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        default:  "bg-[var(--surface-raised)] text-[var(--foreground)]",
        accent:   "bg-[var(--accent-light)] text-[var(--accent-hover)]",
        success:  "bg-[var(--success-light)] text-[var(--success)]",
        warning:  "bg-[var(--warning-light)] text-[var(--warning)]",
        error:    "bg-[var(--error-light)] text-[var(--error)]",
        outline:  "bg-transparent text-[var(--text-secondary)] border border-[var(--border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional dot indicator before the label */
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current shrink-0"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };

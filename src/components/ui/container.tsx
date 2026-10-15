import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default: constrained to 1200px. Pass 'sm' (800px) or 'full' (no max-width) */
  size?: "sm" | "md" | "full";
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto px-6",
          size === "sm"   && "max-w-[800px]",
          size === "md"   && "max-w-[1200px]",
          size === "full" && "max-w-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };

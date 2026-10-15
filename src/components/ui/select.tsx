import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

/** Native <select> styled like Input (same label / hint / error contract). */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full cursor-pointer appearance-none bg-[var(--surface)] text-[var(--foreground)]",
              "rounded-md border border-[var(--border)]",
              "py-2.5 pl-3.5 pr-10 text-base",
              "transition-all duration-150 ease-in-out",
              "focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={16}
            aria-hidden
            className="pointer-events-none absolute right-3 text-[var(--text-tertiary)]"
          />
        </div>
        {hint && !error && (
          <p id={hintId} className="text-sm text-[var(--text-secondary)]">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-[var(--error)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };

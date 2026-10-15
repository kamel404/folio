import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
}

/** Native checkbox with a label and optional hint underneath. Submits "on" when checked. */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, hint, id, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        aria-describedby={hintId}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-sm border-[var(--border)] accent-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={inputId} className="cursor-pointer text-sm font-medium leading-tight text-[var(--foreground)]">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="text-sm text-[var(--text-secondary)]">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };

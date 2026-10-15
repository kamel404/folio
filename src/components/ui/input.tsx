import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

/* ─── Input field ─── */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  hint?: string;
  error?: string;
  /** Prepend an icon or element inside the input */
  prefix?: React.ReactNode;
  /** Append an icon or element inside the input */
  suffix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, prefix, suffix, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--foreground)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 flex items-center text-[var(--text-tertiary)] pointer-events-none">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base
              "w-full bg-[var(--surface)] text-[var(--foreground)]",
              "border border-[var(--border)] rounded-md",
              "px-3.5 py-2.5 text-base",
              "placeholder:text-[var(--text-tertiary)]",
              "transition-all duration-150 ease-in-out",
              // Focus
              "focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20",
              // Disabled
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--surface-raised)]",
              // Error state
              error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20",
              // Prefix / suffix padding
              prefix && "pl-9",
              suffix && "pr-9",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              [hintId, errorId].filter(Boolean).join(" ") || undefined
            }
            {...props}
          />

          {suffix && (
            <span className="absolute right-3 flex items-center text-[var(--text-tertiary)] pointer-events-none">
              {suffix}
            </span>
          )}
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

Input.displayName = "Input";

/* ─── Textarea ─── */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[var(--foreground)]"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full bg-[var(--surface)] text-[var(--foreground)]",
            "border border-[var(--border)] rounded-md",
            "px-3.5 py-2.5 text-base",
            "placeholder:text-[var(--text-tertiary)]",
            "transition-all duration-150 ease-in-out",
            "resize-y min-h-[100px]",
            "focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(" ") || undefined
          }
          {...props}
        />

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

Textarea.displayName = "Textarea";

export { Input, Textarea };

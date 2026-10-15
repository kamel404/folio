import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

const buttonVariants = cva(
  // Base styles shared across all variants
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium rounded-md",
    "transition-all duration-150 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
    "disabled:opacity-50 disabled:pointer-events-none",
    "select-none cursor-pointer",
  ],
  {
    variants: {
      variant: {
        // Ink by default; turns vermilion on hover
        primary: [
          "bg-[var(--foreground)] text-[var(--background)]",
          "hover:bg-[var(--accent)] hover:text-[var(--accent-fg)]",
          "active:bg-[var(--accent-hover)]",
        ],
        accent: [
          "bg-[var(--accent)] text-[var(--accent-fg)]",
          "hover:bg-[var(--accent-hover)]",
        ],
        secondary: [
          "bg-transparent text-[var(--foreground)]",
          "border border-[var(--foreground)]",
          "hover:bg-[var(--foreground)] hover:text-[var(--background)]",
        ],
        ghost: [
          "bg-transparent text-[var(--text-secondary)]",
          "hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]",
        ],
        danger: [
          "bg-[var(--error)] text-white",
          "hover:brightness-90",
          "active:brightness-80",
        ],
        link: [
          "bg-transparent text-[var(--accent)] underline-offset-4",
          "hover:underline",
          "p-0 h-auto",
        ],
      },
      size: {
        sm:  "h-8  px-3   text-sm",
        md:  "h-10 px-4   text-sm",
        lg:  "h-12 px-5   text-base",
        icon: "h-10 w-10  p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2
            className="animate-spin shrink-0"
            size={size === "sm" ? 14 : size === "lg" ? 18 : 16}
            aria-hidden
          />
        )}
        {isLoading && loadingText ? loadingText : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

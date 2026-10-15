import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaimFormProps {
  /** Use on ink (inverted) bands */
  inverted?: boolean;
  className?: string;
}

/**
 * "Claim your address" — posts the chosen slug to /signup as ?slug=,
 * where the signup form pre-fills it and checks availability.
 * Plain GET form: works without JavaScript.
 */
function ClaimForm({ inverted = false, className }: ClaimFormProps) {
  return (
    <form action="/signup" method="get" className={cn("w-full max-w-lg", className)}>
      <label
        htmlFor={inverted ? "claim-slug-footer" : "claim-slug"}
        className={cn(
          "label-mono mb-2.5 block",
          inverted ? "text-[var(--ink-muted)]" : "text-[var(--text-secondary)]"
        )}
      >
        Claim your address
      </label>
      <div
        className={cn(
          "flex items-stretch rounded-md border transition-colors duration-150",
          "focus-within:border-[var(--accent)]",
          inverted
            ? "border-[var(--ink-border)] bg-[var(--ink)]"
            : "border-[var(--foreground)] bg-[var(--surface)]"
        )}
      >
        <input
          id={inverted ? "claim-slug-footer" : "claim-slug"}
          name="slug"
          type="text"
          required
          minLength={3}
          maxLength={50}
          pattern={"[a-z0-9][a-z0-9\\-]*[a-z0-9]"}
          title="Lowercase letters, numbers and hyphens"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="yourname"
          className={cn(
            "min-w-0 flex-1 bg-transparent py-3 pl-4 pr-1 font-mono text-[0.9375rem] focus:outline-none",
            inverted
              ? "text-[var(--ink-fg)] placeholder:text-[var(--ink-muted)]"
              : "text-[var(--foreground)] placeholder:text-[var(--text-tertiary)]"
          )}
        />
        <span
          className={cn(
            "flex items-center pr-3 font-mono text-[0.9375rem]",
            inverted ? "text-[var(--ink-muted)]" : "text-[var(--text-tertiary)]"
          )}
        >
          .getfolio.dev
        </span>
        <button
          type="submit"
          className={cn(
            "m-1 inline-flex cursor-pointer items-center gap-2 rounded-sm px-4 text-sm font-medium transition-colors duration-150",
            inverted
              ? "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
              : "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)]"
          )}
        >
          <span className="hidden sm:inline">Claim it</span>
          <ArrowRight size={16} aria-hidden />
          <span className="sr-only sm:hidden">Claim it</span>
        </button>
      </div>
    </form>
  );
}

export { ClaimForm };

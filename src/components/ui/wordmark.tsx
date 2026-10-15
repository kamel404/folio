import Link from "next/link";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  href?: string;
}

/** "folio." — serif wordmark with a vermilion full stop. */
function Wordmark({ className, href = "/" }: WordmarkProps) {
  return (
    <Link
      href={href}
      aria-label="Folio home"
      className={cn(
        "font-display text-[1.75rem] leading-none tracking-[-0.02em] text-[var(--foreground)]",
        className
      )}
    >
      folio<span className="text-[var(--accent)]">.</span>
    </Link>
  );
}

export { Wordmark };

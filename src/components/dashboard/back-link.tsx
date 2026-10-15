import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";

/** "← Projects" above the header of nested dashboard pages. */
function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Container className="pt-8 lg:pt-10">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft size={14} aria-hidden />
        {label}
      </Link>
    </Container>
  );
}

export { BackLink };

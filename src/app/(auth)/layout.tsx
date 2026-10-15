import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)]"
          >
            ← Back to site
          </Link>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}

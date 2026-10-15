"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/layout/section";

/**
 * Catches unexpected errors in any dashboard page (e.g. the database is
 * unreachable). The sidebar stays usable because the layout sits above this
 * boundary. Production hides the message, so we only show the digest.
 */
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-16 lg:py-24">
      <Eyebrow label="Error" />
      <h1 className="mt-6 text-[clamp(2.25rem,4vw,3.25rem)]">
        Something went <em className="text-[var(--accent)]">wrong.</em>
      </h1>
      <p className="mt-4 max-w-lg leading-relaxed text-[var(--text-secondary)]">
        We couldn&apos;t load this page. Your saved content is safe. This is usually a temporary
        connection problem, so trying again often works.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>
          <RotateCcw size={16} aria-hidden />
          Try again
        </Button>
        <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
          Back to overview
        </Link>
      </div>
      {error.digest && (
        <p className="mt-10 font-mono text-xs text-[var(--text-tertiary)]">Reference: {error.digest}</p>
      )}
    </Container>
  );
}

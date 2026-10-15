"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/layout/section";

/**
 * Last-resort boundary for errors outside a more specific one — e.g. the
 * dashboard layout failing to verify the session during an Auth outage.
 * (Dashboard pages have their own boundary that keeps the sidebar.)
 */
export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col">
      <Container className="py-6">
        <Wordmark />
      </Container>
      <Container size="sm" className="flex flex-1 flex-col justify-center py-24">
        <Eyebrow label="Error" />
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">
          Something went <em className="text-[var(--accent)]">wrong.</em>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--text-secondary)]">
          We couldn&apos;t load this page. It&apos;s usually a temporary connection problem, so trying
          again often works.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => retry()}>
            <RotateCcw size={16} aria-hidden />
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Go to the homepage
          </Link>
        </div>
        {error.digest && (
          <p className="mt-10 font-mono text-xs text-[var(--text-tertiary)]">Reference: {error.digest}</p>
        )}
      </Container>
    </main>
  );
}

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/layout/section";

export const metadata = { title: "Page not found", robots: { index: false } };

/** Any URL on the main domain that doesn't match a route. */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <Container className="py-6">
        <Wordmark />
      </Container>
      <Container size="sm" className="flex flex-1 flex-col justify-center py-24">
        <Eyebrow label="404" />
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">
          Page not <em className="text-[var(--accent)]">found.</em>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--text-secondary)]">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants()}>
            Go to the homepage
          </Link>
          <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
            Open your dashboard
          </Link>
        </div>
      </Container>
    </main>
  );
}

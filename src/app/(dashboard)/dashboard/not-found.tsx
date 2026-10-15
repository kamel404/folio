import Link from "next/link";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/layout/section";

/** notFound() inside the dashboard: an id that doesn't exist or isn't yours. */
export default function DashboardNotFound() {
  return (
    <Container className="py-16 lg:py-24">
      <Eyebrow label="404" />
      <h1 className="mt-6 text-[clamp(2.25rem,4vw,3.25rem)]">
        Nothing <em className="text-[var(--accent)]">here.</em>
      </h1>
      <p className="mt-4 max-w-lg leading-relaxed text-[var(--text-secondary)]">
        This item doesn&apos;t exist. It may have been deleted, or the link is wrong.
      </p>
      <div className="mt-8">
        <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
          Back to overview
        </Link>
      </div>
    </Container>
  );
}

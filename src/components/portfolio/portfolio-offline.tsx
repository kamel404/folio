import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/layout/section";

/** Shown at slug.getfolio.dev while the tenant has no active plan. Deliberately says nothing about the person. */
function PortfolioOffline() {
  return (
    <main className="flex flex-1 items-center py-24">
      <Container size="sm">
        <Eyebrow label="Offline" />
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">
          This portfolio is <em className="text-[var(--accent)]">offline.</em>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--text-secondary)]">
          It isn&apos;t published right now. If this is your address, sign in to bring it back.
        </p>
      </Container>
    </main>
  );
}

export { PortfolioOffline };

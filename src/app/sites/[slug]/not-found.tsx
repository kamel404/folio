import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/layout/section";

export default function SiteNotFound() {
  return (
    <main className="flex flex-1 items-center py-24">
      <Container size="sm">
        <Eyebrow label="404" />
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">
          No portfolio <em className="text-[var(--accent)]">here.</em>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--text-secondary)]">
          Nobody has claimed this address yet.
        </p>
      </Container>
    </main>
  );
}

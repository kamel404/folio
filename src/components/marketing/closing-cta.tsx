import { Section, Eyebrow } from "@/components/layout/section";
import { ClaimForm } from "@/components/marketing/claim-form";

function ClosingCta({ index = "05" }: { index?: string }) {
  return (
    <Section tone="ink" aria-labelledby="closing-title">
      <div className="grid-12 gap-y-12">
        <Eyebrow index={index} label="Begin" inverted className="col-span-12" />
        <h2
          id="closing-title"
          className="col-span-12 lg:col-span-8 text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[0.98] text-[var(--ink-fg)]"
        >
          Your name, your work,{" "}
          <em className="text-[var(--accent)]">one link.</em>
        </h2>
        <div className="col-span-12 lg:col-span-6">
          <ClaimForm inverted />
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Build and preview first. Pay only when you publish.
          </p>
        </div>
      </div>
    </Section>
  );
}

export { ClosingCta };

import { Check, Copy, FileText, Pencil, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "@/components/layout/section";

/* Each step carries a small, real-UI "artifact" of what that step looks like */

function UploadArtifact() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
        <FileText size={16} className="text-[var(--accent)]" aria-hidden />
        <span className="font-mono text-xs">cv_2026.pdf</span>
        <span className="ml-auto font-mono text-[10px] text-[var(--text-tertiary)]">248 KB</span>
      </div>
      <p className="label-mono text-center text-[var(--text-tertiary)]">or</p>
      <div className="rounded-md border border-dashed border-[var(--border)] px-3 py-2.5">
        <p className="label-mono text-[var(--text-tertiary)]">Question 2 of 12</p>
        <p className="mt-1 text-sm">What do you build, in one sentence?</p>
      </div>
    </div>
  );
}

function ReviewArtifact() {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-center justify-between">
        <p className="label-mono text-[var(--text-tertiary)]">Short bio</p>
        <Pencil size={12} className="text-[var(--text-tertiary)]" aria-hidden />
      </div>
      <p className="mt-2 text-sm leading-snug">
        I build calm, fast interfaces for products people use{" "}
        <span className="bg-[var(--accent-light)] px-0.5">every day</span>.
      </p>
      <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--border-subtle)] pt-2.5 text-xs text-[var(--text-secondary)]">
        <RotateCw size={12} aria-hidden />
        Rewrite this section
      </div>
    </div>
  );
}

function PublishArtifact() {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" aria-hidden />
        <span className="label-mono text-[var(--success)]">Live</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 rounded-sm bg-[var(--surface-raised)] px-2.5 py-2">
        <span className="truncate font-mono text-xs">lina.getfolio.dev</span>
        <Copy size={12} className="shrink-0 text-[var(--text-secondary)]" aria-hidden />
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <Check size={12} className="text-[var(--success)]" aria-hidden />
        Link copied, ready to send
      </p>
    </div>
  );
}

const steps = [
  {
    n: "i.",
    title: "Bring what you have",
    body: "Drop in a CV (PDF or Word) or answer a dozen short questions. Nothing to design, nothing to configure.",
    time: "~1 min",
    artifact: <UploadArtifact />,
  },
  {
    n: "ii.",
    title: "Read the first draft",
    body: "Folio turns it into a bio, project write-ups, experience and skills. Edit any line, or ask for a rewrite of one section.",
    time: "~3 min",
    artifact: <ReviewArtifact />,
  },
  {
    n: "iii.",
    title: "Publish and share",
    body: "Pick a palette and it's live at your own address. Every edit after that shows up within a minute.",
    time: "Instant",
    artifact: <PublishArtifact />,
  },
];

function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      index="01"
      label="How it works"
      title={
        <>
          Three steps. <em className="text-[var(--text-secondary)]">No blank page.</em>
        </>
      }
      lede="Most portfolio builders hand you an empty template. Folio starts from what you've already written about yourself."
    >
      <ol className="grid border-t border-[var(--foreground)] md:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={cn(
              "flex flex-col pt-8 pb-10 md:pb-0",
              i > 0 && "border-t border-[var(--border)] md:border-t-0 md:border-l md:pl-8",
              i < steps.length - 1 && "md:pr-8"
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-display text-5xl italic leading-none text-[var(--accent)]">{step.n}</span>
              <span className="label-mono text-[var(--text-tertiary)]">{step.time}</span>
            </div>
            <h3 className="mt-6 text-xl">{step.title}</h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">{step.body}</p>
            <div className="mt-8 md:mt-auto md:pt-8">{step.artifact}</div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export { HowItWorks };

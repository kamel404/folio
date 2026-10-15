import { Section } from "@/components/layout/section";

/** Features as a table of contents — one ruled row per feature. */

const features = [
  {
    title: "Your own address",
    body: "yourname.getfolio.dev, live the moment you publish. No hosting, no DNS.",
    plan: "Both plans",
  },
  {
    title: "CV import",
    body: "PDF or Word. Roles, dates, projects and skills come out structured and editable.",
    plan: "Both plans",
  },
  {
    title: "Guided interview",
    body: "No CV? Ten to fifteen plain questions, one at a time, turned into proper copy.",
    plan: "Both plans",
  },
  {
    title: "A real editor",
    body: "Profile, projects, experience and skills, each with its own simple form. Reorder and hide anything.",
    plan: "Both plans",
  },
  {
    title: "Five considered palettes",
    body: "Each one tested for contrast and long reading. Custom colours when you want them.",
    plan: "Both plans",
  },
  {
    title: "Section rewrites",
    body: "Ask for a tighter bio or a clearer project description without touching the rest.",
    plan: "Both plans",
  },
  {
    title: "Visitor analytics",
    body: "How many people looked, and where they came from. Nothing more invasive.",
    plan: "Both plans",
  },
  {
    title: "Custom domain",
    body: "Point yourname.com at your Folio and keep the same editor.",
    plan: "Pro",
  },
];

function FeatureIndex() {
  return (
    <Section
      id="features"
      index="02"
      label="What you get"
      title="Everything a portfolio needs, and nothing it doesn't."
      lede="Both plans include everything below except a custom domain. Pro adds that, plus unlimited rewrites and full analytics."
    >
      <ol className="border-t border-[var(--foreground)]">
        {features.map((f, i) => (
          <li
            key={f.title}
            className="grid-12 gap-y-2 border-b border-[var(--border)] py-6 lg:items-baseline"
          >
            <span className="col-span-2 lg:col-span-1 font-mono text-xs text-[var(--text-tertiary)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="col-span-10 lg:col-span-4 font-display text-[1.75rem] font-normal leading-tight tracking-[-0.01em]">
              {f.title}
            </h3>
            <p className="col-span-12 col-start-1 sm:col-span-10 sm:col-start-3 lg:col-span-5 lg:col-start-6 text-[0.9375rem] leading-relaxed text-[var(--text-secondary)]">
              {f.body}
            </p>
            <span
              className={
                "col-span-12 sm:col-start-3 lg:col-span-2 lg:col-start-11 lg:text-right label-mono " +
                (f.plan === "Both plans" ? "text-[var(--text-tertiary)]" : "text-[var(--accent)]")
              }
            >
              {f.plan}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export { FeatureIndex };

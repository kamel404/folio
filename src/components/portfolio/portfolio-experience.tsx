import { PortfolioSection } from "@/components/portfolio/portfolio-ui";
import { formatRange } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types";

const BULLET = /^[•\-*]\s*/;

/** One line → a paragraph. Several lines (or "- " bullets) → a list. */
function Description({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 1 && !BULLET.test(lines[0])) {
    return <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">{lines[0]}</p>;
  }
  return (
    <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-[var(--text-muted)]">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
          <span>{line.replace(BULLET, "")}</span>
        </li>
      ))}
    </ul>
  );
}

function PortfolioExperience({ experiences }: { experiences: Experience[] }) {
  return (
    <PortfolioSection id="experience" title="Experience">
      <ol className="ml-1.5 flex flex-col gap-6 border-l border-[var(--border)]">
        {experiences.map((exp) => (
          <li key={exp.id} className="relative pl-6 sm:pl-8">
            <span
              aria-hidden
              className={cn(
                "absolute -left-[7px] top-6 h-3.5 w-3.5 rounded-full border-2 border-[var(--accent)]",
                exp.current ? "bg-[var(--accent)]" : "bg-[var(--background)]"
              )}
            />
            <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-lg">{exp.position}</h3>
                  <p className="mt-0.5 text-sm font-medium text-[var(--accent-dark)]">{exp.company}</p>
                </div>
                <p className="shrink-0 self-start rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 font-mono text-xs text-[var(--text-muted)]">
                  {formatRange(exp.start_date, exp.end_date, exp.current)}
                </p>
              </div>
              <Description text={exp.description} />
            </article>
          </li>
        ))}
      </ol>
    </PortfolioSection>
  );
}

export { PortfolioExperience };

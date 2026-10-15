import { cn } from "@/lib/utils";
import { paletteVars, type ThemePalette } from "@/lib/themes/palettes";

/**
 * A miniature, real-HTML portfolio rendered in a given tenant palette.
 * Used in the hero (with proofreader's marks) and the themes section.
 * Example content only — a fictional person.
 */

const sample = {
  slug: "lina",
  name: "Lina Haddad",
  title: "Frontend engineer",
  location: "Beirut · Remote",
  bio: "I build calm, fast interfaces for products people use every day. Currently focused on design systems and offline-first apps.",
  projects: [
    { title: "Souk POS", note: "Offline-first point of sale", year: "2026" },
    { title: "Tarjim", note: "Arabic ⇄ English subtitle editor", year: "2025" },
    { title: "Clinic Pulse", note: "Status pages for small clinics", year: "2024" },
  ],
};

interface PortfolioSpecimenProps {
  palette: ThemePalette;
  size?: "sm" | "lg";
  /** Show numbered proofreader's marks (hero only) */
  marks?: boolean;
  className?: string;
}

function Mark({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="ml-1.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[var(--proof)] align-middle font-mono text-[10px] font-medium text-[var(--proof)]"
    >
      {n}
    </span>
  );
}

function PortfolioSpecimen({ palette, size = "lg", marks = false, className }: PortfolioSpecimenProps) {
  const lg = size === "lg";
  const projects = lg ? sample.projects : sample.projects.slice(0, 2);

  return (
    <div
      style={paletteVars(palette)}
      className={cn(
        "overflow-hidden border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-sans",
        lg ? "rounded-lg shadow-lg" : "rounded-md",
        className
      )}
    >
      {/* Address bar */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]",
          lg ? "px-5 py-3" : "px-3 py-2"
        )}
      >
        <span className={cn("font-mono text-[var(--text-muted)]", lg ? "text-xs" : "text-[10px]")}>
          {sample.slug}.getfolio.dev
          {marks && <Mark n={3} />}
        </span>
        {lg && (
          <span className="flex gap-4 text-xs text-[var(--text-muted)]">
            <span>Work</span>
            <span>About</span>
            <span>Contact</span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className={lg ? "p-6 sm:p-8" : "p-4"}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
          <span className={cn("text-[var(--text-muted)]", lg ? "text-xs" : "text-[10px]")}>
            Available for work
          </span>
        </div>

        <p
          className={cn(
            "font-semibold tracking-[-0.02em]",
            lg ? "mt-4 text-[1.75rem] leading-tight" : "mt-2 text-base leading-tight"
          )}
        >
          {sample.name}
          {marks && <Mark n={1} />}
        </p>
        <p className={cn("text-[var(--accent)]", lg ? "mt-1 text-sm font-medium" : "text-[11px] font-medium")}>
          {sample.title} <span className="text-[var(--text-muted)] font-normal">— {sample.location}</span>
        </p>

        {lg && (
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">{sample.bio}</p>
        )}

        <div className={lg ? "mt-7" : "mt-4"}>
          <p
            className={cn(
              "flex items-center font-mono uppercase tracking-[0.08em] text-[var(--text-muted)]",
              lg ? "text-[10px]" : "text-[9px]"
            )}
          >
            Selected work
            {marks && <Mark n={2} />}
          </p>
          <ul className={cn("border-t border-[var(--border)]", lg ? "mt-3" : "mt-2")}>
            {projects.map((p) => (
              <li
                key={p.title}
                className={cn(
                  "flex items-baseline justify-between gap-3 border-b border-[var(--border)]",
                  lg ? "py-3" : "py-1.5"
                )}
              >
                <span className="min-w-0">
                  <span className={cn("font-medium", lg ? "text-sm" : "text-[11px]")}>{p.title}</span>
                  {lg && <span className="ml-2 text-sm text-[var(--text-muted)]">{p.note}</span>}
                </span>
                <span className={cn("font-mono text-[var(--text-muted)]", lg ? "text-xs" : "text-[9px]")}>
                  {p.year}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export { PortfolioSpecimen };

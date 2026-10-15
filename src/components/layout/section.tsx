import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

/**
 * Folio page grammar — every page (marketing, auth, onboarding,
 * dashboard) is assembled from these pieces so they read as one
 * publication:
 *
 *   <PageHeader>    top of a page: eyebrow + serif h1 + lede
 *   <Section>       a ruled band: eyebrow + serif h2 + lede + body
 *   <Eyebrow>       "01 ── LABEL" mono marker with a hairline
 *
 * Layout always sits on the 12-column `grid-12`: titles take
 * columns 1–7, ledes take 8–12 and align to the title baseline.
 */

/* ─── Eyebrow ─── */
interface EyebrowProps {
  index?: string;
  label: string;
  /** Use on ink (inverted) bands */
  inverted?: boolean;
  className?: string;
}

function Eyebrow({ index, label, inverted = false, className }: EyebrowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 label-mono",
        inverted ? "text-[var(--ink-muted)]" : "text-[var(--text-secondary)]",
        className
      )}
    >
      {index && <span className="text-[var(--accent)]">{index}</span>}
      <span
        aria-hidden
        className={cn(
          "h-px w-8",
          inverted ? "bg-[var(--ink-border)]" : "bg-[var(--border)]"
        )}
      />
      <span>{label}</span>
    </div>
  );
}

/* ─── Section header (title + lede on the 12-col grid) ─── */
interface SectionHeaderProps {
  index?: string;
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  as?: "h1" | "h2";
  inverted?: boolean;
  /** Title and lede stack full-width (for narrow content columns, e.g. beside the dashboard sidebar) */
  stacked?: boolean;
  className?: string;
}

function SectionHeader({
  index,
  label,
  title,
  lede,
  as: Heading = "h2",
  inverted = false,
  stacked = false,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("grid-12 gap-y-6", className)}>
      <Eyebrow
        index={index}
        label={label}
        inverted={inverted}
        className="col-span-12"
      />
      <Heading
        className={cn(
          stacked ? "col-span-12" : "col-span-12 lg:col-span-7",
          Heading === "h1"
            ? "text-[clamp(2.75rem,6vw,4.75rem)]"
            : "text-[clamp(2.25rem,4.5vw,3.5rem)]",
          inverted && "text-[var(--ink-fg)]"
        )}
      >
        {title}
      </Heading>
      {lede && (
        <p
          className={cn(
            stacked
              ? "col-span-12 max-w-xl text-base leading-relaxed"
              : "col-span-12 lg:col-span-4 lg:col-start-9 self-end text-lg leading-relaxed",
            inverted ? "text-[var(--ink-muted)]" : "text-[var(--text-secondary)]"
          )}
        >
          {lede}
        </p>
      )}
    </header>
  );
}

/* ─── Section (ruled band) ─── */
type Tone = "paper" | "surface" | "ink";

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  index?: string;
  label?: string;
  title?: React.ReactNode;
  lede?: React.ReactNode;
  tone?: Tone;
  /** Drop the top hairline (e.g. first band under the navbar) */
  flush?: boolean;
}

const toneClass: Record<Tone, string> = {
  paper: "bg-[var(--background)]",
  surface: "bg-[var(--surface)]",
  ink: "bg-[var(--ink)] text-[var(--ink-fg)]",
};

function Section({
  index,
  label,
  title,
  lede,
  tone = "paper",
  flush = false,
  className,
  children,
  ...props
}: SectionProps) {
  const inverted = tone === "ink";
  return (
    <section
      className={cn(
        "py-20 lg:py-28",
        !flush && !inverted && "border-t border-[var(--border)]",
        toneClass[tone],
        className
      )}
      {...props}
    >
      <Container>
        {label && title ? (
          <SectionHeader
            index={index}
            label={label}
            title={title}
            lede={lede}
            inverted={inverted}
            className="mb-14 lg:mb-20"
          />
        ) : label ? (
          // Custom-layout sections still get the same eyebrow
          <Eyebrow index={index} label={label} inverted={inverted} className="mb-10" />
        ) : null}
        {children}
      </Container>
    </section>
  );
}

/* ─── PageHeader (top of non-landing pages) ─── */
interface PageHeaderProps {
  index?: string;
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  /** Compact variant for app screens (dashboard): smaller title, stacked lede */
  stacked?: boolean;
  className?: string;
}

function PageHeader({ index, label, title, lede, actions, stacked = false, className }: PageHeaderProps) {
  return (
    <div className={cn(stacked ? "pt-10 pb-8 lg:pt-14" : "pt-16 pb-12 lg:pt-24 lg:pb-16", className)}>
      <Container>
        <SectionHeader
          as="h1"
          index={index}
          label={label}
          title={title}
          lede={lede}
          stacked={stacked}
          className={stacked ? "[&_h1]:text-[clamp(2.25rem,4vw,3.25rem)]" : undefined}
        />
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </Container>
    </div>
  );
}

export { Eyebrow, SectionHeader, Section, PageHeader };

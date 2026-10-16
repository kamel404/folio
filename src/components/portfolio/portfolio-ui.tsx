import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import type { PortfolioContent, Profile } from "@/types";

/**
 * Building blocks shared by every portfolio section. Portfolios use only the
 * tenant palette variables (--background, --surface, --foreground,
 * --text-muted, --accent, --accent-dark, --border, --warm-bg, --accent-fg),
 * never platform tokens, so one set of components renders every theme.
 *
 * `base` is where the portfolio is mounted: "" on the public subdomain,
 * "/preview" for the owner's private preview.
 */

export type PortfolioBase = "" | "/preview";

export const portfolioHref = {
  home: (base: PortfolioBase) => base || "/",
  section: (base: PortfolioBase, id: string) => `${base || "/"}#${id}`,
  project: (base: PortfolioBase, slug: string) => `${base}/projects/${slug}`,
};

export interface PortfolioSectionLink {
  id: "about" | "projects" | "experience" | "skills" | "contact";
  label: string;
}

export function hasContact(p: Profile): boolean {
  return Boolean(p.email || p.phone || p.linkedin_url || p.github_url || p.cv_url);
}

/** The sections that have content, in page order. Empty sections are left out entirely. */
export function portfolioSections({ profile, projects, experiences, skills }: PortfolioContent): PortfolioSectionLink[] {
  const sections: PortfolioSectionLink[] = [];
  if (profile.long_bio) sections.push({ id: "about", label: "About" });
  if (projects.length > 0) sections.push({ id: "projects", label: "Projects" });
  if (experiences.length > 0) sections.push({ id: "experience", label: "Experience" });
  if (skills.length > 0) sections.push({ id: "skills", label: "Skills" });
  if (hasContact(profile)) sections.push({ id: "contact", label: "Contact" });
  return sections;
}

/** Free text → paragraphs (blank-line separated); single line breaks are kept. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

/** "https://github.com/lina/" → "github.com/lina" */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function PortfolioContainer({ className, children }: { className?: string; children: React.ReactNode }) {
  return <Container className={cn("max-w-5xl", className)}>{children}</Container>;
}

export function PortfolioSection({
  id,
  title,
  children,
}: {
  id: PortfolioSectionLink["id"];
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 border-b border-[var(--border)] py-16 sm:py-20">
      <PortfolioContainer>
        <span aria-hidden className="block h-0.5 w-8 bg-[var(--accent)]" />
        <h2 id={`${id}-title`} className="mt-4 text-2xl sm:text-3xl">
          {title}
        </h2>
        <div className="mt-8 sm:mt-10">{children}</div>
      </PortfolioContainer>
    </section>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-150";

export const portfolioButton = {
  primary: cn(
    buttonBase,
    "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-fg)]"
  ),
  secondary: cn(
    buttonBase,
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent-dark)]"
  ),
};

export function Tag({ tone = "default", children }: { tone?: "default" | "accent"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs",
        tone === "accent"
          ? "bg-[var(--accent)]/10 font-medium text-[var(--accent-dark)]"
          : "border border-[var(--border)] bg-[var(--warm-bg)] text-[var(--foreground)]"
      )}
    >
      {children}
    </span>
  );
}

/** Opens in a new tab; every external link on a portfolio goes through here. */
export function ExternalLink({ href, className, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
    </a>
  );
}

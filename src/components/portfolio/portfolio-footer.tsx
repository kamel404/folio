import { ExternalLink, PortfolioContainer } from "@/components/portfolio/portfolio-ui";
import { PLATFORM_URL } from "@/lib/config";
import type { Profile } from "@/types";

function PortfolioFooter({ profile }: { profile: Profile }) {
  const links = [
    profile.github_url && { label: "GitHub", href: profile.github_url },
    profile.linkedin_url && { label: "LinkedIn", href: profile.linkedin_url },
  ].filter((l) => !!l);

  return (
    <footer className="mt-auto border-t border-[var(--border)] py-10">
      <PortfolioContainer className="flex flex-col items-center justify-between gap-4 text-sm text-[var(--text-muted)] sm:flex-row">
        <p className="text-center sm:text-left">
          <span className="font-medium text-[var(--foreground)]">
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span aria-hidden className="mx-2">·</span>
          {profile.title}
        </p>

        <ul className="flex items-center gap-5">
          {links.map((l) => (
            <li key={l.label}>
              <ExternalLink href={l.href} className="transition-colors hover:text-[var(--accent-dark)]">
                {l.label}
              </ExternalLink>
            </li>
          ))}
          {profile.email && (
            <li>
              <a href={`mailto:${profile.email}`} className="transition-colors hover:text-[var(--accent-dark)]">
                Email
              </a>
            </li>
          )}
          <li className="border-l border-[var(--border)] pl-5 text-xs">
            <ExternalLink href={PLATFORM_URL} className="transition-colors hover:text-[var(--foreground)]">
              Made with Folio
            </ExternalLink>
          </li>
        </ul>
      </PortfolioContainer>
    </footer>
  );
}

export { PortfolioFooter };

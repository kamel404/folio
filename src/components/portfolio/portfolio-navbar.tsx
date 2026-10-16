import Link from "next/link";
import { FileText } from "lucide-react";
import { PortfolioMobileMenu } from "@/components/portfolio/portfolio-mobile-menu";
import {
  ExternalLink,
  PortfolioContainer,
  portfolioButton,
  portfolioHref,
  type PortfolioBase,
  type PortfolioSectionLink,
} from "@/components/portfolio/portfolio-ui";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

interface PortfolioNavbarProps {
  profile: Profile;
  sections: PortfolioSectionLink[];
  base: PortfolioBase;
}

function PortfolioNavbar({ profile, sections, base }: PortfolioNavbarProps) {
  // Absolute section links, so they also work from a project page
  const links = sections.map((s) => ({ ...s, href: portfolioHref.section(base, s.id) }));

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
      <PortfolioContainer className="relative flex h-16 items-center justify-between gap-6">
        <Link
          href={portfolioHref.home(base)}
          className="truncate text-lg font-semibold tracking-tight transition-colors hover:text-[var(--accent)]"
        >
          {profile.name}
        </Link>

        {links.length > 0 && (
          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {profile.cv_url && (
          <ExternalLink href={profile.cv_url} className={cn(portfolioButton.secondary, "hidden px-4 py-2 md:inline-flex")}>
            <FileText size={14} aria-hidden className="text-[var(--accent)]" />
            View CV
          </ExternalLink>
        )}

        <PortfolioMobileMenu links={links} cvUrl={profile.cv_url} />
      </PortfolioContainer>
    </header>
  );
}

export { PortfolioNavbar };

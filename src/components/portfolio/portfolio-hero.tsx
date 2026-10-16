import Image from "next/image";
import { ArrowDown, FileText, Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import {
  ExternalLink,
  PortfolioContainer,
  hasContact,
  portfolioButton,
  type PortfolioSectionLink,
} from "@/components/portfolio/portfolio-ui";
import { availabilityLabel } from "@/lib/options";
import { cn } from "@/lib/utils";
import type { PortfolioContent } from "@/types";

interface PortfolioHeroProps {
  content: PortfolioContent;
  sections: PortfolioSectionLink[];
}

function PortfolioHero({ content, sections }: PortfolioHeroProps) {
  const { profile, theme } = content;
  const availability = availabilityLabel(profile.availability_status);
  const showPhoto = theme.show_photo && profile.profile_image_url;
  const hasProjects = sections.some((s) => s.id === "projects");

  const socials = [
    profile.github_url && { label: "GitHub", href: profile.github_url, icon: <GithubIcon size={16} /> },
    profile.linkedin_url && { label: "LinkedIn", href: profile.linkedin_url, icon: <LinkedinIcon size={16} /> },
  ].filter((s) => !!s);

  return (
    <section className="overflow-hidden border-b border-[var(--border)] py-16 sm:py-24">
      <PortfolioContainer className="flex flex-col-reverse items-start gap-10 md:flex-row md:items-center md:justify-between md:gap-14">
        <div className="max-w-2xl animate-fade-in-up">
          {availability && (
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-muted)]">
              <span
                aria-hidden
                className={cn(
                  "h-2 w-2 rounded-full",
                  profile.availability_status === "unavailable" ? "bg-[var(--text-muted)]" : "bg-[var(--accent)]"
                )}
              />
              {availability}
            </p>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl">{profile.name}</h1>
          <p className="mt-3 text-xl font-medium text-[var(--accent-dark)] sm:text-2xl">{profile.title}</p>
          {profile.location && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <MapPin size={14} aria-hidden />
              {profile.location}
            </p>
          )}

          {profile.short_bio && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              {profile.short_bio}
            </p>
          )}

          {(hasProjects || profile.cv_url || hasContact(profile)) && (
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
              {hasProjects && (
                <a href="#projects" className={portfolioButton.primary}>
                  See my work
                  <ArrowDown size={16} aria-hidden />
                </a>
              )}
              {profile.cv_url ? (
                <ExternalLink href={profile.cv_url} className={portfolioButton.secondary}>
                  <FileText size={16} aria-hidden className="text-[var(--accent)]" />
                  View CV
                </ExternalLink>
              ) : (
                hasContact(profile) && (
                  <a href="#contact" className={portfolioButton.secondary}>
                    <Mail size={16} aria-hidden className="text-[var(--accent)]" />
                    Get in touch
                  </a>
                )
              )}
            </div>
          )}

          {(socials.length > 0 || profile.email) && (
            <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-muted)]">
              {socials.map((s) => (
                <li key={s.label}>
                  <ExternalLink href={s.href} className="flex items-center gap-1.5 transition-colors hover:text-[var(--accent-dark)]">
                    {s.icon}
                    {s.label}
                  </ExternalLink>
                </li>
              ))}
              {profile.email && (
                <li>
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-1.5 transition-colors hover:text-[var(--accent-dark)]"
                  >
                    <Mail size={16} aria-hidden />
                    Email
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>

        {showPhoto && (
          <div className="shrink-0 animate-fade-in">
            <div className="relative aspect-[4/5] w-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--warm-bg)] sm:w-64 md:w-72">
              <Image
                src={profile.profile_image_url!}
                alt={profile.name}
                fill
                priority
                sizes="(min-width: 768px) 288px, 256px"
                className="object-cover object-top"
              />
            </div>
          </div>
        )}
      </PortfolioContainer>
    </section>
  );
}

export { PortfolioHero };

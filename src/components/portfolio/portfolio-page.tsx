import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Star } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { PortfolioNavbar } from "@/components/portfolio/portfolio-navbar";
import { PortfolioHero } from "@/components/portfolio/portfolio-hero";
import { PortfolioAbout } from "@/components/portfolio/portfolio-about";
import { PortfolioProjects } from "@/components/portfolio/portfolio-projects";
import { PortfolioExperience } from "@/components/portfolio/portfolio-experience";
import { PortfolioSkills } from "@/components/portfolio/portfolio-skills";
import { PortfolioContact } from "@/components/portfolio/portfolio-contact";
import { PortfolioFooter } from "@/components/portfolio/portfolio-footer";
import {
  ExternalLink,
  Paragraphs,
  PortfolioContainer,
  Tag,
  portfolioButton,
  portfolioHref,
  portfolioSections,
  type PortfolioBase,
} from "@/components/portfolio/portfolio-ui";
import type { PortfolioContent, Project } from "@/types";

/**
 * Full portfolio pages. The public site (/sites/[slug]) and the private
 * preview (/preview) both render these, with a different `base`.
 */

interface PortfolioPageProps {
  content: PortfolioContent;
  base: PortfolioBase;
}

/** Navbar + footer around a page. `.portfolio` switches headings to the portfolio type (globals.css). */
function PortfolioShell({ content, base, children }: PortfolioPageProps & { children: React.ReactNode }) {
  return (
    <div className="portfolio flex flex-1 flex-col">
      <PortfolioNavbar profile={content.profile} sections={portfolioSections(content)} base={base} />
      <main className="flex-1">{children}</main>
      <PortfolioFooter profile={content.profile} />
    </div>
  );
}

function PortfolioHome({ content, base }: PortfolioPageProps) {
  const sections = portfolioSections(content);
  const has = (id: string) => sections.some((s) => s.id === id);

  return (
    <PortfolioShell content={content} base={base}>
      <PortfolioHero content={content} sections={sections} />
      {has("about") && <PortfolioAbout profile={content.profile} />}
      {has("projects") && <PortfolioProjects projects={content.projects} base={base} />}
      {has("experience") && <PortfolioExperience experiences={content.experiences} />}
      {has("skills") && <PortfolioSkills skills={content.skills} />}
      {has("contact") && <PortfolioContact profile={content.profile} />}
    </PortfolioShell>
  );
}

function PortfolioProjectPage({ content, base, project }: PortfolioPageProps & { project: Project }) {
  return (
    <PortfolioShell content={content} base={base}>
      <article className="py-12 sm:py-16">
        <PortfolioContainer>
          <a
            href={portfolioHref.section(base, "projects")}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <ArrowLeft size={16} aria-hidden />
            All projects
          </a>

          <header className="mt-8 max-w-3xl animate-fade-in-up">
            <div className="flex flex-wrap items-center gap-3">
              <Tag tone="accent">{project.category}</Tag>
              {project.featured && (
                <span className="flex items-center gap-1 text-xs font-medium text-[var(--accent-dark)]">
                  <Star size={14} aria-hidden className="fill-current" />
                  Featured
                </span>
              )}
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl">{project.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">{project.short_description}</p>

            {(project.live_url || project.github_url) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {project.live_url && (
                  <ExternalLink href={project.live_url} className={portfolioButton.primary}>
                    Visit the live site
                    <ArrowUpRight size={16} aria-hidden />
                  </ExternalLink>
                )}
                {project.github_url && (
                  <ExternalLink href={project.github_url} className={portfolioButton.secondary}>
                    <GithubIcon size={16} />
                    View the code
                  </ExternalLink>
                )}
              </div>
            )}
          </header>

          {project.image_url && (
            <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--warm-bg)]">
              <Image
                src={project.image_url}
                alt={`${project.title} screenshot`}
                fill
                priority
                sizes="(min-width: 1024px) 976px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          {(project.description || project.technologies.length > 0) && (
            <div className="mt-12 grid items-start gap-10 border-t border-[var(--border)] pt-10 md:grid-cols-3">
              {project.description && (
                <Paragraphs
                  text={project.description}
                  className="text-base leading-relaxed text-[var(--foreground)]/90 sm:text-lg md:col-span-2"
                />
              )}
              {project.technologies.length > 0 && (
                <aside className={project.description ? "" : "md:col-span-3"}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Built with</h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <li key={tech}>
                        <Tag>{tech}</Tag>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}
            </div>
          )}
        </PortfolioContainer>
      </article>
    </PortfolioShell>
  );
}

export { PortfolioHome, PortfolioProjectPage };

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { ExternalLink, Tag, portfolioHref, type PortfolioBase } from "@/components/portfolio/portfolio-ui";
import type { Project } from "@/types";

const MAX_TECH = 5;

/** Whole card opens the project page (stretched title link); Code / Live stay separate links. */
function ProjectCard({ project, base }: { project: Project; base: PortfolioBase }) {
  const extra = project.technologies.length - MAX_TECH;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-[border-color,box-shadow] duration-200 hover:border-[var(--accent)] hover:shadow-md">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden border-b border-[var(--border)] bg-[var(--warm-bg)]">
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div aria-hidden className="flex h-full items-end justify-between p-5">
            <span className="font-mono text-xs text-[var(--text-muted)]">/{project.slug}</span>
            <span className="font-mono text-5xl font-bold tracking-tighter text-[var(--border)]">&lt;/&gt;</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <Tag tone="accent">{project.category}</Tag>
          {project.featured && (
            <span className="flex items-center gap-1 text-xs font-medium text-[var(--accent-dark)]">
              <Star size={14} aria-hidden className="fill-current" />
              Featured
            </span>
          )}
        </div>

        <h3 className="mt-3 text-lg leading-snug">
          <Link
            href={portfolioHref.project(base, project.slug)}
            className="transition-colors after:absolute after:inset-0 group-hover:text-[var(--accent-dark)]"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-muted)]">{project.short_description}</p>

        <div className="flex-1" />

        {project.technologies.length > 0 && (
          <ul aria-label="Technologies" className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, MAX_TECH).map((tech) => (
              <li key={tech}>
                <Tag>{tech}</Tag>
              </li>
            ))}
            {extra > 0 && (
              <li className="self-center px-1 text-xs text-[var(--text-muted)]">+{extra}</li>
            )}
          </ul>
        )}

        {(project.github_url || project.live_url) && (
          // z-10 lifts these above the stretched title link
          <div className="relative z-10 mt-4 flex items-center gap-4 border-t border-[var(--border)] pt-4 text-sm font-medium">
            {project.github_url && (
              <ExternalLink
                href={project.github_url}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--accent-dark)]"
              >
                <GithubIcon size={16} />
                Code
              </ExternalLink>
            )}
            {project.live_url && (
              <ExternalLink
                href={project.live_url}
                className="inline-flex items-center gap-1.5 text-[var(--accent-dark)] transition-colors hover:text-[var(--foreground)]"
              >
                Live
                <ArrowUpRight size={14} aria-hidden />
              </ExternalLink>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export { ProjectCard };

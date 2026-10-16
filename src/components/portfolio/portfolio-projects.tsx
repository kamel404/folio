"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/portfolio/project-card";
import { PortfolioSection, type PortfolioBase } from "@/components/portfolio/portfolio-ui";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

/**
 * Project grid with a category filter. The filter only appears when there are
 * at least two categories; without JavaScript every project is shown.
 */
function PortfolioProjects({ projects, base }: { projects: Project[]; base: PortfolioBase }) {
  const categories = [...new Set(projects.map((p) => p.category))];
  const [active, setActive] = useState<string | null>(null);
  const shown = active ? projects.filter((p) => p.category === active) : projects;

  return (
    <PortfolioSection id="projects" title="Selected work">
      {categories.length > 1 && (
        <div role="group" aria-label="Filter projects by category" className="mb-8 flex flex-wrap gap-2">
          {[null, ...categories].map((category) => {
            const selected = active === category;
            return (
              <button
                key={category ?? "all"}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(category)}
                className={cn(
                  "cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                  selected
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--foreground)]"
                )}
              >
                {category ?? "All"}
              </button>
            );
          })}
        </div>
      )}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project) => (
          <li key={project.id} className="flex">
            <ProjectCard project={project} base={base} />
          </li>
        ))}
      </ul>
    </PortfolioSection>
  );
}

export { PortfolioProjects };

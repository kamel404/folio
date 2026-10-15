"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageIcon, Pencil, Star } from "lucide-react";
import { deleteProject, reorderProjects, setProjectPublished } from "@/app/(dashboard)/dashboard/projects/actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton, MoveButtons, VisibilityToggle, useReorder } from "@/components/dashboard/list-actions";
import type { Project } from "@/types";

function ProjectList({ projects }: { projects: Project[] }) {
  const { ordered, move, pending } = useReorder(projects, reorderProjects);

  return (
    <ol className="border-t border-[var(--foreground)]" aria-busy={pending}>
      {ordered.map((project, i) => (
        <li key={project.id} className="flex items-center gap-3 border-b border-[var(--border)] py-4 sm:gap-5">
          <MoveButtons index={i} count={ordered.length} onMove={move} label={project.title} />

          <div className="relative hidden aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--surface-raised)] sm:block">
            {project.image_url ? (
              <Image src={project.image_url} alt="" fill sizes="96px" className="object-cover" />
            ) : (
              <ImageIcon size={18} className="absolute inset-0 m-auto text-[var(--text-tertiary)]" aria-hidden />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="truncate font-medium hover:text-[var(--accent)]"
              >
                {project.title}
              </Link>
              {project.featured && (
                <Badge variant="accent">
                  <Star size={10} aria-hidden /> Featured
                </Badge>
              )}
              {!project.published && <Badge variant="warning">Hidden</Badge>}
            </div>
            <p className="mt-0.5 truncate text-sm text-[var(--text-secondary)]">{project.short_description}</p>
            <p className="mt-1 truncate font-mono text-xs text-[var(--text-tertiary)]">
              {project.category}
              {project.technologies.length > 0 && ` · ${project.technologies.join(", ")}`}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <VisibilityToggle
              visible={project.published}
              label={project.title}
              toggle={(visible) => setProjectPublished(project.id, visible)}
            />
            <Link
              href={`/dashboard/projects/${project.id}`}
              aria-label={`Edit ${project.title}`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <Pencil size={14} aria-hidden />
            </Link>
            <DeleteButton noun="project" label={project.title} remove={() => deleteProject(project.id)} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export { ProjectList };

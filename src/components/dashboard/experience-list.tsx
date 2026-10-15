"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { deleteExperience, reorderExperiences } from "@/app/(dashboard)/dashboard/experience/actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton, MoveButtons, useReorder } from "@/components/dashboard/list-actions";
import { formatRange } from "@/lib/utils/dates";
import type { Experience } from "@/types";

function ExperienceList({ experiences }: { experiences: Experience[] }) {
  const { ordered, move, pending } = useReorder(experiences, reorderExperiences);

  return (
    <ol className="border-t border-[var(--foreground)]" aria-busy={pending}>
      {ordered.map((exp, i) => {
        const label = `${exp.position} at ${exp.company}`;
        return (
          <li key={exp.id} className="flex items-center gap-3 border-b border-[var(--border)] py-4 sm:gap-5">
            <MoveButtons index={i} count={ordered.length} onMove={move} label={label} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Link href={`/dashboard/experience/${exp.id}`} className="truncate font-medium hover:text-[var(--accent)]">
                  {exp.position}
                </Link>
                {exp.current && <Badge variant="success">Current</Badge>}
              </div>
              <p className="mt-0.5 truncate text-sm text-[var(--text-secondary)]">{exp.company}</p>
              <p className="mt-1 font-mono text-xs text-[var(--text-tertiary)]">
                {formatRange(exp.start_date, exp.end_date, exp.current)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/dashboard/experience/${exp.id}`}
                aria-label={`Edit ${label}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <Pencil size={14} aria-hidden />
              </Link>
              <DeleteButton noun="role" label={label} remove={() => deleteExperience(exp.id)} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { ExperienceList };

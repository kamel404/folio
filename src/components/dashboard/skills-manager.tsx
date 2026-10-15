"use client";

import { useId, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { addSkills, deleteSkill, reorderSkills, updateSkill } from "@/app/(dashboard)/dashboard/skills/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/dashboard/form-parts";
import { DeleteButton, MoveButtons, useReorder } from "@/components/dashboard/list-actions";
import { useActionForm } from "@/components/dashboard/use-action-form";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { Skill } from "@/types";

/* ─── Add ─── */

function SkillAddForm({ categories }: { categories: string[] }) {
  const listId = useId();
  const { state, pending, fieldErrors: fe, formProps } = useActionForm(addSkills, {
    // Keep the category for the next batch; clear and refocus the names
    onSuccess: (form) => {
      const names = form.elements.namedItem("names") as HTMLInputElement | null;
      if (names) {
        names.value = "";
        names.focus();
      }
    },
  });

  return (
    <form {...formProps} className="border-y border-[var(--foreground)] bg-[var(--surface)] px-5 py-6">
      <h2 className="font-sans text-base font-medium">Add skills</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Add several at once by separating them with commas.
      </p>
      <FormError error={state.error} className="mt-4" />
      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-start">
        <Input name="names" label="Skills" placeholder="React, TypeScript, Node.js" required error={fe.names} />
        <div>
          <Input name="category" label="Category" placeholder="Frontend" list={listId} required error={fe.category} />
          <datalist id={listId}>
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <Button type="submit" isLoading={pending} loadingText="Adding…" className="sm:mt-[1.875rem]">
          <Plus size={16} aria-hidden />
          Add
        </Button>
      </div>
    </form>
  );
}

/* ─── Edit (inline) ─── */

function SkillEditForm({ skill, categories, onDone }: { skill: Skill; categories: string[]; onDone: () => void }) {
  const listId = useId();
  const { state, pending, fieldErrors: fe, formProps } = useActionForm(updateSkill.bind(null, skill.id), {
    onSuccess: onDone,
  });

  return (
    <form {...formProps} className="flex-1 py-1">
      <FormError error={state.error} className="mb-3" />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start">
        <Input name="name" label="Skill" defaultValue={skill.name} required autoFocus error={fe.name} />
        <div>
          <Input name="category" label="Category" defaultValue={skill.category} list={listId} required error={fe.category} />
          <datalist id={listId}>
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="flex gap-2 sm:mt-[1.875rem]">
          <Button type="button" variant="ghost" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={pending} loadingText="Saving…">
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}

/* ─── List ─── */

function SkillGroup({ name, skills, categories }: { name: string; skills: Skill[]; categories: string[] }) {
  const { ordered, move, pending } = useReorder(skills, reorderSkills);
  const [editing, setEditing] = useState<string | null>(null);
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="mt-10">
      <h3 id={headingId} className="flex items-baseline gap-3 label-mono font-sans text-[var(--text-tertiary)]">
        {name}
        <span className="text-[var(--text-tertiary)]/70">{skills.length}</span>
      </h3>
      <ol className="mt-3 border-t border-[var(--foreground)]" aria-busy={pending}>
        {ordered.map((skill, i) => (
          <li key={skill.id} className="flex items-center gap-3 border-b border-[var(--border)] py-2.5 sm:gap-5">
            {editing === skill.id ? (
              <SkillEditForm skill={skill} categories={categories} onDone={() => setEditing(null)} />
            ) : (
              <>
                <MoveButtons index={i} count={ordered.length} onMove={move} label={skill.name} />
                <span className="min-w-0 flex-1 truncate">{skill.name}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(skill.id)}
                    aria-label={`Edit ${skill.name}`}
                  >
                    <Pencil size={14} aria-hidden />
                  </Button>
                  <DeleteButton noun="skill" label={skill.name} remove={() => deleteSkill(skill.id)} />
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

interface SkillsManagerProps {
  skills: Skill[];
  /** Tenant's categories + suggestions, for the category inputs */
  categories: string[];
}

function SkillsManager({ skills, categories }: SkillsManagerProps) {
  // Group by category, in order of each category's first skill
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) groups.set(skill.category, [...(groups.get(skill.category) ?? []), skill]);

  return (
    <>
      <SkillAddForm categories={categories} />
      {groups.size === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No skills yet."
            body="Add the languages, frameworks and tools you work with, grouped into categories."
          />
        </div>
      ) : (
        [...groups].map(([name, list]) => (
          <SkillGroup key={name} name={name} skills={list} categories={categories} />
        ))
      )}
    </>
  );
}

export { SkillsManager };

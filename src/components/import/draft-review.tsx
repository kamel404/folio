"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Textarea } from "@/components/ui/input";
import { FieldRow, FormError } from "@/components/dashboard/form-parts";
import {
  countDraftErrors,
  validateExperience,
  validateProfile,
  validateProject,
  validateSkill,
  type DraftExperience,
  type DraftProfile,
  type DraftProject,
  type DraftSkill,
  type PortfolioDraft,
} from "@/lib/ai/draft";
import { cn } from "@/lib/utils";
import { formatRange } from "@/lib/utils/dates";
import type { Profile } from "@/types";

interface DraftReviewProps {
  draft: PortfolioDraft;
  onChange: (draft: PortfolioDraft) => void;
  /** The profile as saved now, to show what an imported field replaces */
  current: Profile;
  onImport: () => void;
  onStartOver: () => void;
  importing: boolean;
  error: string | null;
  submitLabel: string;
}

function Section({ title, count, note, children }: { title: string; count?: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--border)] py-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-sans text-lg font-semibold tracking-normal">{title}</h2>
        {count && <p className="label-mono text-[var(--text-tertiary)]">{count}</p>}
      </div>
      {note && <p className="-mt-3 mb-5 text-sm text-[var(--text-secondary)]">{note}</p>}
      {children}
    </section>
  );
}

/** One experience or project: an include checkbox, a summary line, and the fields while included. */
function ItemCard({
  include,
  onInclude,
  heading,
  sub,
  hasErrors,
  children,
}: {
  include: boolean;
  onInclude: (v: boolean) => void;
  heading: string;
  sub: string;
  hasErrors: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(hasErrors);
  const expanded = include && (open || hasErrors);
  return (
    <li className={cn("border-b border-[var(--border)] py-4", !include && "opacity-60")}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={include}
          onChange={(e) => onInclude(e.target.checked)}
          aria-label={`Include ${heading}`}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[var(--foreground)]"
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={!include}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 cursor-pointer items-start justify-between gap-3 text-left disabled:cursor-default"
        >
          <span className="min-w-0">
            <span className={cn("block truncate font-medium", !include && "line-through")}>{heading || "Untitled"}</span>
            <span className="block truncate text-sm text-[var(--text-secondary)]">{sub}</span>
            {include && hasErrors && <span className="mt-1 block text-sm text-[var(--error)]">Needs attention</span>}
          </span>
          {include && (
            <ChevronDown size={16} aria-hidden className={cn("mt-1 shrink-0 transition-transform", expanded && "rotate-180")} />
          )}
        </button>
      </div>
      {expanded && <div className="mt-4 flex flex-col gap-4 pl-7">{children}</div>}
    </li>
  );
}

function DraftReview({ draft, onChange, current, onImport, onStartOver, importing, error, submitLabel }: DraftReviewProps) {
  const errorCount = useMemo(() => countDraftErrors(draft), [draft]);
  const profileErrors = validateProfile(draft.profile);

  const setProfile = (field: keyof DraftProfile, value: string) =>
    onChange({ ...draft, profile: { ...draft.profile, [field]: value } });
  const setExperience = (key: string, patch: Partial<DraftExperience>) =>
    onChange({ ...draft, experiences: draft.experiences.map((e) => (e.key === key ? { ...e, ...patch } : e)) });
  const setProject = (key: string, patch: Partial<DraftProject>) =>
    onChange({ ...draft, projects: draft.projects.map((p) => (p.key === key ? { ...p, ...patch } : p)) });
  const setSkill = (key: string, patch: Partial<DraftSkill>) =>
    onChange({ ...draft, skills: draft.skills.map((s) => (s.key === key ? { ...s, ...patch } : s)) });

  /** "Replaces …" under fields that already have a different saved value. */
  const replaces = (field: keyof DraftProfile) => {
    const saved = (current[field] ?? "").trim();
    const next = draft.profile[field].trim();
    if (!saved || saved === next) return undefined;
    return `Replaces: ${saved.length > 80 ? `${saved.slice(0, 80)}…` : saved}`;
  };
  const pf = (field: keyof DraftProfile, label: string, extra: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <Input
      label={label}
      value={draft.profile[field]}
      onChange={(e) => setProfile(field, e.target.value)}
      error={profileErrors[field]}
      hint={replaces(field)}
      {...extra}
    />
  );

  const included = {
    experiences: draft.experiences.filter((e) => e.include).length,
    projects: draft.projects.filter((p) => p.include).length,
    skills: draft.skills.filter((s) => s.include).length,
  };
  const skillGroups = useMemo(() => {
    const groups = new Map<string, DraftSkill[]>();
    for (const s of draft.skills) groups.set(s.category, [...(groups.get(s.category) ?? []), s]);
    return [...groups.entries()];
  }, [draft.skills]);

  return (
    <div>
      <FormError error={error ?? undefined} className="mb-2" />

      <p className="text-[var(--text-secondary)]">
        {draft.source === "cv" ? "Here's what we found in your CV." : "Here's a first draft from your answers."} Check it,
        change anything, and untick what you don&apos;t want. Nothing is saved until you import.
      </p>

      <Section title="Profile">
        <div className="flex flex-col gap-5">
          <FieldRow>
            {pf("name", "Full name")}
            {pf("title", "Headline")}
          </FieldRow>
          <Textarea
            label="Short bio"
            rows={2}
            value={draft.profile.short_bio}
            onChange={(e) => setProfile("short_bio", e.target.value)}
            error={profileErrors.short_bio}
            hint={replaces("short_bio") ?? "One or two sentences under your name."}
          />
          <Textarea
            label="About you"
            rows={5}
            value={draft.profile.long_bio}
            onChange={(e) => setProfile("long_bio", e.target.value)}
            error={profileErrors.long_bio}
            hint={replaces("long_bio")}
          />
          <FieldRow>
            {pf("location", "Location")}
            {pf("email", "Public email", { type: "email" })}
          </FieldRow>
          <FieldRow>
            {pf("phone", "Phone", { type: "tel" })}
            {pf("linkedin_url", "LinkedIn")}
          </FieldRow>
          <FieldRow>{pf("github_url", "GitHub")}</FieldRow>
        </div>
      </Section>

      <Section
        title="Experience"
        count={`${included.experiences} of ${draft.experiences.length}`}
        note={draft.experiences.length === 0 ? "No roles found. You can add them later under Experience." : undefined}
      >
        <ul className="border-t border-[var(--border)]">
          {draft.experiences.map((e) => {
            const fe = validateExperience(e);
            return (
              <ItemCard
                key={e.key}
                include={e.include}
                onInclude={(v) => setExperience(e.key, { include: v })}
                heading={[e.position, e.company].filter(Boolean).join(" at ")}
                sub={e.start_date ? formatRange(e.start_date, e.end_date || null, e.current) : "Dates missing"}
                hasErrors={e.include && Object.keys(fe).length > 0}
              >
                <FieldRow>
                  <Input label="Job title" value={e.position} onChange={(ev) => setExperience(e.key, { position: ev.target.value })} error={fe.position} />
                  <Input label="Company" value={e.company} onChange={(ev) => setExperience(e.key, { company: ev.target.value })} error={fe.company} />
                </FieldRow>
                <FieldRow>
                  <Input label="Started" type="month" value={e.start_date} onChange={(ev) => setExperience(e.key, { start_date: ev.target.value })} error={fe.start_date} />
                  <Input
                    label="Ended"
                    type="month"
                    value={e.current ? "" : e.end_date}
                    disabled={e.current}
                    onChange={(ev) => setExperience(e.key, { end_date: ev.target.value })}
                    error={e.current ? undefined : fe.end_date}
                  />
                </FieldRow>
                <Checkbox label="I work here now" checked={e.current} onChange={(ev) => setExperience(e.key, { current: ev.target.checked })} />
                <Textarea
                  label="What you did"
                  rows={4}
                  value={e.description}
                  onChange={(ev) => setExperience(e.key, { description: ev.target.value })}
                  error={fe.description}
                />
              </ItemCard>
            );
          })}
        </ul>
      </Section>

      <Section
        title="Projects"
        count={`${included.projects} of ${draft.projects.length}`}
        note={draft.projects.length === 0 ? "No projects found. You can add them later under Projects." : undefined}
      >
        <ul className="border-t border-[var(--border)]">
          {draft.projects.map((p) => {
            const fe = validateProject(p);
            return (
              <ItemCard
                key={p.key}
                include={p.include}
                onInclude={(v) => setProject(p.key, { include: v })}
                heading={p.title}
                sub={p.short_description || p.category}
                hasErrors={p.include && Object.keys(fe).length > 0}
              >
                <FieldRow>
                  <Input label="Title" value={p.title} onChange={(ev) => setProject(p.key, { title: ev.target.value })} error={fe.title} />
                  <Input label="Category" value={p.category} onChange={(ev) => setProject(p.key, { category: ev.target.value })} error={fe.category} />
                </FieldRow>
                <Textarea
                  label="Short description"
                  rows={2}
                  value={p.short_description}
                  onChange={(ev) => setProject(p.key, { short_description: ev.target.value })}
                  error={fe.short_description}
                />
                <Textarea
                  label="Full description"
                  rows={4}
                  value={p.description}
                  onChange={(ev) => setProject(p.key, { description: ev.target.value })}
                  error={fe.description}
                />
                <Input
                  label="Technologies"
                  hint="Separated by commas."
                  value={p.technologies}
                  onChange={(ev) => setProject(p.key, { technologies: ev.target.value })}
                  error={fe.technologies}
                />
                <FieldRow>
                  <Input label="Code link" value={p.github_url} onChange={(ev) => setProject(p.key, { github_url: ev.target.value })} error={fe.github_url} />
                  <Input label="Live link" value={p.live_url} onChange={(ev) => setProject(p.key, { live_url: ev.target.value })} error={fe.live_url} />
                </FieldRow>
              </ItemCard>
            );
          })}
        </ul>
      </Section>

      <Section
        title="Skills"
        count={`${included.skills} of ${draft.skills.length}`}
        note={draft.skills.length === 0 ? "No skills found. You can add them later under Skills." : "Click a skill to leave it out."}
      >
        <div className="flex flex-col gap-5">
          {skillGroups.map(([category, skills]) => (
            <div key={category}>
              <p className="label-mono text-[var(--text-tertiary)]">{category}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {skills.map((s) => {
                  const problem = s.include ? Object.values(validateSkill(s))[0] : undefined;
                  return (
                    <li key={s.key}>
                      <button
                        type="button"
                        aria-pressed={s.include}
                        title={problem}
                        onClick={() => setSkill(s.key, { include: !s.include })}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-sm border px-2.5 py-1 text-sm transition-colors duration-150",
                          s.include
                            ? "border-[var(--foreground)] bg-[var(--surface)]"
                            : "border-dashed border-[var(--border)] text-[var(--text-tertiary)] line-through",
                          problem && "border-[var(--error)] text-[var(--error)]"
                        )}
                      >
                        {s.name}
                        {s.include ? <X size={12} aria-hidden /> : <Plus size={12} aria-hidden />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--background)]/95 px-6 py-4 backdrop-blur">
        <Button type="button" variant="ghost" onClick={onStartOver} disabled={importing}>
          Start over
        </Button>
        <div className="flex flex-wrap items-center gap-4">
          <p className={cn("text-sm", errorCount ? "text-[var(--error)]" : "text-[var(--text-secondary)]")} aria-live="polite">
            {errorCount
              ? `${errorCount} ${errorCount === 1 ? "item needs" : "items need"} attention`
              : `${included.experiences} roles · ${included.projects} projects · ${included.skills} skills`}
          </p>
          <Button type="button" onClick={onImport} isLoading={importing} loadingText="Importing…" disabled={errorCount > 0}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { DraftReview };

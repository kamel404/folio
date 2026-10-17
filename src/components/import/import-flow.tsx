"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { FileText, MessageSquareText, PenLine } from "lucide-react";
import { toast } from "sonner";
import { importDraftAction, type DraftResult, type ImportResult } from "@/app/(dashboard)/dashboard/import/actions";
import { ConfirmDialog } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CvSource } from "@/components/import/cv-source";
import { InterviewSource } from "@/components/import/interview-source";
import { DraftReview } from "@/components/import/draft-review";
import { isDraft, type PortfolioDraft } from "@/lib/ai/draft";
import type { InterviewAnswers } from "@/lib/ai/interview";
import type { AiAllowance } from "@/lib/ai/usage";
import type { ImportSummary } from "@/lib/data/import";
import { NETWORK_FAILED } from "@/lib/forms";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

type Stage = "choose" | "cv" | "interview" | "review";

interface Saved {
  stage: Stage;
  draft: PortfolioDraft | null;
  answers: InterviewAnswers;
}

const EMPTY: Saved = { stage: "choose", draft: null, answers: {} };

/*
 * Work in progress lives in localStorage, per tenant: an unpaid user gets one
 * AI import, so a reload on the review screen must not throw that draft away.
 * Storage can be unavailable (private mode, blocked): everything still works,
 * only without the safety net.
 */
const storageKey = (tenantId: string) => `folio:import:${tenantId}`;

function load(tenantId: string): Saved {
  try {
    const raw = window.localStorage.getItem(storageKey(tenantId));
    if (!raw) return EMPTY;
    const saved = JSON.parse(raw) as Saved;
    const draft = isDraft(saved.draft) ? saved.draft : null;
    const stage = saved.stage === "review" && !draft ? "choose" : saved.stage;
    return { stage: ["choose", "cv", "interview", "review"].includes(stage) ? stage : "choose", draft, answers: saved.answers ?? {} };
  } catch {
    return EMPTY;
  }
}

function persist(tenantId: string, saved: Saved | null) {
  try {
    if (saved) window.localStorage.setItem(storageKey(tenantId), JSON.stringify(saved));
    else window.localStorage.removeItem(storageKey(tenantId));
  } catch {
    /* storage unavailable: carry on without it */
  }
}

export function summaryText(s: ImportSummary): string {
  const parts = [
    s.experiences && `${s.experiences} ${s.experiences === 1 ? "role" : "roles"}`,
    s.projects && `${s.projects} ${s.projects === 1 ? "project" : "projects"}`,
    s.skills && `${s.skills} ${s.skills === 1 ? "skill" : "skills"}`,
  ].filter(Boolean);
  const added = parts.length ? `Added ${parts.join(", ")}` : "Profile updated";
  return s.skipped ? `${added}. ${s.skipped} already in your portfolio, so skipped.` : `${added}.`;
}

interface ImportFlowProps {
  tenantId: string;
  profile: Profile;
  allowance: AiAllowance;
  onImported: (summary: ImportSummary) => void;
  /** Onboarding only: a third choice that skips the AI entirely */
  onStartEmpty?: () => void;
  /** Onboarding only: back to the previous wizard step (shown on the choose screen; the other screens have their own Back) */
  onBack?: () => void;
  submitLabel?: string;
}

function ImportFlow({
  tenantId,
  profile,
  allowance: initialAllowance,
  onImported,
  onStartEmpty,
  onBack,
  submitLabel = "Import",
}: ImportFlowProps) {
  const [saved, setSaved] = useState<Saved>(EMPTY);
  const [restored, setRestored] = useState(false);
  const [allowance, setAllowance] = useState(initialAllowance);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmStartOver, setConfirmStartOver] = useState(false);
  const [importing, startImport] = useTransition();

  // Restore after mount (localStorage isn't available during the server render)
  useEffect(() => {
    setSaved(load(tenantId)); // eslint-disable-line react-hooks/set-state-in-effect -- one-time restore from browser storage
    setRestored(true);
  }, [tenantId]);

  const update = (next: Saved) => {
    setSaved(next);
    persist(tenantId, next);
  };
  const go = (stage: Stage) => update({ ...saved, stage });

  function onDraft(result: Extract<DraftResult, { ok: true }>) {
    setAllowance(result.allowance);
    setImportError(null);
    update({ ...saved, stage: "review", draft: result.draft });
    window.scrollTo({ top: 0 });
  }

  function runImport() {
    if (!saved.draft) return;
    setImportError(null);
    const draft = saved.draft;
    startImport(async () => {
      let result: ImportResult;
      try {
        result = await importDraftAction(draft);
      } catch (e) {
        console.error(e);
        setImportError(NETWORK_FAILED);
        return;
      }
      if (result.ok) {
        toast.success(summaryText(result.summary));
        persist(tenantId, null);
        setSaved(EMPTY);
        onImported(result.summary);
      } else {
        setImportError(result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (!restored) return <div className="min-h-64" aria-busy="true" />;

  if (saved.stage === "review" && saved.draft) {
    return (
      <>
        <DraftReview
          draft={saved.draft}
          onChange={(draft) => update({ ...saved, draft })}
          current={profile}
          onImport={runImport}
          onStartOver={() => setConfirmStartOver(true)}
          importing={importing}
          error={importError}
          submitLabel={submitLabel}
        />
        <ConfirmDialog
          open={confirmStartOver}
          onClose={() => setConfirmStartOver(false)}
          onConfirm={() => {
            setConfirmStartOver(false);
            setImportError(null);
            update({ ...EMPTY, answers: saved.answers });
          }}
          title="Throw away this draft?"
          description={
            allowance.importsLeft === 0
              ? "You've used your free AI import, so you won't be able to make another draft until you choose a plan."
              : "Nothing from it has been saved. Making a new draft uses another AI import."
          }
          confirmLabel="Throw it away"
        />
      </>
    );
  }

  if (saved.stage === "cv") return <CvSource onDraft={onDraft} onBack={() => go("choose")} />;
  if (saved.stage === "interview") {
    return (
      <InterviewSource
        answers={saved.answers}
        onAnswers={(answers) => update({ ...saved, answers })}
        onDraft={onDraft}
        onBack={() => go("choose")}
      />
    );
  }

  /* Choose a source */
  const noAi = allowance.importsLeft === 0 || allowance.dailyCapReached;
  const sources = [
    { id: "cv" as const, icon: FileText, title: "Upload your CV", body: "PDF or Word. We pull out your roles, projects and skills.", time: "About 20 seconds" },
    { id: "interview" as const, icon: MessageSquareText, title: "Answer a few questions", body: "Nine short questions. We write a first draft from your answers.", time: "About 5 minutes" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {allowance.importsLeft === 1 && (
        <p className="text-sm text-[var(--text-secondary)]">
          Before you choose a plan, you get one AI import. You&apos;ll review everything before it&apos;s saved.
        </p>
      )}
      {noAi && (
        <p role="status" className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
          {allowance.dailyCapReached
            ? "You've reached today's AI limit. It resets at midnight UTC."
            : "You've used your free AI import. "}
          {!allowance.dailyCapReached && (
            <Link href="/pricing" className="link-underline">
              Choose a plan to import again.
            </Link>
          )}
        </p>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {sources.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => go(s.id)}
              disabled={noAi}
              className={cn(
                "flex h-full w-full cursor-pointer flex-col items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-left transition-colors duration-150",
                "hover:border-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--border)]"
              )}
            >
              <s.icon size={22} aria-hidden className="text-[var(--accent)]" />
              <span className="text-lg font-semibold">{s.title}</span>
              <span className="text-sm text-[var(--text-secondary)]">{s.body}</span>
              <span className="mt-auto label-mono text-[var(--text-tertiary)]">{s.time}</span>
            </button>
          </li>
        ))}
      </ul>

      {onStartEmpty && (
        <button
          type="button"
          onClick={onStartEmpty}
          className="flex cursor-pointer items-center gap-3 self-start rounded-md px-1 py-2 text-left text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)]"
        >
          <PenLine size={16} aria-hidden />
          <span>
            <span className="link-underline">Start empty</span> and fill everything in yourself.
          </span>
        </button>
      )}

      {onBack && (
        <div className="mt-5 border-t border-[var(--border)] pt-6">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

export { ImportFlow };

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { draftFromInterviewAction, type DraftResult } from "@/app/(dashboard)/dashboard/import/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FormError } from "@/components/dashboard/form-parts";
import { INTERVIEW_QUESTIONS, interviewProblem, type InterviewAnswers } from "@/lib/ai/interview";
import { NETWORK_FAILED } from "@/lib/forms";

interface InterviewSourceProps {
  answers: InterviewAnswers;
  onAnswers: (answers: InterviewAnswers) => void;
  onDraft: (result: Extract<DraftResult, { ok: true }>) => void;
  onBack: () => void;
}

const LAST = INTERVIEW_QUESTIONS.length - 1;

/** The guided interview: one question per screen, then the AI writes a draft from all answers. */
function InterviewSource({ answers, onAnswers, onDraft, onBack }: InterviewSourceProps) {
  // Resume at the first unanswered question (answers survive a reload)
  const [index, setIndex] = useState(() => {
    const i = INTERVIEW_QUESTIONS.findIndex((q) => !(answers[q.id] ?? "").trim());
    return i === -1 ? LAST : i;
  });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const q = INTERVIEW_QUESTIONS[index];
  const value = answers[q.id] ?? "";

  useEffect(() => fieldRef.current?.focus(), [index]);

  function next() {
    setError(null);
    const trimmed = value.trim();
    if (!q.optional && !trimmed) return setFieldError("This one is needed to write your portfolio.");
    if (trimmed.length > q.max) return setFieldError(`Keep it under ${q.max} characters.`);
    setFieldError(null);
    if (index < LAST) return setIndex(index + 1);

    const problem = interviewProblem(answers);
    if (problem) return setError(problem);
    startTransition(async () => {
      let result: DraftResult;
      try {
        result = await draftFromInterviewAction(answers);
      } catch (e) {
        console.error(e);
        setError(NETWORK_FAILED);
        return;
      }
      if (result.ok) onDraft(result);
      else setError(result.error);
    });
  }

  const props = {
    ref: fieldRef,
    label: q.question,
    hint: q.hint,
    placeholder: q.placeholder,
    value,
    maxLength: q.max,
    disabled: pending,
    error: fieldError ?? undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFieldError(null);
      onAnswers({ ...answers, [q.id]: e.target.value });
    },
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
      className="flex flex-col gap-6"
    >
      <FormError error={error ?? undefined} />

      <div className="flex items-center gap-3">
        <p className="label-mono text-[var(--text-tertiary)]">
          Question {index + 1} of {INTERVIEW_QUESTIONS.length}
        </p>
        <div className="h-px flex-1 bg-[var(--border)]">
          <div
            className="h-px bg-[var(--accent)] transition-[width] duration-300"
            style={{ width: `${((index + 1) / INTERVIEW_QUESTIONS.length) * 100}%` }}
          />
        </div>
        {q.optional && <span className="label-mono text-[var(--text-tertiary)]">Optional</span>}
      </div>

      {/* key: a fresh field per question, so focus and errors reset */}
      <div key={q.id} className="animate-fade-in-up [&_label]:font-display [&_label]:text-3xl [&_label]:font-normal [&_label]:leading-tight">
        {q.short ? <Input {...props} /> : <Textarea {...props} rows={6} />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => (index === 0 ? onBack() : (setFieldError(null), setIndex(index - 1)))}
          disabled={pending}
        >
          Back
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          {pending && <p className="text-sm text-[var(--text-secondary)]" role="status">This usually takes 10–20 seconds.</p>}
          {q.optional && !value.trim() && index < LAST && (
            <Button type="button" variant="ghost" onClick={() => setIndex(index + 1)} disabled={pending}>
              Skip
            </Button>
          )}
          <Button type="submit" isLoading={pending} loadingText="Writing your portfolio…">
            {index < LAST ? "Next" : "Write my portfolio"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export { InterviewSource };

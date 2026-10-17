"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { rewriteAction, type RewriteResult } from "@/app/(dashboard)/dashboard/import/actions";
import { Button } from "@/components/ui/button";
import { SignInAgainLink } from "@/components/dashboard/sign-in-again";
import { useAiAllowance } from "@/components/dashboard/ai-allowance";
import type { RewriteField } from "@/lib/ai/content-generator";
import { NETWORK_FAILED, SESSION_EXPIRED } from "@/lib/forms";

interface RewriteButtonProps {
  /** Which kind of text this is (sets the length and style the AI aims for) */
  field: RewriteField;
  /** name of the textarea in the same form */
  target: string;
}

/** Fill an uncontrolled textarea the way typing would, so the form sees the change. */
function setFieldValue(el: HTMLTextAreaElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * "Rewrite with AI" under a textarea (Starter and Pro). Shows the suggestion
 * next to the original; nothing changes until "Use this", and nothing is
 * saved until the form is.
 */
function RewriteButton({ field, target }: RewriteButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { allowance, setAllowance } = useAiAllowance();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const textarea = () =>
    ref.current?.closest("form")?.elements.namedItem(target) as HTMLTextAreaElement | null | undefined;

  if (!allowance) return null;

  if (!allowance.canRewrite) {
    return (
      <p className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
        <PenLine size={14} aria-hidden />
        AI rewrites come with{" "}
        <Link href="/pricing" className="link-underline hover:text-[var(--foreground)]">
          Starter and Pro
        </Link>
      </p>
    );
  }

  const outOfRewrites = allowance.rewritesLeft === 0 || allowance.dailyCapReached;

  function run() {
    setError(null);
    setSuggestion(null);
    const text = textarea()?.value ?? "";
    startTransition(async () => {
      let result: RewriteResult;
      try {
        result = await rewriteAction(field, text);
      } catch (e) {
        console.error(e);
        setError(NETWORK_FAILED);
        return;
      }
      if (result.ok) {
        setSuggestion(result.text);
        setAllowance(result.allowance);
      } else setError(result.error);
    });
  }

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={run} isLoading={pending} loadingText="Rewriting…" disabled={outOfRewrites}>
          <PenLine size={14} aria-hidden />
          Rewrite with AI
        </Button>
        {allowance.rewritesLeft !== null && (
          <span className="text-xs text-[var(--text-tertiary)]">
            {allowance.rewritesLeft} {allowance.rewritesLeft === 1 ? "rewrite" : "rewrites"} left this month
          </span>
        )}
        {allowance.dailyCapReached && <span className="text-xs text-[var(--text-tertiary)]">Today&apos;s AI limit reached</span>}
      </div>

      {error && (
        <p role="alert" className="text-sm text-[var(--error)]">
          {error}
          {error === SESSION_EXPIRED && (
            <>
              {" "}
              <SignInAgainLink />
            </>
          )}
        </p>
      )}

      {suggestion && (
        <div role="region" aria-label="AI suggestion" className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="label-mono text-[var(--text-tertiary)]">Suggestion</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{suggestion}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const el = textarea();
                if (el) {
                  setFieldValue(el, suggestion);
                  el.focus();
                }
                setSuggestion(null);
              }}
            >
              Use this
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSuggestion(null)}>
              Keep mine
            </Button>
          </div>
          <p className="mt-3 text-xs text-[var(--text-tertiary)]">Check it says what you mean, then save the form.</p>
        </div>
      )}
    </div>
  );
}

export { RewriteButton };

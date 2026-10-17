"use client";

import { useId, useRef, useState, useTransition } from "react";
import { FileText, Upload, X } from "lucide-react";
import { draftFromCvAction, type DraftResult } from "@/app/(dashboard)/dashboard/import/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { FormError } from "@/components/dashboard/form-parts";
import { NETWORK_FAILED } from "@/lib/forms";
import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";
const MAX_BYTES = 4 * 1024 * 1024; // keep in sync with MAX_CV_BYTES in lib/ai/cv-parser.ts

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

interface CvSourceProps {
  onDraft: (result: Extract<DraftResult, { ok: true }>) => void;
  onBack: () => void;
}

/** Upload a CV (or paste its text) and turn it into a draft. */
function CvSource({ onDraft, onBack }: CvSourceProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [paste, setPaste] = useState(false);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(f: File | undefined) {
    setError(null);
    setFieldError(null);
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setFieldError("That file is over 4 MB. Try a smaller PDF, or paste the text instead.");
      return;
    }
    if (!/\.(pdf|docx|txt)$/i.test(f.name)) {
      setFieldError(/\.doc$/i.test(f.name) ? "Old .doc files aren't supported. Save it as .docx or PDF first." : "Use a PDF or Word (.docx) file.");
      return;
    }
    setFile(f);
  }

  function submit() {
    setError(null);
    setFieldError(null);
    if (paste ? !text.trim() : !file) {
      setFieldError(paste ? "Paste the text of your CV." : "Choose your CV file first.");
      return;
    }
    const fd = new FormData();
    if (paste) fd.set("cv_text", text);
    else fd.set("cv", file!);
    startTransition(async () => {
      let result: DraftResult;
      try {
        result = await draftFromCvAction(fd);
      } catch (e) {
        console.error(e);
        setError(NETWORK_FAILED);
        return;
      }
      if (result.ok) onDraft(result);
      else if (result.field === "cv") setFieldError(result.error);
      else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <FormError error={error ?? undefined} />

      {paste ? (
        <Textarea
          label="Your CV, as text"
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          hint="Open your CV, select everything and paste it here. Formatting doesn't matter."
          error={fieldError ?? undefined}
          disabled={pending}
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={id} className="text-sm font-medium">
            Your CV
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pick(e.dataTransfer.files[0]);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center transition-colors duration-150",
              dragging ? "border-[var(--accent)] bg-[var(--accent-light)]" : "border-[var(--border)] bg-[var(--surface)]",
              fieldError && "border-[var(--error)]"
            )}
          >
            {file ? (
              <div className="flex w-full max-w-sm items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-left">
                <FileText size={20} aria-hidden className="shrink-0 text-[var(--accent)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="font-mono text-xs text-[var(--text-tertiary)]">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  disabled={pending}
                  aria-label={`Remove ${file.name}`}
                  className="cursor-pointer rounded-sm p-1 text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>
            ) : (
              <>
                <Upload size={22} aria-hidden className="text-[var(--text-tertiary)]" />
                <p className="text-sm text-[var(--text-secondary)]">Drag your CV here, or</p>
              </>
            )}
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={pending}>
              {file ? "Choose another file" : "Choose a file"}
            </Button>
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => pick(e.target.files?.[0])}
              aria-invalid={!!fieldError}
              aria-describedby={`${id}-help`}
            />
          </div>
          {fieldError ? (
            <p id={`${id}-help`} role="alert" className="text-sm text-[var(--error)]">
              {fieldError}
            </p>
          ) : (
            <p id={`${id}-help`} className="text-sm text-[var(--text-secondary)]">
              PDF or Word (.docx), up to 4 MB. It&apos;s only read to fill in your portfolio; the file isn&apos;t stored.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setPaste(!paste);
          setFieldError(null);
        }}
        disabled={pending}
        className="self-start cursor-pointer text-sm text-[var(--text-secondary)] link-underline hover:text-[var(--foreground)]"
      >
        {paste ? "Upload a file instead" : "Scanned PDF, or no file? Paste the text instead"}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
        <Button type="button" variant="ghost" onClick={onBack} disabled={pending}>
          Back
        </Button>
        <div className="flex flex-wrap items-center gap-4">
          {pending && <p className="text-sm text-[var(--text-secondary)]" role="status">This usually takes 10–20 seconds.</p>}
          <Button type="button" onClick={submit} isLoading={pending} loadingText="Reading your CV…">
            Read my CV
          </Button>
        </div>
      </div>
    </div>
  );
}

export { CvSource };

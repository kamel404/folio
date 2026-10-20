"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Modal built on the native <dialog>: focus trapping, Esc to close and the
 * inert background come from the browser. Clicking the backdrop closes it.
 */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Blocks closing (Esc / backdrop / ×) while something is in flight */
  busy?: boolean;
  className?: string;
}

function Modal({ open, onClose, title, description, children, busy = false, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault(); // keep React in charge of `open`
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--foreground)] shadow-[var(--shadow-xl)]",
        "backdrop:bg-[var(--ink)]/40 open:animate-[fadeIn_150ms_ease-out]",
        className
      )}
    >
      {open && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-display text-2xl leading-tight">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
              className="-mr-2 -mt-1 cursor-pointer rounded-sm p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)] disabled:opacity-50"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          {description && (
            <div className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</div>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      )}
    </dialog>
  );
}

/* ─── ConfirmDialog: the standard "are you sure?" for destructive actions ─── */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  pendingLabel?: string;
  pending?: boolean;
  /** "primary" for confirmations that aren't destructive (e.g. switching plan) */
  tone?: "danger" | "primary";
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  pendingLabel = "Deleting…",
  pending = false,
  tone = "danger",
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} busy={pending}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button variant={tone} onClick={onConfirm} isLoading={pending} loadingText={pendingLabel}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export { Modal, ConfirmDialog };

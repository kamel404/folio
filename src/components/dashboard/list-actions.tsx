"use client";

import { useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { NETWORK_FAILED, SESSION_EXPIRED, type ActionResult } from "@/lib/forms";
import { cn } from "@/lib/utils";

/**
 * One-shot list actions (reorder, toggle, delete). Each follows the same rules:
 *   • the UI updates optimistically where it's safe (order, visibility)
 *   • on failure the change rolls back and the error appears as a toast
 *   • on success a short confirmation toast (except reorder, which is self-evident)
 */

/** Calls an action and turns an unexpected throw (network down, deploy skew) into a failed result. */
export async function run<T extends { ok: boolean }>(action: () => Promise<T>): Promise<T | { ok: false; error: string }> {
  try {
    return await action();
  } catch (error) {
    console.error(error);
    return { ok: false, error: NETWORK_FAILED };
  }
}

/** Error toast; an expired session gets a "Sign in" button that returns to this page. */
export function useToastError() {
  const router = useRouter();
  const pathname = usePathname();
  return (message: string) =>
    toast.error(
      message,
      message === SESSION_EXPIRED
        ? { action: { label: "Sign in", onClick: () => router.push(`/login?next=${encodeURIComponent(pathname)}`) } }
        : undefined
    );
}

/* ─── Reorder ─── */

export function useReorder<T extends { id: string }>(items: T[], save: (ids: string[]) => Promise<ActionResult>) {
  const [ordered, setOptimistic] = useOptimistic(items);
  const [pending, startTransition] = useTransition();
  const toastError = useToastError();

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];
    startTransition(async () => {
      setOptimistic(next);
      const result = await run(() => save(next.map((i) => i.id)));
      if (!result.ok) toastError(result.error); // optimistic state falls back to `items`
    });
  }

  return { ordered, move, pending };
}

interface MoveButtonsProps {
  index: number;
  count: number;
  onMove: (index: number, direction: -1 | 1) => void;
  label: string;
  disabled?: boolean;
}

export function MoveButtons({ index, count, onMove, label, disabled }: MoveButtonsProps) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => onMove(index, -1)}
        disabled={disabled || index === 0}
        aria-label={`Move ${label} up`}
        className="cursor-pointer rounded-sm p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-30"
      >
        <ArrowUp size={14} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onMove(index, 1)}
        disabled={disabled || index === count - 1}
        aria-label={`Move ${label} down`}
        className="cursor-pointer rounded-sm p-1 text-[var(--text-tertiary)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)] disabled:pointer-events-none disabled:opacity-30"
      >
        <ArrowDown size={14} aria-hidden />
      </button>
    </div>
  );
}

/* ─── Visibility toggle ─── */

interface VisibilityToggleProps {
  visible: boolean;
  label: string;
  toggle: (visible: boolean) => Promise<ActionResult>;
}

export function VisibilityToggle({ visible, label, toggle }: VisibilityToggleProps) {
  const [optimistic, setOptimistic] = useOptimistic(visible);
  const toastError = useToastError();
  const [pending, startTransition] = useTransition();

  function onClick() {
    const next = !optimistic;
    startTransition(async () => {
      setOptimistic(next);
      const result = await run(() => toggle(next));
      if (result.ok) toast.success(next ? `“${label}” is visible.` : `“${label}” is hidden.`);
      else toastError(result.error);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={pending}
      aria-pressed={!optimistic}
      aria-label={optimistic ? `Hide ${label}` : `Show ${label}`}
      title={optimistic ? "Visible on your portfolio. Click to hide." : "Hidden from your portfolio. Click to show."}
      className={cn(!optimistic && "text-[var(--warning)]")}
    >
      {optimistic ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
      <span className="hidden sm:inline">{optimistic ? "Visible" : "Hidden"}</span>
    </Button>
  );
}

/* ─── Delete ─── */

interface DeleteButtonProps {
  /** What's being deleted, e.g. "project" */
  noun: string;
  /** Its name, shown in the dialog and toast */
  label: string;
  remove: () => Promise<ActionResult>;
  /** Navigate here after deleting (edit pages); lists just re-render */
  redirectTo?: string;
  /** "icon" for list rows, "full" for edit pages */
  variant?: "icon" | "full";
  description?: string;
}

export function DeleteButton({ noun, label, remove, redirectTo, variant = "icon", description }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toastError = useToastError();

  function onConfirm() {
    startTransition(async () => {
      const result = await run(remove);
      if (!result.ok) {
        toastError(result.error);
        setOpen(false);
        return;
      }
      toast.success(result.message ?? `“${label}” deleted.`);
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
    });
  }

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          aria-label={`Delete ${label}`}
          className="hover:text-[var(--error)]"
        >
          <Trash2 size={14} aria-hidden />
        </Button>
      ) : (
        <Button type="button" variant="ghost" onClick={() => setOpen(true)} className="text-[var(--error)] hover:bg-[var(--error-light)] hover:text-[var(--error)]">
          <Trash2 size={16} aria-hidden />
          Delete {noun}
        </Button>
      )}
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        pending={pending}
        title={`Delete this ${noun}?`}
        description={
          <>
            <strong className="font-medium text-[var(--foreground)]">{label}</strong> will be removed from your
            portfolio. {description ?? "This can't be undone."}
          </>
        }
      />
    </>
  );
}

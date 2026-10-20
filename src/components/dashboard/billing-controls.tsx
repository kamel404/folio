"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { run, useToastError } from "@/components/dashboard/list-actions";
import { cancelPlan, openBillingPortal, resumePlan } from "@/app/(dashboard)/dashboard/billing/actions";

/** Card, invoices and billing address live in Lemon Squeezy's portal (a fresh signed link per click). */
export function PortalButton({ label = "Card & invoices", variant = "secondary" }: { label?: string; variant?: "secondary" | "accent" }) {
  const [pending, startTransition] = useTransition();
  const toastError = useToastError();

  function onClick() {
    startTransition(async () => {
      const result = await run(openBillingPortal);
      if (result.ok && "url" in result && result.url) window.location.assign(result.url);
      else if (!result.ok) toastError(result.error);
    });
  }

  return (
    <Button variant={variant} onClick={onClick} isLoading={pending} loadingText="Opening…">
      <CreditCard size={16} aria-hidden />
      {label}
    </Button>
  );
}

export function CancelPlanButton({ until }: { until: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toastError = useToastError();

  function onConfirm() {
    startTransition(async () => {
      const result = await run(cancelPlan);
      setOpen(false);
      if (result.ok) toast.success(result.message ?? "Plan cancelled.");
      else toastError(result.error);
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="text-[var(--error)] hover:bg-[var(--error-light)] hover:text-[var(--error)]"
      >
        Cancel plan
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        pending={pending}
        title="Cancel your plan?"
        description={
          <>
            You won&apos;t be charged again. Your portfolio stays live{until ? ` until ${until}` : " until the end of the period you paid for"},
            then goes offline. Everything you built is kept, and you can resume any time before then.
          </>
        }
        confirmLabel="Cancel plan"
        pendingLabel="Cancelling…"
      />
    </>
  );
}

export function ResumePlanButton() {
  const [pending, startTransition] = useTransition();
  const toastError = useToastError();

  function onClick() {
    startTransition(async () => {
      const result = await run(resumePlan);
      if (result.ok) toast.success(result.message ?? "Your plan is active again.");
      else toastError(result.error);
    });
  }

  return (
    <Button variant="accent" onClick={onClick} isLoading={pending} loadingText="Resuming…">
      <RotateCcw size={16} aria-hidden />
      Resume plan
    </Button>
  );
}

const POLL_MS = 3_000;
const GIVE_UP_MS = 60_000;

/**
 * After checkout, Lemon Squeezy sends us a webhook; until it arrives the plan
 * isn't active yet. Re-render the page every few seconds until it is (the
 * parent stops rendering this), and explain if it takes unusually long.
 *
 * Each refresh starts only after the previous one finished: the router runs
 * refreshes and actions one at a time, so a fixed interval shorter than a
 * slow render would pile them up and delay everything the user does next.
 */
export function CheckoutPending() {
  const router = useRouter();
  const [slow, setSlow] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [started] = useState(() => Date.now());
  const [round, setRound] = useState(0); // re-arms the timer even if a refresh finishes within one render

  useEffect(() => {
    if (refreshing || slow) return;
    const timer = window.setTimeout(() => {
      if (Date.now() - started > GIVE_UP_MS) return setSlow(true);
      setRound((r) => r + 1);
      startRefresh(() => router.refresh());
    }, POLL_MS);
    return () => window.clearTimeout(timer);
  }, [round, refreshing, slow, started, router]);

  if (slow) {
    return (
      <div role="status" className="rounded-md border border-[var(--warning)]/30 bg-[var(--warning-light)] px-4 py-3 text-sm leading-relaxed text-[var(--warning)]">
        Your payment is taking longer than usual to confirm. If you were charged, your plan will switch on by itself
        within a few minutes; refresh this page to check. Still nothing after 15 minutes? Contact support and we&apos;ll
        sort it out.
      </div>
    );
  }

  return (
    <div role="status" className="flex items-center gap-3 rounded-md border border-[var(--border)] px-4 py-3 text-sm">
      <Loader2 size={16} className="shrink-0 animate-spin text-[var(--accent)]" aria-hidden />
      Thanks! Confirming your payment with Lemon Squeezy. This usually takes a few seconds.
    </div>
  );
}

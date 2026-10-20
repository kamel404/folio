"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/modal";
import { run, useToastError } from "@/components/dashboard/list-actions";
import { changePlan, startCheckout } from "@/app/(dashboard)/dashboard/billing/actions";
import { plans, type Plan, type PlanId } from "@/lib/payments/plans";
import { cn } from "@/lib/utils";
import type { BillingInterval } from "@/types";

/**
 * Starter / Pro, monthly or yearly.
 *   • "checkout": no plan yet → opens Lemon Squeezy's hosted checkout
 *   • "switch":   has a plan → changes it in place (after a confirm)
 *   • "locked":   cancelled plan → resume first
 * Used on /dashboard/billing and in the Publish dialog.
 */

export interface PlanPickerProps {
  mode: "checkout" | "switch" | "locked";
  current?: { plan: PlanId; interval: BillingInterval | null };
  /** False until LEMON_SQUEEZY_* is configured: buttons disabled with a note */
  paymentsReady: boolean;
  /** Fewer features per card (dialog) */
  compact?: boolean;
}

const savingPercent = (plan: Plan) => Math.round((1 - plan.annual / (plan.monthly * 12)) * 100);

function PlanPicker({ mode, current, paymentsReady, compact = false }: PlanPickerProps) {
  const [interval, setBillingInterval] = useState<BillingInterval>(current?.interval ?? "month");
  const [confirming, setConfirming] = useState<PlanId | null>(null);
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [pending, startTransition] = useTransition();
  const toastError = useToastError();
  const maxSaving = Math.max(...plans.map(savingPercent));

  function checkout(plan: PlanId) {
    setBusy(plan);
    startTransition(async () => {
      const result = await run(() => startCheckout(plan, interval));
      if (result.ok && "url" in result && result.url) {
        window.location.assign(result.url); // stays "busy" while the checkout page loads
        return;
      }
      setBusy(null);
      if (!result.ok) toastError(result.error);
    });
  }

  function switchTo(plan: PlanId) {
    setBusy(plan);
    startTransition(async () => {
      const result = await run(() => changePlan(plan, interval));
      setBusy(null);
      setConfirming(null);
      if (result.ok) toast.success(result.message ?? "Plan changed.");
      else toastError(result.error);
    });
  }

  const target = plans.find((p) => p.id === confirming);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Billing period" className="inline-flex rounded-md border border-[var(--border)] p-0.5">
          {(["month", "year"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={interval === value}
              onClick={() => setBillingInterval(value)}
              className={cn(
                "cursor-pointer rounded-sm px-3 py-1.5 text-sm transition-colors duration-150",
                interval === value
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              )}
            >
              {value === "month" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
        <span className="label-mono text-[var(--accent)]">Yearly saves up to {maxSaving}%</span>
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = current?.plan === plan.id && current.interval === interval;
          const label =
            mode === "checkout"
              ? `Choose ${plan.name}`
              : isCurrent
                ? "Your current plan"
                : current?.plan === plan.id
                  ? `Switch to ${interval === "year" ? "yearly" : "monthly"}`
                  : `Switch to ${plan.name}`;

          return (
            <li
              key={plan.id}
              className={cn(
                "flex flex-col rounded-md border p-5",
                isCurrent ? "border-[var(--foreground)]" : "border-[var(--border)]"
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl">{plan.name}</h3>
                {isCurrent && <Badge variant="success">Current</Badge>}
              </div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{plan.blurb}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl leading-none">
                  ${interval === "month" ? plan.monthly.toFixed(2) : plan.annual}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">/ {interval}</span>
              </p>
              <p className="mt-1 label-mono text-[var(--text-tertiary)]">
                {interval === "month"
                  ? `or $${plan.annual} a year`
                  : `≈ $${(plan.annual / 12).toFixed(2)}/mo · save ${savingPercent(plan)}%`}
              </p>
              <ul className="mt-4 mb-5 flex flex-col gap-1.5 text-sm">
                {(compact ? plan.features.slice(0, 4) : plan.features).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-auto"
                variant={mode === "checkout" && plan.id === "starter" ? "accent" : "primary"}
                disabled={!paymentsReady || mode === "locked" || isCurrent || (pending && busy !== plan.id)}
                isLoading={busy === plan.id}
                loadingText={mode === "checkout" ? "Opening checkout…" : "Switching…"}
                onClick={() => (mode === "checkout" ? checkout(plan.id) : setConfirming(plan.id))}
              >
                {label}
              </Button>
            </li>
          );
        })}
      </ul>

      {!paymentsReady && (
        <p className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Badge variant="outline">Soon</Badge>
          Checkout opens shortly. Keep building in the meantime; nothing is lost.
        </p>
      )}
      {paymentsReady && mode === "locked" && (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Resume your plan to switch to another one.</p>
      )}
      {paymentsReady && mode === "checkout" && (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Secure checkout by Lemon Squeezy. Cancel any time; your site stays up until the end of the period you paid for.
        </p>
      )}

      <ConfirmDialog
        open={target !== undefined}
        onClose={() => setConfirming(null)}
        onConfirm={() => target && switchTo(target.id)}
        pending={pending}
        tone="primary"
        title={target ? `Switch to ${target.name} (${interval === "year" ? "yearly" : "monthly"})?` : ""}
        description="The change applies right away. The price difference is prorated: you're credited for the unused part of your current plan, and the rest shows up on your next invoice."
        confirmLabel="Switch plan"
        pendingLabel="Switching…"
      />
    </div>
  );
}

export { PlanPicker };

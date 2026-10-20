"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle } from "lucide-react";

/**
 * Dashboard-wide notice when the plan needs attention. Hidden on the Billing
 * page, which explains the same thing in more detail.
 *   • past_due: payment failed, site still live while Lemon Squeezy retries
 *   • ended:    plan expired, site offline, content kept
 */
function BillingBanner({ kind }: { kind: "past_due" | "ended" }) {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard/billing")) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--warning)]/30 bg-[var(--warning-light)] px-6 py-3 text-sm text-[var(--warning)]"
    >
      <AlertCircle size={16} className="shrink-0" aria-hidden />
      <p className="min-w-0 flex-1">
        {kind === "past_due"
          ? "Your last payment didn't go through. Update your card to keep your portfolio online."
          : "Your plan has ended, so your portfolio is offline. Everything you built is still here."}
      </p>
      <Link href="/dashboard/billing" className="font-medium underline underline-offset-2">
        {kind === "past_due" ? "Update card" : "Choose a plan to go live again"}
      </Link>
    </div>
  );
}

export { BillingBanner };

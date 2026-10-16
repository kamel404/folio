"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Globe } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { plans, canPublish, isLive } from "@/lib/payments/plans";
import { tenantUrl } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/types";

/**
 * The publishing gate in the UI. Paid + active → link to the live site.
 * Unpaid → "Publish" opens the plan picker (never an error). Paid but
 * suspended → explain why it's offline.
 */
function PublishButton({ tenant, className }: { tenant: Tenant; className?: string }) {
  const [open, setOpen] = useState(false);
  const siteUrl = tenantUrl(tenant.slug);

  if (isLive(tenant)) {
    return (
      <a href={siteUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "secondary" }), className)}>
        <Globe size={16} aria-hidden />
        View live site
        <ArrowUpRight size={14} aria-hidden />
      </a>
    );
  }

  if (canPublish(tenant)) {
    return (
      <p className={cn("text-sm text-[var(--warning)]", className)}>
        Your portfolio is offline. Contact support to bring it back.
      </p>
    );
  }

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)} className={className}>
        <Globe size={16} aria-hidden />
        Publish
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Choose a plan to go live."
        description="Everything you've built stays as it is. A plan puts it online at your address."
        className="max-w-2xl"
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <li key={plan.id} className="flex flex-col rounded-md border border-[var(--border)] p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl">{plan.name}</h3>
                <p className="font-mono text-sm">
                  ${plan.monthly}
                  <span className="text-[var(--text-tertiary)]">/mo</span>
                </p>
              </div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{plan.blurb}</p>
              <ul className="mt-4 flex flex-col gap-1.5 text-sm">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-5" disabled>
                Choose {plan.name}
              </Button>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Badge variant="outline">Soon</Badge>
          Checkout opens shortly. Keep building in the meantime; nothing is lost.
        </p>
      </Modal>
    </>
  );
}

export { PublishButton };

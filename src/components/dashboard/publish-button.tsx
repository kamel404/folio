"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PlanPicker } from "@/components/dashboard/plan-picker";
import { canPublish, isLive } from "@/lib/payments/plans";
import { tenantUrl } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { Tenant } from "@/types";

/**
 * The publishing gate in the UI. Paid + active → link to the live site.
 * Unpaid → "Publish" opens the plan picker, which goes straight to checkout
 * (never an error). Paid but suspended → explain why it's offline.
 */
function PublishButton({ tenant, paymentsReady, className }: { tenant: Tenant; paymentsReady: boolean; className?: string }) {
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
        <PlanPicker mode="checkout" paymentsReady={paymentsReady} compact />
        <p className="mt-3 text-sm">
          <Link href="/dashboard/billing" className="link-underline text-[var(--text-secondary)] hover:text-[var(--foreground)]">
            Compare everything on the Billing page
          </Link>
        </p>
      </Modal>
    </>
  );
}

export { PublishButton };

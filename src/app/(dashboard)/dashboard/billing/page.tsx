import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/layout/section";
import { PlanPicker } from "@/components/dashboard/plan-picker";
import { CancelPlanButton, CheckoutPending, PortalButton, ResumePlanButton } from "@/components/dashboard/billing-controls";
import { requirePageTenant } from "@/lib/data/dashboard";
import { getSubscriptionRow, grantsAccess } from "@/lib/payments/subscriptions";
import { isPaymentsConfigured } from "@/lib/payments/lemon-squeezy";
import { canPublish, plans } from "@/lib/payments/plans";
import { ROOT_DOMAIN } from "@/lib/config";
import { formatDate } from "@/lib/utils/dates";
import type { Subscription } from "@/types";

export const metadata = { title: "Billing" };

const STATUS: Record<Subscription["status"], { label: string; variant: "success" | "warning" | "error" | "default" }> = {
  active: { label: "Active", variant: "success" },
  on_trial: { label: "Trial", variant: "success" },
  past_due: { label: "Payment failed", variant: "error" },
  cancelled: { label: "Cancelled", variant: "warning" },
  paused: { label: "Paused", variant: "default" },
  unpaid: { label: "Unpaid", variant: "error" },
  expired: { label: "Ended", variant: "default" },
};

export default async function BillingPage({ searchParams }: PageProps<"/dashboard/billing">) {
  const { tenant } = await requirePageTenant();
  const [subscription, params] = await Promise.all([getSubscriptionRow(tenant.id), searchParams]);
  const paymentsReady = isPaymentsConfigured();
  const justPaid = params.checkout === "success";
  const address = `${tenant.slug}.${ROOT_DOMAIN}`;

  // "Paid" comes from tenant.plan, the same (per-request cached) read the sidebar uses, so the page
  // and sidebar never disagree mid-webhook. apply_subscription writes both in one transaction, and
  // the subscription is read after the tenant, so a paid tenant always comes with its row.
  const active = canPublish(tenant) && subscription && grantsAccess(subscription.status) ? subscription : null;
  const ended = subscription && !grantsAccess(subscription.status) ? subscription : null;
  const plan = active && plans.find((p) => p.id === active.plan);

  return (
    <>
      <PageHeader
        stacked
        index="07"
        label="Billing"
        title={active ? "Your plan." : "Choose a plan."}
        lede={
          active
            ? "Change plan, update your card, see invoices or cancel. Your content is never deleted."
            : "Everything you've built stays as it is. A plan puts it online at your address."
        }
      />

      <Container className="flex flex-col gap-12 pb-20">
        {/* Just back from checkout */}
        {justPaid && !active && <CheckoutPending />}
        {justPaid && active && (
          <FormMessage tone="success">
            Payment received. Your portfolio is live at <strong className="font-medium">{address}</strong>.
          </FormMessage>
        )}

        {active && plan ? (
          <>
            <section aria-labelledby="current-heading" className="border-t border-[var(--foreground)]">
              <h2 id="current-heading" className="sr-only">Current plan</h2>
              {active.status === "past_due" && (
                <FormMessage tone="error" className="mt-6">
                  Your last payment didn&apos;t go through. Lemon Squeezy will retry it over the next few days; update
                  your card to keep your portfolio online.
                </FormMessage>
              )}
              <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                <Row label="Plan">
                  {plan.name} · {active.billing_interval === "year" ? `$${plan.annual}/year` : `$${plan.monthly}/month`}
                </Row>
                <Row label="Status">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge variant={STATUS[active.status].variant} dot>
                      {STATUS[active.status].label}
                    </Badge>
                    {active.test_mode && <Badge variant="outline">Test mode</Badge>}
                  </span>
                </Row>
                <Row label={active.status === "cancelled" ? "Live until" : "Next payment"}>
                  {formatDate(active.status === "cancelled" ? active.ends_at : active.renews_at) || "—"}
                </Row>
                <Row label="Card">
                  {active.card_last_four ? `${capitalize(active.card_brand)} •••• ${active.card_last_four}` : "—"}
                </Row>
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <PortalButton
                  label={active.status === "past_due" ? "Update card" : "Card & invoices"}
                  variant={active.status === "past_due" ? "accent" : "secondary"}
                />
                {active.status === "cancelled" ? (
                  <ResumePlanButton />
                ) : (
                  <CancelPlanButton until={formatDate(active.renews_at)} />
                )}
              </div>
              {active.status === "cancelled" && (
                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                  You won&apos;t be charged again. After {formatDate(active.ends_at) || "the end of the period"} your
                  portfolio goes offline; your content stays here.
                </p>
              )}
            </section>

            <section aria-labelledby="change-heading">
              <h2 id="change-heading" className="label-mono font-sans text-[var(--text-tertiary)]">
                Change plan
              </h2>
              <div className="mt-4">
                <PlanPicker
                  mode={active.status === "cancelled" ? "locked" : "switch"}
                  current={{ plan: active.plan, interval: active.billing_interval }}
                  paymentsReady={paymentsReady}
                />
              </div>
            </section>
          </>
        ) : (
          <section aria-labelledby="choose-heading" className="border-t border-[var(--foreground)] pt-8">
            <h2 id="choose-heading" className="sr-only">Plans</h2>
            {ended && !justPaid && (
              <FormMessage tone="error" className="mb-6">
                Your {plans.find((p) => p.id === ended.plan)?.name} plan has ended
                {ended.ends_at ? ` (${formatDate(ended.ends_at)})` : ""}, so your portfolio is offline.
                Everything you built is still here: choose a plan to go live again.
              </FormMessage>
            )}
            <PlanPicker mode="checkout" paymentsReady={paymentsReady} />
            {subscription && (
              <div className="mt-8">
                <PortalButton label="Past invoices" />
              </div>
            )}
          </section>
        )}
      </Container>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] py-5">
      <dt className="label-mono text-[var(--text-tertiary)]">{label}</dt>
      <dd className="text-[0.9375rem]">{children}</dd>
    </div>
  );
}

const capitalize = (value: string | null) => (value ? value[0].toUpperCase() + value.slice(1) : "Card");

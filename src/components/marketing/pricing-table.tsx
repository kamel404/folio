import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { plans } from "@/lib/payments/plans";

/** What anyone can do before choosing a plan — no free tier, but no blind purchase either. */
const beforeYouPay = [
  "Create an account",
  "Import your CV or answer the interview",
  "Edit every section",
  "Preview your portfolio privately",
];

/** Plans laid out on the 12-col grid: "Before you pay" + Starter + Pro. Used on /pricing. */
function PricingGrid() {
  return (
    <div className="grid-12 gap-y-0 border-t border-[var(--foreground)]">
    {/* Before you pay */}
    <aside className="col-span-12 lg:col-span-4 flex flex-col pt-8 pb-12 lg:pb-0 lg:pr-8">
      <h3 className="font-display text-3xl font-normal">Before you pay</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        See exactly what you&apos;re getting. No card needed for any of this.
      </p>
      <ol className="mt-8 flex flex-col border-t border-[var(--border)]">
        {beforeYouPay.map((step, i) => (
          <li
            key={step}
            className="flex items-baseline gap-4 border-b border-[var(--border)] py-3 text-[0.9375rem]"
          >
            <span className="font-mono text-xs text-[var(--text-tertiary)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <p className="mt-6 label-mono text-[var(--accent)]">Publishing needs a plan →</p>
    </aside>

    {plans.map((plan) => {
      const featured = plan.id === "starter";
      return (
        <article
          key={plan.id}
          className="relative col-span-12 md:col-span-6 lg:col-span-4 flex flex-col border-t border-[var(--border)] pt-8 pb-12 md:pr-8 lg:border-t-0 lg:border-l lg:px-8 lg:pb-0 md:odd:border-l md:odd:pl-8 lg:odd:pl-8"
        >
          <h3 className="font-display text-3xl font-normal">{plan.name}</h3>
          <p className="mt-2 min-h-10 text-sm text-[var(--text-secondary)]">{plan.blurb}</p>

          <p className="mt-6 flex items-baseline gap-1">
            <span className="font-display text-6xl leading-none tracking-[-0.02em]">
              ${plan.monthly.toFixed(2)}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">/ month</span>
          </p>
          <p className="mt-2 label-mono text-[var(--text-tertiary)]">
            or ${plan.annual} billed yearly
          </p>

          <ul className="mt-8 mb-10 flex flex-col gap-3 border-t border-[var(--border)] pt-6">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[0.9375rem]">
                <Check size={16} className="mt-1 shrink-0 text-[var(--accent)]" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={`/signup?plan=${plan.id}`}
            className={cn(
              buttonVariants({ variant: featured ? "primary" : "secondary", size: "lg" }),
              "mt-auto w-full"
            )}
          >
            Choose {plan.name}
          </Link>
        </article>
      );
    })}
</div>
  );
}

export { PricingGrid };

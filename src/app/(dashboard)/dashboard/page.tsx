import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/section";
import { getCurrentTenant } from "@/lib/data/tenant";
import { createClient } from "@/lib/supabase/server";
import { ROOT_DOMAIN } from "@/lib/config";
import { cn } from "@/lib/utils";
import { isLive } from "@/lib/payments/plans";
import { PublishButton } from "@/components/dashboard/publish-button";
import { isPaymentsConfigured } from "@/lib/payments/lemon-squeezy";

export const metadata = { title: "Overview" };

async function countRows(table: "projects" | "experiences" | "skills", tenantId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId); // explicit: public-read policies would otherwise include other tenants
  return count ?? 0;
}

export default async function DashboardOverview() {
  const current = await getCurrentTenant();
  if (!current) redirect("/login");

  const { tenant, name } = current;
  const live = isLive(tenant);
  const [projects, experiences, skills] = await Promise.all([
    countRows("projects", tenant.id),
    countRows("experiences", tenant.id),
    countRows("skills", tenant.id),
  ]);

  const stats = [
    { label: "Projects", value: projects },
    { label: "Experience", value: experiences },
    { label: "Skills", value: skills },
    { label: "Views", value: "—" },
  ];

  const nextSteps = [
    {
      title: "Import your CV",
      body: "Fill in your profile, roles, projects and skills in one go.",
      href: "/dashboard/import",
      cta: "Import",
      done: projects > 0 || experiences > 0,
    },
    {
      title: "Fill in your profile",
      body: "Name, headline, photo, bio and links.",
      href: "/dashboard/profile",
      cta: "Edit profile",
    },
    {
      title: "Add your work",
      body: "Projects, experience and skills.",
      href: projects === 0 ? "/dashboard/projects/new" : "/dashboard/projects",
      cta: projects === 0 ? "Add a project" : "Manage projects",
      done: projects > 0 && experiences > 0 && skills > 0,
    },
    {
      title: "Choose a plan to go live",
      body: "Starter or Pro. You only pay to publish.",
      href: "/dashboard/billing",
      cta: "Choose a plan",
      done: live,
    },
  ];

  return (
    <>
      <PageHeader
        stacked
        index="00"
        label="Overview"
        title={
          <>
            Hello, <em className="text-[var(--accent)]">{name.split(" ")[0]}.</em>
          </>
        }
        lede={
          live
            ? "Your portfolio is live. Changes you make show up within a minute."
            : "Your portfolio is private until you choose a plan. Build it first, then publish when you're ready."
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/preview" className={buttonVariants({ variant: "secondary" })}>
              <Eye size={16} aria-hidden />
              Preview
            </Link>
            <PublishButton tenant={tenant} paymentsReady={isPaymentsConfigured()} />
          </div>
        }
      />

      <Container className="pb-20">
        {/* Address */}
        <section aria-labelledby="address-heading" className="border-t border-[var(--foreground)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] py-6">
            <div>
              <h2 id="address-heading" className="label-mono font-sans text-[var(--text-tertiary)]">
                Your address
              </h2>
              <p className="mt-2 font-mono text-lg">
                {tenant.slug}.{ROOT_DOMAIN}
              </p>
            </div>
            <Badge variant={live ? "success" : "warning"} dot>
              {live ? "Live" : "Offline · no plan"}
            </Badge>
          </div>
        </section>

        {/* Stats */}
        <dl className="grid grid-cols-2 border-b border-[var(--border)] lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col py-7",
                i % 2 === 1 && "border-l border-[var(--border)] pl-6",
                i === 2 && "lg:border-l lg:pl-6",
                i >= 2 && "border-t border-[var(--border)] lg:border-t-0"
              )}
            >
              <dt className="order-2 mt-2 label-mono text-[var(--text-tertiary)]">{stat.label}</dt>
              <dd className="order-1 font-display text-5xl leading-none">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {/* Next steps */}
        <section aria-labelledby="next-heading" className="mt-14">
          <h2 id="next-heading" className="label-mono font-sans text-[var(--text-tertiary)]">
            Next steps
          </h2>
          <ol className="mt-4 border-t border-[var(--foreground)]">
            {nextSteps.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[var(--border)] py-5"
              >
                <span className="font-mono text-xs text-[var(--text-tertiary)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className={cn("text-base", step.done && "line-through decoration-[var(--accent)]")}>
                    {step.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{step.body}</p>
                </div>
                {step.href && !step.done && (
                  <Link href={step.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                    {step.cta}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      </Container>
    </>
  );
}

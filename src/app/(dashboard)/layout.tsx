import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AiAllowanceProvider } from "@/components/dashboard/ai-allowance";
import { BillingBanner } from "@/components/dashboard/billing-banner";
import { getAiAllowance } from "@/lib/ai/usage";
import { getSubscriptionRow, grantsAccess } from "@/lib/payments/subscriptions";
import { signOut } from "@/app/(auth)/actions";
import { getCurrentTenant } from "@/lib/data/tenant";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = { title: { default: "Dashboard", template: "%s | Folio" }, robots: { index: false } };

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  await connection(); // per-user page: never prerender, even when env keys are missing at build time
  if (!isSupabaseConfigured()) redirect("/login");

  const current = await getCurrentTenant();

  if (!current) {
    // Signed in but no tenant row — or not signed in at all
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    return (
      <Container size="sm" className="py-24">
        <h1 className="text-4xl">We couldn&apos;t find your portfolio.</h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          Your account exists, but it isn&apos;t linked to a portfolio. This usually means the database
          setup script hasn&apos;t been run yet. Contact support if it keeps happening.
        </p>
        <form action={signOut} className="mt-8">
          <button type="submit" className="link-underline cursor-pointer">Sign out</button>
        </form>
      </Container>
    );
  }

  // First visit (new signups and accounts from before onboarding existed): set up once, or skip
  if (current.tenant.onboarding !== "completed") redirect("/onboarding");

  // For the "Rewrite with AI" buttons. Not worth failing the whole dashboard over: they hide on error.
  // Same for the billing banner: hidden if the subscription can't be read.
  const [allowance, subscription] = await Promise.all([
    getAiAllowance(current.tenant).catch((error) => {
      console.error("[dashboard] AI allowance", error);
      return null;
    }),
    getSubscriptionRow(current.tenant.id).catch((error) => {
      console.error("[dashboard] subscription", error);
      return null;
    }),
  ]);
  const banner =
    subscription?.status === "past_due"
      ? "past_due"
      : subscription && !grantsAccess(subscription.status) && current.tenant.plan === "none"
        ? "ended"
        : null;

  return (
    <AiAllowanceProvider initial={allowance}>
      <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
        <DashboardSidebar current={current} />
        <main className="min-w-0 flex-1">
          {banner && <BillingBanner kind={banner} />}
          {children}
        </main>
        <Toaster />
      </div>
    </AiAllowanceProvider>
  );
}

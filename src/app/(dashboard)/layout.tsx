import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
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

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <DashboardSidebar current={current} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";
import { Toaster } from "@/components/ui/toaster";
import { skipOnboarding } from "@/app/(onboarding)/onboarding/actions";
import { getCurrentTenant } from "@/lib/data/tenant";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = { title: { default: "Set up your portfolio", template: "%s | Folio" }, robots: { index: false } };

/** First-run setup: a quiet frame with one way out ("Skip setup"). */
export default async function OnboardingLayout({ children }: LayoutProps<"/">) {
  await connection(); // per-user page: never prerender
  if (!isSupabaseConfigured()) redirect("/login");
  const current = await getCurrentTenant();
  if (!current) redirect("/login?next=/onboarding");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="border-b border-[var(--border)]">
        <Container className="flex h-16 items-center justify-between">
          <Wordmark />
          <form action={skipOnboarding}>
            <button
              type="submit"
              className="cursor-pointer text-sm text-[var(--text-secondary)] link-underline hover:text-[var(--foreground)]"
            >
              Skip setup
            </button>
          </form>
        </Container>
      </header>
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  );
}

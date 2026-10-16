import Link from "next/link";
import { Eye } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Wordmark } from "@/components/ui/wordmark";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ROOT_DOMAIN } from "@/lib/config";
import { isLive } from "@/lib/payments/plans";
import type { CurrentTenant } from "@/types";

function DashboardSidebar({ current }: { current: CurrentTenant }) {
  const { tenant, user, name } = current;
  const live = isLive(tenant);

  return (
    <aside className="border-b border-[var(--border)] bg-[var(--surface)] lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-6 px-4 py-4 lg:py-6">
        <div className="flex items-center justify-between px-3">
          <Wordmark />
          <form action={signOut} className="lg:hidden">
            <button type="submit" className="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)]">
              Sign out
            </button>
          </form>
        </div>

        {/* Address + status */}
        <div className="hidden border-y border-[var(--border)] px-3 py-4 lg:block">
          <p className="label-mono text-[var(--text-tertiary)]">Your address</p>
          <p className="mt-2 break-all font-mono text-xs">
            {tenant.slug}.{ROOT_DOMAIN}
          </p>
          <p className="mt-2 flex items-center gap-2 label-mono">
            <span
              aria-hidden
              className={live ? "h-1.5 w-1.5 rounded-full bg-[var(--success)]" : "h-1.5 w-1.5 rounded-full bg-[var(--warning)]"}
            />
            <span className={live ? "text-[var(--success)]" : "text-[var(--warning)]"}>
              {live ? "Live" : "Offline · no plan"}
            </span>
          </p>
          <Link
            href="/preview"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] link-underline hover:text-[var(--foreground)]"
          >
            <Eye size={14} aria-hidden />
            Preview your site
          </Link>
        </div>

        <DashboardNav />

        <div className="mt-auto hidden border-t border-[var(--border)] px-3 pt-4 lg:block">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-[var(--text-tertiary)]">{user.email}</p>
          <form action={signOut} className="mt-3">
            <button
              type="submit"
              className="cursor-pointer text-sm text-[var(--text-secondary)] link-underline hover:text-[var(--foreground)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export { DashboardSidebar };

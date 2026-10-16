import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { portfolioSections } from "@/components/portfolio/portfolio-ui";
import { tenantUrl } from "@/lib/config";
import { isLive } from "@/lib/payments/plans";
import type { PortfolioContent, Tenant } from "@/types";

/** Where to fill in each section that is hidden because it's empty. */
const EMPTY_HINTS = [
  { id: "about", label: "About", href: "/dashboard/profile", how: "add a long bio" },
  { id: "projects", label: "Projects", href: "/dashboard/projects", how: "add or unhide a project" },
  { id: "experience", label: "Experience", href: "/dashboard/experience", how: "add a role" },
  { id: "skills", label: "Skills", href: "/dashboard/skills", how: "add skills" },
  { id: "contact", label: "Contact", href: "/dashboard/profile", how: "add an email or a link" },
] as const;

/**
 * Platform strip above the owner's preview. Uses the ink tokens, which tenant
 * palettes don't override, so it looks the same on every theme.
 */
function PreviewBar({ tenant, content }: { tenant: Tenant; content: PortfolioContent }) {
  const live = isLive(tenant);
  const present = new Set(portfolioSections(content).map((s) => s.id));
  const missing = EMPTY_HINTS.filter((h) => !present.has(h.id));

  return (
    <div role="region" aria-label="Preview" className="bg-[var(--ink)] font-sans text-[var(--ink-fg)]">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 text-sm">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="label-mono text-[var(--ink-muted)]">Preview</span>
          {live
            ? "Your latest changes. The live site catches up within a minute."
            : "Only you can see this. Visitors see an offline page until you publish."}
        </p>
        <div className="flex flex-wrap items-center gap-5">
          {live && (
            <a href={tenantUrl(tenant.slug)} target="_blank" rel="noreferrer" className="flex items-center gap-1 link-underline">
              Open live site
              <ArrowUpRight size={14} aria-hidden />
            </a>
          )}
          <Link href="/dashboard" className="flex items-center gap-1 link-underline">
            <ArrowLeft size={14} aria-hidden />
            Back to dashboard
          </Link>
        </div>
      </Container>

      {missing.length > 0 && (
        <Container className="border-t border-[var(--ink-border)] py-2.5 text-xs text-[var(--ink-muted)]">
          <p>
            Hidden until they have content:{" "}
            {missing.map((h, i) => (
              <span key={h.id}>
                {i > 0 && " · "}
                <Link href={h.href} className="text-[var(--ink-fg)] link-underline">
                  {h.label}
                </Link>{" "}
                ({h.how})
              </span>
            ))}
          </p>
        </Container>
      )}
    </div>
  );
}

export { PreviewBar };

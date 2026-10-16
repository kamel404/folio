import { ArrowUpRight, FileText, Mail, Phone } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { ExternalLink, PortfolioSection, displayUrl, portfolioButton } from "@/components/portfolio/portfolio-ui";
import type { Profile } from "@/types";

interface ContactItem {
  label: string;
  value: string;
  href: string;
  action: string;
  icon: React.ReactNode;
  external?: boolean;
}

/** Rendered only when the profile has at least one way to get in touch (see hasContact). */
function PortfolioContact({ profile }: { profile: Profile }) {
  const items: ContactItem[] = [];
  if (profile.email) {
    items.push({ label: "Email", value: profile.email, href: `mailto:${profile.email}`, action: "Send an email", icon: <Mail size={20} aria-hidden /> });
  }
  if (profile.phone) {
    items.push({ label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/[^\d+]/g, "")}`, action: "Call", icon: <Phone size={20} aria-hidden /> });
  }
  if (profile.linkedin_url) {
    items.push({ label: "LinkedIn", value: displayUrl(profile.linkedin_url), href: profile.linkedin_url, action: "Connect", icon: <LinkedinIcon size={20} />, external: true });
  }
  if (profile.github_url) {
    items.push({ label: "GitHub", value: displayUrl(profile.github_url), href: profile.github_url, action: "View profile", icon: <GithubIcon size={20} />, external: true });
  }

  return (
    <PortfolioSection id="contact" title="Get in touch">
      {items.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const Anchor = item.external ? ExternalLink : "a";
            return (
              <li key={item.label} className="flex">
                <Anchor
                  href={item.href}
                  className="group flex w-full flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-[border-color,box-shadow] duration-200 hover:border-[var(--accent)] hover:shadow-md"
                >
                  <div className="min-w-0">
                    <span className="inline-flex rounded-lg bg-[var(--warm-bg)] p-2.5 text-[var(--accent)]">{item.icon}</span>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{item.label}</p>
                    <p className="mt-1 truncate text-base font-medium">{item.value}</p>
                  </div>
                  <p className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm font-medium text-[var(--accent-dark)]">
                    {item.action}
                    <ArrowUpRight size={16} aria-hidden />
                  </p>
                </Anchor>
              </li>
            );
          })}
        </ul>
      )}

      {profile.cv_url && (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--warm-bg)] p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <FileText size={24} aria-hidden className="shrink-0 text-[var(--accent)]" />
            <div>
              <h3 className="text-sm">Curriculum vitae</h3>
              <p className="text-sm text-[var(--text-muted)]">The full version, with everything in one place.</p>
            </div>
          </div>
          <ExternalLink href={profile.cv_url} className={portfolioButton.primary}>
            View CV
          </ExternalLink>
        </div>
      )}
    </PortfolioSection>
  );
}

export { PortfolioContact };

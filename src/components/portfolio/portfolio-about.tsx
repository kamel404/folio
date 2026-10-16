import { Briefcase, Clock, MapPin } from "lucide-react";
import { Paragraphs, PortfolioSection } from "@/components/portfolio/portfolio-ui";
import { availabilityLabel } from "@/lib/options";
import type { Profile } from "@/types";

/** Rendered only when there is a long bio (see portfolioSections). */
function PortfolioAbout({ profile }: { profile: Profile }) {
  const availability = availabilityLabel(profile.availability_status);
  const facts = [
    { label: "Role", value: profile.title, icon: Briefcase },
    profile.location && { label: "Location", value: profile.location, icon: MapPin },
    availability && { label: "Availability", value: availability, icon: Clock },
  ].filter((f) => !!f);

  return (
    <PortfolioSection id="about" title="About">
      <div className="grid items-start gap-8 md:grid-cols-3">
        <Paragraphs
          text={profile.long_bio ?? ""}
          className="text-base leading-relaxed text-[var(--foreground)]/90 sm:text-lg md:col-span-2"
        />

        {/* Role alone would repeat the hero, so the card needs at least one more fact */}
        {facts.length > 1 && (
          <dl className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm">
            {facts.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon size={16} aria-hidden className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <div>
                  <dt className="text-xs text-[var(--text-muted)]">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </div>
    </PortfolioSection>
  );
}

export { PortfolioAbout };

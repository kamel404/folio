import { Section } from "@/components/layout/section";
import { PortfolioSpecimen } from "@/components/marketing/portfolio-specimen";
import { palettes } from "@/lib/themes/palettes";

function ThemeGallery() {
  return (
    <Section
      id="themes"
      index="03"
      label="Themes"
      tone="surface"
      title={
        <>
          Five palettes. <em className="text-[var(--text-secondary)]">All of them quiet.</em>
        </>
      }
      lede="Your work should be the loudest thing on the page. Every palette uses the same layout, so switching never breaks anything. Every plan gets all of them."
    >
      <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {palettes.map((palette, i) => (
          <li key={palette.id}>
            <PortfolioSpecimen palette={palette} size="sm" />
            <div className="mt-4 flex items-start justify-between gap-4 border-t border-[var(--border)] pt-4">
              <div>
                <p className="font-mono text-[10px] text-[var(--text-tertiary)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 font-display text-2xl font-normal leading-none">{palette.name}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{palette.note}</p>
              </div>
              <div className="flex shrink-0 pt-1">
                <div className="flex" aria-hidden>
                  {[palette.colors.background, palette.colors.foreground, palette.colors.accent].map((c) => (
                    <span
                      key={c}
                      className="-ml-1 h-4 w-4 rounded-full border border-[var(--border)] first:ml-0"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}

        {/* Custom */}
        <li className="flex flex-col">
          <div className="flex flex-1 min-h-48 items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center">
            <p className="font-display text-3xl italic leading-tight text-[var(--text-secondary)]">
              Your colours,
              <br />
              your call.
            </p>
          </div>
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="font-mono text-[10px] text-[var(--text-tertiary)]">06</p>
            <h3 className="mt-1 font-display text-2xl font-normal leading-none">Custom</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Set background, text and accent yourself</p>
          </div>
        </li>
      </ul>
    </Section>
  );
}

export { ThemeGallery };

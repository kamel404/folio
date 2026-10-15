import Link from "next/link";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/layout/section";
import { ClaimForm } from "@/components/marketing/claim-form";
import { PortfolioSpecimen } from "@/components/marketing/portfolio-specimen";
import { getPalette } from "@/lib/themes/palettes";
import { startingPrice } from "@/lib/payments/plans";

const proofNotes = [
  "Name, title and bio pulled from cv.pdf",
  "Projects written up from your interview answers",
  "Published at your own address",
];

const facts = [
  { value: "~5 min", label: "From signup to a live URL" },
  { value: "3 ways in", label: "Upload a CV, answer questions, or start blank" },
  { value: "5 palettes", label: "Tuned for reading, not decoration" },
  { value: `$${startingPrice}`, label: "A month, everything included" },
];

// Hairlines between cells: 2×2 on mobile, 4×1 on desktop
const factCell = [
  "pr-6",
  "pl-6 border-l",
  "pr-6 border-t lg:border-t-0 lg:border-l lg:pl-6",
  "pl-6 border-l border-t lg:border-t-0",
];

function MarketingHero() {
  return (
    <>
      <section className="pt-14 pb-20 lg:pt-20 lg:pb-28">
        <Container className="grid-12 gap-y-14">
          <Eyebrow
            index="00"
            label="Portfolio builder for developers & creatives"
            className="col-span-12"
          />

          {/* Copy */}
          <div className="col-span-12 lg:col-span-7 animate-fade-in-up">
            <h1 className="text-[clamp(3rem,7.5vw,6.25rem)] leading-[0.95]">
              Your portfolio,
              <br />
              <em className="text-[var(--accent)]">live</em> in five minutes.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]">
              Upload a CV or answer a few plain questions. Folio writes the
              first draft, sets it in a clean theme and publishes it at your own
              address. You change what you like. The rest is done.
            </p>
            <ClaimForm className="mt-10" />
            <p className="mt-3 text-sm text-[var(--text-tertiary)]">
              Build and preview before you pay. Plans from ${startingPrice}/month,{" "}
              <Link href="/pricing" className="link-underline text-[var(--foreground)]">
                see pricing
              </Link>
              .
            </p>
          </div>

          {/* Specimen with proofreader's marks */}
          <figure className="col-span-12 lg:col-span-5 animate-fade-in-up [animation-delay:80ms]">
            <PortfolioSpecimen palette={getPalette("warm-earth")} marks />
            <figcaption className="mt-5">
              <ol className="flex flex-col gap-2">
                {proofNotes.map((note, i) => (
                  <li key={note} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <span className="mt-px inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[var(--accent)] font-mono text-[10px] font-medium text-[var(--accent)]">
                      {i + 1}
                    </span>
                    {note}
                  </li>
                ))}
              </ol>
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* Facts strip */}
      <div className="border-y border-[var(--border)] bg-[var(--surface)]">
        <Container>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {facts.map((fact, i) => (
              <div
                key={fact.value}
                className={cn("flex flex-col py-8 border-[var(--border)]", factCell[i])}
              >
                <dt className="order-2 mt-3 text-sm leading-snug text-[var(--text-secondary)]">
                  {fact.label}
                </dt>
                <dd className="order-1 font-display text-4xl leading-none tracking-[-0.01em]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </>
  );
}

export { MarketingHero };

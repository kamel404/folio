import { Section } from "@/components/layout/section";

const leftOut = [
  "Skill percentage bars",
  "Particle backgrounds",
  "Glowing gradients",
  "Cursor-chasing animations",
  "Stock photos of laptops",
  "A layout everyone has already seen",
];

function Principles() {
  return (
    <Section id="principles" index="04" label="House style">
      <div className="grid-12 gap-y-12">
        <div className="col-span-12 lg:col-span-6">
          <h2 className="text-[clamp(2.25rem,4.5vw,3.5rem)]">
            What we <em className="text-[var(--accent)]">leave out</em> matters as much as what goes in.
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-[var(--text-secondary)]">
            Recruiters spend under a minute on a portfolio. Every Folio theme is
            built so that minute goes to your name, your work, and a way to
            reach you.
          </p>
        </div>

        <ul className="col-span-12 lg:col-span-5 lg:col-start-8 self-end border-t border-[var(--foreground)]">
          {leftOut.map((item) => (
            <li
              key={item}
              className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-4"
            >
              <span className="font-display text-2xl text-[var(--text-tertiary)] line-through decoration-[var(--accent)] decoration-[1.5px]">
                {item}
              </span>
              <span className="label-mono text-[var(--accent)]">Cut</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export { Principles };

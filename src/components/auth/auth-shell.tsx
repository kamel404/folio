import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/layout/section";

interface AuthShellProps {
  index?: string;
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
  /** Right-hand column (desktop only) */
  aside?: React.ReactNode;
}

/**
 * Page frame shared by login / signup / forgot / reset — same grammar as the
 * marketing pages: eyebrow, serif h1, form on columns 1–5, note on columns 8–12.
 */
function AuthShell({ index = "00", label, title, lede, children, aside }: AuthShellProps) {
  return (
    <Container className="grid-12 gap-y-12 py-14 lg:py-20">
      <div className="col-span-12 lg:col-span-5 animate-fade-in-up">
        <Eyebrow index={index} label={label} />
        <h1 className="mt-6 text-[clamp(2.5rem,5vw,4rem)]">{title}</h1>
        {lede && (
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--text-secondary)]">{lede}</p>
        )}
        <div className="mt-10 max-w-md">{children}</div>
      </div>

      {aside && (
        <aside className="hidden lg:block lg:col-span-4 lg:col-start-9 lg:pt-14">{aside}</aside>
      )}
    </Container>
  );
}

interface AsideListProps {
  title: string;
  items: { title: string; body: string }[];
}

/** Numbered "what happens next" list for the aside column. */
function AsideList({ title, items }: AsideListProps) {
  return (
    <div>
      <p className="label-mono text-[var(--text-tertiary)]">{title}</p>
      <ol className="mt-4 border-t border-[var(--foreground)]">
        {items.map((item, i) => (
          <li key={item.title} className="flex gap-4 border-b border-[var(--border)] py-5">
            <span className="font-display text-3xl italic leading-none text-[var(--accent)]">
              {["i.", "ii.", "iii.", "iv."][i]}
            </span>
            <div>
              <h2 className="font-sans text-base font-semibold tracking-normal">{item.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export { AuthShell, AsideList };

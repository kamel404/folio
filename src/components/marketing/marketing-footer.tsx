import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Wordmark } from "@/components/ui/wordmark";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#themes", label: "Themes" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signup", label: "Get started" },
      { href: "/login", label: "Sign in" },
      { href: "/forgot-password", label: "Reset password" },
    ],
  },
];

function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <Container className="grid-12 gap-y-12 py-16">
        <div className="col-span-12 lg:col-span-5">
          <Wordmark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
            Professional portfolios for developers and creatives, written with
            you and published in minutes.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="col-span-6 lg:col-span-2">
            <p className="label-mono text-[var(--text-tertiary)]">{col.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-12 lg:col-span-3">
          <p className="label-mono text-[var(--text-tertiary)]">Colophon</p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
            Set in <span className="font-display text-base italic text-[var(--foreground)]">Instrument Serif</span>,
            Inter and <span className="font-mono text-xs">JetBrains Mono</span>. Printed on warm paper,
            one red ink.
          </p>
        </div>

        <div className="col-span-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6 label-mono text-[var(--text-tertiary)]">
          <span>© {new Date().getFullYear()} Folio</span>
          <span>getfolio.dev</span>
        </div>
      </Container>
    </footer>
  );
}

export { MarketingFooter };

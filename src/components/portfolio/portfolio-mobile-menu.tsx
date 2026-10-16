"use client";

import { useEffect, useId, useState } from "react";
import { FileText, Menu, X } from "lucide-react";
import { ExternalLink, portfolioButton, type PortfolioSectionLink } from "@/components/portfolio/portfolio-ui";

interface PortfolioMobileMenuProps {
  links: (PortfolioSectionLink & { href: string })[];
  cvUrl: string | null;
}

/** Section links below md. Closes on navigation and on Escape. */
function PortfolioMobileMenu({ links, cvUrl }: PortfolioMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (links.length === 0 && !cvUrl) return null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-2 cursor-pointer rounded-md p-2 transition-colors hover:text-[var(--accent)]"
      >
        {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute inset-x-0 top-16 z-50 border-b border-[var(--border)] bg-[var(--surface)] px-6 pb-6 shadow-lg"
        >
          <nav aria-label="Sections">
            <ul>
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-[var(--border)] py-3 text-base font-medium transition-colors hover:text-[var(--accent)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {cvUrl && (
            <ExternalLink href={cvUrl} className={`${portfolioButton.primary} mt-5 w-full`}>
              <FileText size={16} aria-hidden />
              View CV
            </ExternalLink>
          )}
        </div>
      )}
    </div>
  );
}

export { PortfolioMobileMenu };

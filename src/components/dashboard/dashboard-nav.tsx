"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  /** Not built yet: shown disabled with a "Soon" tag */
  soon?: boolean;
}

const items: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile", soon: true },
  { href: "/dashboard/projects", label: "Projects", soon: true },
  { href: "/dashboard/experience", label: "Experience", soon: true },
  { href: "/dashboard/skills", label: "Skills", soon: true },
  { href: "/dashboard/theme", label: "Theme", soon: true },
  { href: "/dashboard/import", label: "Import CV", soon: true },
  { href: "/dashboard/settings", label: "Settings", soon: true },
];

function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
        {items.map((item) => {
          const active = pathname === item.href;
          const base =
            "flex items-center justify-between gap-3 whitespace-nowrap rounded-sm px-3 py-2 text-sm transition-colors duration-150";

          return (
            <li key={item.href} className="shrink-0">
              {item.soon ? (
                <span
                  aria-disabled="true"
                  className={cn(base, "cursor-not-allowed text-[var(--text-tertiary)]")}
                >
                  {item.label}
                  <span className="label-mono text-[0.625rem]">Soon</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    base,
                    active
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]"
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { DashboardNav };

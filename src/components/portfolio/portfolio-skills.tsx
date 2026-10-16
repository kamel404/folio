import {
  Cloud,
  Code2,
  Database,
  Languages,
  Layout,
  Palette,
  Server,
  Smartphone,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { PortfolioSection, Tag } from "@/components/portfolio/portfolio-ui";
import type { Skill } from "@/types";

/** Icons for the suggested categories (lib/options.ts); anything else gets a generic mark. */
const CATEGORY_ICONS: [RegExp, LucideIcon][] = [
  [/language/i, Languages],
  [/front/i, Layout],
  [/back|api/i, Server],
  [/mobile/i, Smartphone],
  [/data/i, Database],
  [/devops|cloud|infra/i, Cloud],
  [/tool/i, Wrench],
  [/design/i, Palette],
  [/soft|people|team/i, Users],
];

function iconFor(category: string): LucideIcon {
  return CATEGORY_ICONS.find(([pattern]) => pattern.test(category))?.[1] ?? Code2;
}

/** Skills arrive ordered by sort_order; categories appear in the order of their first skill. */
function groupByCategory(skills: Skill[]): [string, Skill[]][] {
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) {
    const list = groups.get(skill.category) ?? [];
    list.push(skill);
    groups.set(skill.category, list);
  }
  return [...groups];
}

function PortfolioSkills({ skills }: { skills: Skill[] }) {
  return (
    <PortfolioSection id="skills" title="Skills">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groupByCategory(skills).map(([category, items]) => {
          const Icon = iconFor(category);
          return (
            <li key={category} className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="flex items-center gap-2.5 border-b border-[var(--border)] pb-4 text-base">
                <Icon size={16} aria-hidden className="text-[var(--accent)]" />
                {category}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {items.map((skill) => (
                  <li key={skill.id}>
                    <Tag>{skill.name}</Tag>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </PortfolioSection>
  );
}

export { PortfolioSkills };

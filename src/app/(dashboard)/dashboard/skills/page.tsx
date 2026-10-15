import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/section";
import { SkillsManager } from "@/components/dashboard/skills-manager";
import { listSkills, requirePageTenant } from "@/lib/data/dashboard";
import { SKILL_CATEGORY_SUGGESTIONS } from "@/lib/options";

export const metadata = { title: "Skills" };

export default async function SkillsPage() {
  const { tenant } = await requirePageTenant();
  const skills = await listSkills(tenant.id);
  const categories = [...new Set([...skills.map((s) => s.category), ...SKILL_CATEGORY_SUGGESTIONS])];

  return (
    <>
      <PageHeader
        stacked
        index="04"
        label="Skills"
        title="What you work with."
        lede="Skills are grouped by category on your portfolio. Use the arrows to order them within a group."
      />
      <Container className="pb-20">
        <SkillsManager skills={skills} categories={categories} />
      </Container>
    </>
  );
}

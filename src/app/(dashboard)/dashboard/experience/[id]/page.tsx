import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/section";
import { BackLink } from "@/components/dashboard/back-link";
import { ExperienceForm } from "@/components/dashboard/experience-form";
import { getExperience, requirePageTenant } from "@/lib/data/dashboard";

export async function generateMetadata({ params }: PageProps<"/dashboard/experience/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { tenant } = await requirePageTenant();
  const experience = await getExperience(tenant.id, id);
  return { title: `${experience.position} at ${experience.company}` };
}

export default async function EditExperiencePage({ params }: PageProps<"/dashboard/experience/[id]">) {
  const { id } = await params;
  const { tenant } = await requirePageTenant();
  const experience = await getExperience(tenant.id, id);

  return (
    <>
      <BackLink href="/dashboard/experience" label="Experience" />
      <PageHeader
        stacked
        index="03"
        label="Edit role"
        title={experience.position}
        lede={experience.company}
        className="pt-4 lg:pt-6"
      />
      <Container className="pb-12">
        <ExperienceForm experience={experience} />
      </Container>
    </>
  );
}

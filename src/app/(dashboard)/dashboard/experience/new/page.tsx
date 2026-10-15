import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/section";
import { BackLink } from "@/components/dashboard/back-link";
import { ExperienceForm } from "@/components/dashboard/experience-form";
import { requirePageTenant } from "@/lib/data/dashboard";

export const metadata = { title: "Add role" };

export default async function NewExperiencePage() {
  await requirePageTenant();

  return (
    <>
      <BackLink href="/dashboard/experience" label="Experience" />
      <PageHeader stacked index="03" label="Experience" title="Add a role." className="pt-4 lg:pt-6" />
      <Container className="pb-12">
        <ExperienceForm />
      </Container>
    </>
  );
}

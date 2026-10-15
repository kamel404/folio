import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/section";
import { BackLink } from "@/components/dashboard/back-link";
import { ProjectForm } from "@/components/dashboard/project-form";
import { listProjectCategories, requirePageTenant } from "@/lib/data/dashboard";
import { PROJECT_CATEGORY_SUGGESTIONS } from "@/lib/options";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const { tenant } = await requirePageTenant();
  const used = await listProjectCategories(tenant.id);

  return (
    <>
      <BackLink href="/dashboard/projects" label="Projects" />
      <PageHeader stacked index="02" label="Projects" title="New project." className="pt-4 lg:pt-6" />
      <Container className="pb-12">
        <ProjectForm categories={[...new Set([...used, ...PROJECT_CATEGORY_SUGGESTIONS])]} />
      </Container>
    </>
  );
}

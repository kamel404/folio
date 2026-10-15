import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/section";
import { BackLink } from "@/components/dashboard/back-link";
import { ProjectForm } from "@/components/dashboard/project-form";
import { getProject, listProjectCategories, requirePageTenant } from "@/lib/data/dashboard";
import { PROJECT_CATEGORY_SUGGESTIONS } from "@/lib/options";

export async function generateMetadata({ params }: PageProps<"/dashboard/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { tenant } = await requirePageTenant();
  const project = await getProject(tenant.id, id);
  return { title: project.title };
}

export default async function EditProjectPage({ params }: PageProps<"/dashboard/projects/[id]">) {
  const { id } = await params;
  const { tenant } = await requirePageTenant();
  const [project, used] = await Promise.all([getProject(tenant.id, id), listProjectCategories(tenant.id)]);

  return (
    <>
      <BackLink href="/dashboard/projects" label="Projects" />
      <PageHeader stacked index="02" label="Edit project" title={project.title} className="pt-4 lg:pt-6" />
      <Container className="pb-12">
        <ProjectForm project={project} categories={[...new Set([...used, ...PROJECT_CATEGORY_SUGGESTIONS])]} />
      </Container>
    </>
  );
}

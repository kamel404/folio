import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProjectList } from "@/components/dashboard/project-list";
import { listProjects, requirePageTenant } from "@/lib/data/dashboard";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { tenant } = await requirePageTenant();
  const projects = await listProjects(tenant.id);

  return (
    <>
      <PageHeader
        stacked
        index="02"
        label="Projects"
        title="What you've built."
        lede="Projects appear on your portfolio in this order. Hidden ones stay here until you show them."
        actions={
          projects.length > 0 && (
            <Link href="/dashboard/projects/new" className={buttonVariants()}>
              <Plus size={16} aria-hidden />
              New project
            </Link>
          )
        }
      />
      <Container className="pb-20">
        {projects.length > 0 ? (
          <ProjectList projects={projects} />
        ) : (
          <EmptyState
            title="No projects yet."
            body="Add the work you're proudest of: a product, a side project, a library, a case study."
            action={{ href: "/dashboard/projects/new", label: "Add your first project" }}
          />
        )}
      </Container>
    </>
  );
}

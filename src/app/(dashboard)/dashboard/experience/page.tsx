import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/section";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ExperienceList } from "@/components/dashboard/experience-list";
import { listExperiences, requirePageTenant } from "@/lib/data/dashboard";

export const metadata = { title: "Experience" };

export default async function ExperiencePage() {
  const { tenant } = await requirePageTenant();
  const experiences = await listExperiences(tenant.id);

  return (
    <>
      <PageHeader
        stacked
        index="03"
        label="Experience"
        title="Where you've worked."
        lede="Roles appear on your portfolio in this order. Most people put the latest first."
        actions={
          experiences.length > 0 && (
            <Link href="/dashboard/experience/new" className={buttonVariants()}>
              <Plus size={16} aria-hidden />
              Add role
            </Link>
          )
        }
      />
      <Container className="pb-20">
        {experiences.length > 0 ? (
          <ExperienceList experiences={experiences} />
        ) : (
          <EmptyState
            title="No roles yet."
            body="Add your jobs, freelance work or internships, with what you achieved in each."
            action={{ href: "/dashboard/experience/new", label: "Add your first role" }}
          />
        )}
      </Container>
    </>
  );
}

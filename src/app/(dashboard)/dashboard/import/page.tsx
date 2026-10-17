import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/section";
import { DashboardImport } from "@/components/import/dashboard-import";
import { getProfile, requirePageTenant } from "@/lib/data/dashboard";
import { getAiAllowance } from "@/lib/ai/usage";

export const metadata = { title: "Import" };

export default async function ImportPage() {
  const { tenant } = await requirePageTenant();
  const [profile, allowance] = await Promise.all([getProfile(tenant.id), getAiAllowance(tenant)]);

  return (
    <>
      <PageHeader
        stacked
        index="06"
        label="Import"
        title={
          <>
            Bring your work <em className="text-[var(--accent)]">in.</em>
          </>
        }
        lede="Upload a CV or answer a few questions. You review everything first; new roles, projects and skills are added next to what you already have, and anything already there is skipped."
      />
      <Container className="pb-12">
        <DashboardImport tenantId={tenant.id} profile={profile} allowance={allowance} />
      </Container>
    </>
  );
}

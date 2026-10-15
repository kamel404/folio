import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/section";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getProfile, requirePageTenant } from "@/lib/data/dashboard";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { tenant } = await requirePageTenant();
  const profile = await getProfile(tenant.id);

  return (
    <>
      <PageHeader
        stacked
        index="01"
        label="Profile"
        title="Who you are."
        lede="The basics people see first: your name, headline, photo, bio and where to find you."
      />
      <Container className="pb-12">
        <ProfileForm profile={profile} />
      </Container>
    </>
  );
}

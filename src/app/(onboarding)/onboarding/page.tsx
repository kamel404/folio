import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getPreview } from "@/lib/data/portfolio";
import { getAiAllowance } from "@/lib/ai/usage";
import { ROOT_DOMAIN } from "@/lib/config";

export const metadata = { title: "Set up your portfolio" };

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const preview = await getPreview();
  if (!preview) redirect("/login?next=/onboarding");
  const { tenant, content } = preview;
  // Finished (or skipped) onboarding: re-importing lives at /dashboard/import
  if (tenant.onboarding === "completed") redirect("/dashboard");

  const allowance = await getAiAllowance(tenant);
  const { error } = await searchParams;

  return (
    <OnboardingWizard
      tenant={tenant}
      content={content}
      allowance={allowance}
      address={`${tenant.slug}.${ROOT_DOMAIN}`}
      skipFailed={error === "skip"}
    />
  );
}

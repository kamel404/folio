import type { Metadata } from "next";
import { AuthShell, AsideList } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { normalizeSlug } from "@/lib/utils/slug";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const slug = typeof params.slug === "string" ? normalizeSlug(params.slug) : "";
  const plan = params.plan === "starter" || params.plan === "pro" ? params.plan : "";

  return (
    <AuthShell
      label="Create account"
      title={
        <>
          Let&apos;s get you <em className="text-[var(--accent)]">published.</em>
        </>
      }
      lede="It takes a minute. You can build and preview your portfolio before choosing a plan."
      aside={
        <AsideList
          title="What happens next"
          items={[
            { title: "Bring what you have", body: "Upload a CV or answer a few plain questions." },
            { title: "Read the first draft", body: "Edit anything, or ask for a rewrite of one section." },
            { title: "Choose a plan and go live", body: "Pay only when you're ready to publish." },
          ]}
        />
      }
    >
      <SignupForm defaultSlug={slug} plan={plan} />
    </AuthShell>
  );
}

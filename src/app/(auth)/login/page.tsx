import type { Metadata } from "next";
import { AuthShell, AsideList } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { safeNext } from "@/lib/utils/url";

export const metadata: Metadata = { title: "Sign in", alternates: { canonical: "/login" } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? safeNext(params.next, "") : "";
  const notice =
    params.error === "link" ? "That link has expired or was already used. Sign in, or request a new one." : undefined;

  return (
    <AuthShell
      label="Sign in"
      title={
        <>
          Welcome <em className="text-[var(--accent)]">back.</em>
        </>
      }
      lede="Pick up where you left off."
      aside={
        <AsideList
          title="Inside your dashboard"
          items={[
            { title: "Edit every section", body: "Profile, projects, experience and skills." },
            { title: "Switch palettes", body: "Five themes and custom colours, one click." },
            { title: "Manage your plan", body: "Upgrade, switch or cancel any time." },
          ]}
        />
      }
    >
      <LoginForm next={next} notice={notice} />
    </AuthShell>
  );
}

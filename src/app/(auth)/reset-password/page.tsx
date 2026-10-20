import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      label="New password"
      title={
        <>
          Choose a <em className="text-[var(--accent)]">new password.</em>
        </>
      }
      lede="You're signed in through your reset link. Set a password you'll remember."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}

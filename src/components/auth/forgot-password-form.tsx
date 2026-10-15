"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type FormState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";

function ForgotPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, {});

  if (state.success) {
    return (
      <FormMessage tone="success">
        <p className="font-medium">Check your inbox.</p>
        <p className="mt-1">
          If an account exists for <strong>{state.success}</strong>, a reset link is on its way.
        </p>
      </FormMessage>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <SubmitButton pendingText="Sending…">Send reset link</SubmitButton>
      <p className="text-sm text-[var(--text-secondary)]">
        Remembered it?{" "}
        <Link href="/login" className="link-underline text-[var(--foreground)]">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export { ForgotPasswordForm };

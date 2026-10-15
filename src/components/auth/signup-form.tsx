"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/app/(auth)/actions";
import type { FormState } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/ui/form-message";
import { SlugField } from "@/components/auth/slug-field";
import { SubmitButton } from "@/components/auth/submit-button";

interface SignupFormProps {
  defaultSlug?: string;
  plan?: string;
}

function SignupForm({ defaultSlug = "", plan = "" }: SignupFormProps) {
  const [state, action] = useActionState<FormState, FormData>(signUp, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.success) {
    return (
      <FormMessage tone="success">
        <p className="font-medium">Check your inbox.</p>
        <p className="mt-1">
          We sent a confirmation link to <strong>{state.success}</strong>. Open it to finish creating
          your account.
        </p>
      </FormMessage>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <input type="hidden" name="plan" value={plan} />

      <Input name="name" label="Full name" autoComplete="name" required defaultValue={v.name} error={fe.name} />
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        defaultValue={v.email}
        error={fe.email}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        error={fe.password}
      />
      <SlugField defaultValue={v.slug ?? defaultSlug} error={fe.slug} />

      <SubmitButton pendingText="Creating account…">Create account</SubmitButton>

      <p className="text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="link-underline text-[var(--foreground)]">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export { SignupForm };

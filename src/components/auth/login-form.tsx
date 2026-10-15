"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logIn, type FormState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";

interface LoginFormProps {
  next?: string;
  /** Pre-form notice, e.g. an expired email link */
  notice?: string;
}

function LoginForm({ next = "", notice }: LoginFormProps) {
  const [state, action] = useActionState<FormState, FormData>(logIn, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {notice && !state.error && <FormMessage tone="error">{notice}</FormMessage>}
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <input type="hidden" name="next" value={next} />

      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={fe.email}
      />
      <div className="flex flex-col gap-1.5">
        <Input
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          error={fe.password}
        />
        <Link
          href="/forgot-password"
          className="self-end text-sm text-[var(--text-secondary)] link-underline hover:text-[var(--foreground)]"
        >
          Forgot password?
        </Link>
      </div>

      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>

      <p className="text-sm text-[var(--text-secondary)]">
        New to Folio?{" "}
        <Link href="/signup" className="link-underline text-[var(--foreground)]">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export { LoginForm };

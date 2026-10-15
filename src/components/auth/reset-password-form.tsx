"use client";

import { useActionState } from "react";
import { resetPassword, type FormState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";

function ResetPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(resetPassword, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <Input
        name="password"
        type="password"
        label="New password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        error={fe.password}
      />
      <Input
        name="confirm"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        required
        error={fe.confirm}
      />
      <SubmitButton pendingText="Saving…">Set new password</SubmitButton>
    </form>
  );
}

export { ResetPasswordForm };

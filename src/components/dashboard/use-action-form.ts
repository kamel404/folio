"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NETWORK_FAILED, type FormState } from "@/lib/forms";

type FormAction = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * The contract every dashboard form follows:
 *   • submit → button shows a spinner, inputs keep their values (no auto-reset,
 *     so a failed save never wipes what was typed or the file that was picked)
 *   • field errors → shown under each field, first invalid field gets focus
 *   • form error  → banner at the top of the form (`state.error`), including
 *     "couldn't reach the server" instead of crashing into the error page
 *   • success     → toast, optional onSuccess, then navigate to `state.redirectTo`
 * Success side effects run as soon as the action returns — not in an effect —
 * so they still happen when the save re-renders the form away (e.g. a skill
 * moving to another category).
 * `action` is still passed to <form> so the form works before JS loads.
 */
export function useActionForm(
  action: FormAction,
  options: { onSuccess?: (form: HTMLFormElement) => void; /** false: no toast (e.g. wizard steps that move on by themselves) */ toast?: boolean } = {}
) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const onSuccess = useRef(options.onSuccess);
  useEffect(() => {
    onSuccess.current = options.onSuccess;
  });

  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    let result: FormState;
    try {
      result = await action(prev, formData);
    } catch (error) {
      console.error(error);
      return { error: NETWORK_FAILED };
    }
    if (result.success) {
      if (options.toast !== false) toast.success(result.success);
      if (formRef.current) onSuccess.current?.(formRef.current);
      if (result.redirectTo) router.push(result.redirectTo);
    }
    return result;
  }, {});

  // Move the user to the problem once the errors are on screen
  useEffect(() => {
    if (state.fieldErrors) {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    } else if (state.error) {
      formRef.current?.querySelector<HTMLElement>("[role='alert']")?.scrollIntoView({ block: "center" });
    }
  }, [state]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return {
    state,
    pending,
    fieldErrors: state.fieldErrors ?? {},
    formProps: { ref: formRef, action: formAction, onSubmit, noValidate: true },
  };
}

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { SignInAgainLink } from "@/components/dashboard/sign-in-again";
import { SESSION_EXPIRED } from "@/lib/forms";
import { cn } from "@/lib/utils";

/**
 * Layout pieces shared by every dashboard form, so profile / project /
 * experience forms read the same: ruled sections with a title + note on the
 * left and fields on the right, and one action bar at the end.
 */

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <fieldset className="grid gap-6 border-b border-[var(--border)] py-8 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-12">
      <div>
        <legend className="float-left text-base font-medium">{title}</legend>
        {description && (
          <p className="clear-left pt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </fieldset>
  );
}

/** Two fields side by side on wide screens. */
function FieldRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-5 sm:grid-cols-2", className)}>{children}</div>;
}

interface FormActionsProps {
  pending: boolean;
  submitLabel: string;
  pendingLabel?: string;
  cancelHref?: string;
  /** Extra controls on the left (e.g. a delete button on edit pages) */
  secondary?: React.ReactNode;
}

function FormActions({ pending, submitLabel, pendingLabel = "Saving…", cancelHref, secondary }: FormActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--background)]/95 px-6 py-4 backdrop-blur">
      <div>{secondary}</div>
      <div className="flex flex-wrap items-center gap-3">
        {cancelHref && (
          <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>
            Cancel
          </Link>
        )}
        <Button type="submit" isLoading={pending} loadingText={pendingLabel}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

/** Form-level error banner. An expired session gets a link back in that returns here. */
function FormError({ error, className }: { error?: string; className?: string }) {
  if (!error) return null;
  return (
    <FormMessage tone="error" className={className}>
      {error}
      {error === SESSION_EXPIRED && (
        <>
          {" "}
          <SignInAgainLink />
        </>
      )}
    </FormMessage>
  );
}

export { FormSection, FieldRow, FormActions, FormError };

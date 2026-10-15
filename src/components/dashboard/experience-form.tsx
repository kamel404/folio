"use client";

import { useState } from "react";
import { deleteExperience, saveExperience } from "@/app/(dashboard)/dashboard/experience/actions";
import { Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldRow, FormActions, FormError, FormSection } from "@/components/dashboard/form-parts";
import { DeleteButton } from "@/components/dashboard/list-actions";
import { useActionForm } from "@/components/dashboard/use-action-form";
import type { Experience } from "@/types";

function ExperienceForm({ experience }: { experience?: Experience }) {
  const { state, pending, fieldErrors: fe, formProps } = useActionForm(
    saveExperience.bind(null, experience?.id ?? null)
  );
  const [current, setCurrent] = useState(experience?.current ?? false);
  const label = experience ? `${experience.position} at ${experience.company}` : "";

  return (
    <form {...formProps} className="border-t border-[var(--foreground)]">
      <FormError error={state.error} className="mt-6" />

      <FormSection title="Role" description="Where you worked and what you did there.">
        <FieldRow>
          <Input name="position" label="Job title" required defaultValue={experience?.position} error={fe.position} />
          <Input name="company" label="Company" required defaultValue={experience?.company} error={fe.company} />
        </FieldRow>
        <Textarea
          name="description"
          label="What you did"
          required
          rows={6}
          hint="Responsibilities and results. Short paragraphs or one line per achievement."
          defaultValue={experience?.description}
          error={fe.description}
        />
      </FormSection>

      <FormSection title="Dates" description="Month and year are enough.">
        <FieldRow>
          <Input
            name="start_date"
            type="month"
            label="Started"
            required
            placeholder="YYYY-MM"
            defaultValue={experience?.start_date}
            error={fe.start_date}
          />
          <Input
            name="end_date"
            type="month"
            label="Ended"
            placeholder="YYYY-MM"
            disabled={current}
            required={!current}
            defaultValue={experience?.end_date ?? ""}
            error={current ? undefined : fe.end_date}
          />
        </FieldRow>
        <Checkbox
          name="current"
          label="I currently work here"
          checked={current}
          onChange={(e) => setCurrent(e.target.checked)}
        />
      </FormSection>

      <FormActions
        pending={pending}
        submitLabel={experience ? "Save changes" : "Add role"}
        pendingLabel={experience ? "Saving…" : "Adding…"}
        cancelHref="/dashboard/experience"
        secondary={
          experience && (
            <DeleteButton
              variant="full"
              noun="role"
              label={label}
              remove={() => deleteExperience(experience.id)}
              redirectTo="/dashboard/experience"
            />
          )
        }
      />
    </form>
  );
}

export { ExperienceForm };

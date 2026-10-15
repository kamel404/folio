"use client";

import { Fragment } from "react";
import { updateProfile } from "@/app/(dashboard)/dashboard/profile/actions";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldRow, FormActions, FormError, FormSection } from "@/components/dashboard/form-parts";
import { ImageField } from "@/components/dashboard/image-field";
import { useActionForm } from "@/components/dashboard/use-action-form";
import { AVAILABILITY_OPTIONS } from "@/lib/options";
import type { Profile } from "@/types";

function ProfileForm({ profile }: { profile: Profile }) {
  const { state, pending, fieldErrors: fe, formProps } = useActionForm(updateProfile);
  const p = profile;

  return (
    <form {...formProps} className="border-t border-[var(--foreground)]">
      <FormError error={state.error} className="mt-6" />

      {/* Remount the fields after each save so they show the values as stored (e.g. normalized links) */}
      <Fragment key={p.updated_at}>

      <FormSection title="Basics" description="Your name and headline open your portfolio.">
        <ImageField
          name="profile_image"
          label="Photo"
          currentUrl={p.profile_image_url}
          hint="Square works best. JPG, PNG, WebP or GIF, up to 4 MB."
          error={fe.profile_image}
        />
        <FieldRow>
          <Input name="name" label="Full name" required autoComplete="name" defaultValue={p.name} error={fe.name} />
          <Input
            name="title"
            label="Headline"
            required
            placeholder="Senior Frontend Engineer"
            defaultValue={p.title}
            error={fe.title}
          />
        </FieldRow>
        <FieldRow>
          <Input
            name="location"
            label="Location"
            placeholder="Lisbon, Portugal"
            defaultValue={p.location ?? ""}
            error={fe.location}
          />
          <Select
            name="availability_status"
            label="Availability"
            defaultValue={p.availability_status ?? ""}
            error={fe.availability_status}
          >
            <option value="">Don&apos;t show</option>
            {AVAILABILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </FieldRow>
      </FormSection>

      <FormSection title="About" description="A one-liner for the top of the page, and the longer story for the About section.">
        <Textarea
          name="short_bio"
          label="Short bio"
          rows={2}
          maxLength={200}
          hint="One or two sentences, up to 200 characters."
          defaultValue={p.short_bio ?? ""}
          error={fe.short_bio}
        />
        <Textarea
          name="long_bio"
          label="About you"
          rows={7}
          hint="What you do, what you care about, what you're looking for."
          defaultValue={p.long_bio ?? ""}
          error={fe.long_bio}
        />
      </FormSection>

      <FormSection title="Contact" description="Shown on your portfolio so people can reach you. Leave blank to hide.">
        <FieldRow>
          <Input
            name="email"
            type="email"
            label="Public email"
            autoComplete="email"
            defaultValue={p.email ?? ""}
            error={fe.email}
          />
          <Input name="phone" type="tel" label="Phone" autoComplete="tel" defaultValue={p.phone ?? ""} error={fe.phone} />
        </FieldRow>
      </FormSection>

      <FormSection title="Links" description="Full links or just the address, e.g. github.com/you.">
        <FieldRow>
          <Input
            name="linkedin_url"
            label="LinkedIn"
            inputMode="url"
            placeholder="linkedin.com/in/you"
            defaultValue={p.linkedin_url ?? ""}
            error={fe.linkedin_url}
          />
          <Input
            name="github_url"
            label="GitHub"
            inputMode="url"
            placeholder="github.com/you"
            defaultValue={p.github_url ?? ""}
            error={fe.github_url}
          />
        </FieldRow>
        <Input
          name="cv_url"
          label="CV link"
          inputMode="url"
          placeholder="https://…/cv.pdf"
          hint="A link to your CV (Google Drive, Dropbox, your site)."
          defaultValue={p.cv_url ?? ""}
          error={fe.cv_url}
        />
      </FormSection>
      </Fragment>

      <FormActions pending={pending} submitLabel="Save profile" />
    </form>
  );
}

export { ProfileForm };

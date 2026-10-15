"use client";

import { useId } from "react";
import { deleteProject, saveProject } from "@/app/(dashboard)/dashboard/projects/actions";
import { Input, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldRow, FormActions, FormError, FormSection } from "@/components/dashboard/form-parts";
import { ImageField } from "@/components/dashboard/image-field";
import { DeleteButton } from "@/components/dashboard/list-actions";
import { useActionForm } from "@/components/dashboard/use-action-form";
import type { Project } from "@/types";

interface ProjectFormProps {
  /** Omit to create a new project */
  project?: Project;
  categories: string[];
}

function ProjectForm({ project, categories }: ProjectFormProps) {
  const { state, pending, fieldErrors: fe, formProps } = useActionForm(
    saveProject.bind(null, project?.id ?? null)
  );
  const listId = useId();

  return (
    <form {...formProps} className="border-t border-[var(--foreground)]">
      <FormError error={state.error} className="mt-6" />

      <FormSection title="Overview" description="The title and one-line summary show on your project cards.">
        <Input name="title" label="Title" required defaultValue={project?.title} error={fe.title} />
        <Textarea
          name="short_description"
          label="Summary"
          required
          rows={2}
          maxLength={200}
          hint="One sentence, up to 200 characters."
          defaultValue={project?.short_description}
          error={fe.short_description}
        />
        <FieldRow>
          <div>
            <Input
              name="category"
              label="Category"
              required
              list={listId}
              defaultValue={project?.category ?? "Web Application"}
              error={fe.category}
            />
            <datalist id={listId}>
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <Input
            name="technologies"
            label="Technologies"
            placeholder="React, TypeScript, Postgres"
            hint="Separate with commas."
            defaultValue={project?.technologies.join(", ")}
            error={fe.technologies}
          />
        </FieldRow>
      </FormSection>

      <FormSection title="Cover image" description="Shown on the project card. Landscape images work best.">
        <ImageField
          name="project_image"
          label="Image"
          shape="wide"
          currentUrl={project?.image_url ?? null}
          hint="16:10 works best. JPG, PNG, WebP or GIF, up to 4 MB."
          error={fe.project_image}
        />
      </FormSection>

      <FormSection title="Details" description="The full story: the problem, your role, what you shipped.">
        <Textarea name="description" label="Description" rows={8} defaultValue={project?.description ?? ""} error={fe.description} />
      </FormSection>

      <FormSection title="Links" description="Full links or just the address.">
        <FieldRow>
          <Input
            name="live_url"
            label="Live site"
            inputMode="url"
            placeholder="myapp.com"
            defaultValue={project?.live_url ?? ""}
            error={fe.live_url}
          />
          <Input
            name="github_url"
            label="Source code"
            inputMode="url"
            placeholder="github.com/you/repo"
            defaultValue={project?.github_url ?? ""}
            error={fe.github_url}
          />
        </FieldRow>
      </FormSection>

      <FormSection title="Display" description="Control where and whether this project appears.">
        <Checkbox
          name="published"
          label="Show on my portfolio"
          hint="Untick to keep it as a hidden draft."
          defaultChecked={project?.published ?? true}
        />
        <Checkbox
          name="featured"
          label="Feature this project"
          hint="Featured projects are highlighted at the top."
          defaultChecked={project?.featured ?? false}
        />
        <Input
          name="slug"
          label="URL name"
          placeholder={project ? undefined : "Generated from the title"}
          hint="Used in the project's link. Leave blank to generate it from the title."
          defaultValue={project?.slug}
          error={fe.slug}
          className="font-mono text-sm"
        />
      </FormSection>

      <FormActions
        pending={pending}
        submitLabel={project ? "Save changes" : "Create project"}
        pendingLabel={project ? "Saving…" : "Creating…"}
        cancelHref="/dashboard/projects"
        secondary={
          project && (
            <DeleteButton
              variant="full"
              noun="project"
              label={project.title}
              remove={() => deleteProject(project.id)}
              redirectTo="/dashboard/projects"
            />
          )
        }
      />
    </form>
  );
}

export { ProjectForm };

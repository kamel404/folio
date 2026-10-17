import type { Project } from "@/types";

/**
 * Column lists shared by the dashboard (owner reads) and the portfolio
 * (public + preview reads), so both always see the same shape.
 */

export const PROFILE_COLUMNS =
  "id, tenant_id, name, title, short_bio, long_bio, email, phone, linkedin_url, github_url, cv_url, profile_image_url, location, availability_status, updated_at";

export const PROJECT_COLUMNS =
  "id, tenant_id, title, slug, short_description, description, image_url, github_url, live_url, category, featured, published, sort_order, project_technologies(technologies(name))";

export const EXPERIENCE_COLUMNS =
  "id, tenant_id, company, position, description, start_date, end_date, current, sort_order";

export const SKILL_COLUMNS = "id, tenant_id, name, category, sort_order";

export const THEME_COLUMNS = "palette_id, custom_colors, font_heading, font_body, show_photo";

export type ProjectRow = Omit<Project, "technologies"> & {
  project_technologies: { technologies: { name: string } | null }[];
};

export function toProject({ project_technologies, ...row }: ProjectRow): Project {
  return {
    ...row,
    technologies: project_technologies
      .flatMap((pt) => (pt.technologies ? [pt.technologies.name] : []))
      .sort((a, b) => a.localeCompare(b)),
  };
}

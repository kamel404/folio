import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PortfolioProjectPage } from "@/components/portfolio/portfolio-page";
import { findProject, getPreview } from "@/lib/data/portfolio";

export async function generateMetadata({ params }: PageProps<"/preview/projects/[project]">): Promise<Metadata> {
  const { project: projectSlug } = await params;
  const preview = await getPreview().catch(() => null);
  const project = preview && findProject(preview.content, projectSlug);
  return { title: project ? `Preview: ${project.title}` : "Preview" };
}

export default async function PreviewProjectPage({ params }: PageProps<"/preview/projects/[project]">) {
  const { project: projectSlug } = await params;
  const preview = await getPreview();
  if (!preview) redirect(`/login?next=/preview/projects/${encodeURIComponent(projectSlug)}`);

  // Hidden projects 404 here too: the preview shows only what visitors would see
  const project = findProject(preview.content, projectSlug);
  if (!project) notFound();
  return <PortfolioProjectPage content={preview.content} base="/preview" project={project} />;
}

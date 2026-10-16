import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioOffline } from "@/components/portfolio/portfolio-offline";
import { PortfolioProjectPage } from "@/components/portfolio/portfolio-page";
import { findProject, getSite } from "@/lib/data/portfolio";
import { hiddenMetadata, projectMetadata } from "@/lib/seo";

/** slug.getfolio.dev/projects/[project] — only published projects of a live tenant. */
export const revalidate = 60;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/sites/[slug]/projects/[project]">): Promise<Metadata> {
  const { slug, project: projectSlug } = await params;
  const site = await getSite(slug);
  if (site.status !== "live") return hiddenMetadata(site.status === "offline" ? "Offline" : "Not found");
  const project = findProject(site.content, projectSlug);
  if (!project) return hiddenMetadata("Not found");
  return projectMetadata(site.tenant.slug, site.content, project);
}

export default async function SiteProjectPage({ params }: PageProps<"/sites/[slug]/projects/[project]">) {
  const { slug, project: projectSlug } = await params;
  const site = await getSite(slug);

  if (site.status === "missing") notFound();
  if (site.status === "offline") return <PortfolioOffline />;

  const project = findProject(site.content, projectSlug);
  if (!project) notFound();
  return <PortfolioProjectPage content={site.content} base="" project={project} />;
}

import type { Metadata } from "next";
import { tenantUrl } from "@/lib/config";
import type { PortfolioContent, Project } from "@/types";

/**
 * Per-tenant metadata for the public portfolio. Titles are absolute (no
 * "| Folio" suffix) and every Open Graph field is the tenant's own, so a
 * shared link previews as the person, not as Folio.
 */

function clip(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`;
}

export function portfolioMetadata(slug: string, { profile }: PortfolioContent): Metadata {
  const title = `${profile.name} — ${profile.title}`;
  const description = clip(profile.short_bio || profile.long_bio || `${profile.name}, ${profile.title}.`);
  const url = tenantUrl(slug);
  const image = profile.profile_image_url;

  return {
    title: { absolute: title },
    description,
    metadataBase: new URL(url),
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      url,
      siteName: profile.name,
      title,
      description,
      images: image ? [{ url: image, alt: profile.name }] : undefined,
    },
    twitter: { card: "summary", title, description, images: image ? [image] : undefined },
    robots: { index: true, follow: true },
  };
}

export function projectMetadata(slug: string, { profile }: PortfolioContent, project: Project): Metadata {
  const title = `${project.title} — ${profile.name}`;
  const description = clip(project.short_description);
  const url = `${tenantUrl(slug)}/projects/${project.slug}`;
  const image = project.image_url ?? profile.profile_image_url;

  return {
    title: { absolute: title },
    description,
    metadataBase: new URL(tenantUrl(slug)),
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: profile.name,
      title,
      description,
      images: image ? [{ url: image, alt: project.title }] : undefined,
    },
    twitter: {
      card: project.image_url ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

/** Unclaimed, offline or missing pages: never indexed, nothing about the person. */
export const hiddenMetadata = (title: string): Metadata => ({ title, robots: { index: false, follow: false } });

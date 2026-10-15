import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/layout/section";
import { PortfolioOffline } from "@/components/portfolio/portfolio-offline";
import { getTenantBySlug } from "@/lib/data/tenant";
import { isLive } from "@/lib/payments/plans";

/**
 * Tenant portfolio. proxy.ts rewrites  slug.getfolio.dev/*  →  /sites/slug/*
 * (this route is not reachable on the main domain).
 * Phase 3 replaces the placeholder below with the real portfolio components.
 */

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  // Never advertise unpublished portfolios
  if (!tenant || !isLive(tenant)) {
    return { title: "Offline", robots: { index: false } };
  }
  return { title: slug };
}

export default async function SitePage({ params }: Props) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) notFound();
  if (!isLive(tenant)) return <PortfolioOffline />;

  return (
    <main className="flex flex-1 items-center py-24">
      <Container size="sm">
        <Eyebrow label="Portfolio" />
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)]">{tenant.slug}</h1>
        <p className="mt-6 text-lg text-[var(--text-secondary)]">
          This portfolio is live. Rendering arrives in Phase 3.
        </p>
      </Container>
    </main>
  );
}

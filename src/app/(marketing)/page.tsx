import { MarketingHero } from "@/components/marketing/marketing-hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeatureIndex } from "@/components/marketing/feature-index";
import { ThemeGallery } from "@/components/marketing/theme-gallery";
import { Principles } from "@/components/marketing/principles";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { platformMetadata } from "@/lib/seo";

export const metadata = platformMetadata({
  title: "Folio — Build your portfolio in 5 minutes",
  description:
    "Folio is an AI-powered portfolio builder for developers and creatives. Upload a CV or answer a few questions, pick a theme, and your portfolio is live at your own address in minutes.",
  path: "/",
});

export default function LandingPage() {
  return (
    <>
      <MarketingHero />
      <HowItWorks />
      <FeatureIndex />
      <ThemeGallery />
      <Principles />
      <ClosingCta />
    </>
  );
}

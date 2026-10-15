import { MarketingHero } from "@/components/marketing/marketing-hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeatureIndex } from "@/components/marketing/feature-index";
import { ThemeGallery } from "@/components/marketing/theme-gallery";
import { Principles } from "@/components/marketing/principles";
import { ClosingCta } from "@/components/marketing/closing-cta";

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

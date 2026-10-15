import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/layout/section";
import { PricingGrid } from "@/components/marketing/pricing-table";
import { FaqList } from "@/components/marketing/faq-list";
import { ClosingCta } from "@/components/marketing/closing-cta";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Folio has two plans: Starter and Pro. Build and preview your portfolio first, and pay only when you're ready to publish.",
};

const faqs = [
  {
    q: "Do I need a card to start?",
    a: "No. You can create an account, import your CV, edit every section and preview your portfolio privately without paying. You only choose a plan when you're ready to put it online.",
  },
  {
    q: "What happens if I cancel?",
    a: "Your portfolio goes offline, but nothing is deleted. Your content, theme and address stay saved, so subscribing again brings it back exactly as it was.",
  },
  {
    q: "Which palettes do I get?",
    a: "All five, on both plans, plus custom colours. Every palette uses the same layout, so you can switch at any time without anything breaking.",
  },
  {
    q: "Is there Folio branding on my portfolio?",
    a: "No. Your portfolio is yours: your name, your work, your address.",
  },
  {
    q: "What does Pro add?",
    a: "Your own domain (yourname.com instead of yourname.getfolio.dev), unlimited AI rewrites, a portfolio quality review and full analytics.",
  },
  {
    q: "How do payments work?",
    a: "Payments are handled by Lemon Squeezy, which also takes care of tax and invoices. Choose monthly or yearly billing; yearly saves about a third.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        index="00"
        label="Pricing"
        title={
          <>
            Two plans. <em className="text-[var(--text-secondary)]">No surprises.</em>
          </>
        }
        lede="Build and preview your portfolio first. Choose a plan when you're ready to publish, and cancel whenever you like."
      />

      <Section flush className="pt-0 lg:pt-0">
        <PricingGrid />
      </Section>

      <Section
        index="01"
        label="Questions"
        title={
          <>
            Plain <em className="text-[var(--text-secondary)]">answers.</em>
          </>
        }
      >
        <FaqList items={faqs} />
      </Section>

      <ClosingCta index="02" />
    </>
  );
}

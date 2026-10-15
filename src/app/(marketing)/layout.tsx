import { MarketingNavbar } from "@/components/marketing/marketing-navbar";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </>
  );
}

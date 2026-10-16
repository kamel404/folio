import { connection } from "next/server";
import { redirect } from "next/navigation";
import { PortfolioTheme } from "@/components/portfolio/portfolio-theme";
import { PreviewBar } from "@/components/portfolio/preview-bar";
import { getPreview } from "@/lib/data/portfolio";

/**
 * The owner's private preview: their portfolio exactly as visitors would see
 * it (published projects only), on any plan, never cached. proxy.ts already
 * sends signed-out visitors to /login; this is the real check.
 */
export const metadata = { title: "Preview", robots: { index: false, follow: false } };

export default async function PreviewLayout({ children }: LayoutProps<"/preview">) {
  await connection();
  // A failed read is left to the page, whose error.tsx sits inside this layout
  const preview = await getPreview().catch(() => undefined);
  if (preview === null) redirect("/login?next=/preview");

  return (
    <>
      {preview && <PortfolioTheme theme={preview.content.theme} />}
      {preview && <PreviewBar tenant={preview.tenant} content={preview.content} />}
      {children}
    </>
  );
}

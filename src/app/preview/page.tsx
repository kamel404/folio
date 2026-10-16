import { redirect } from "next/navigation";
import { PortfolioHome } from "@/components/portfolio/portfolio-page";
import { getPreview } from "@/lib/data/portfolio";

export default async function PreviewPage() {
  const preview = await getPreview();
  if (!preview) redirect("/login?next=/preview");
  return <PortfolioHome content={preview.content} base="/preview" />;
}

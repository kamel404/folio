import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/section";
import { ThemeEditor } from "@/components/dashboard/theme-editor";
import { getPreview } from "@/lib/data/portfolio";
import { ROOT_DOMAIN } from "@/lib/config";

export const metadata = { title: "Theme" };

export default async function ThemePage() {
  // The preview loader: the theme plus the published content the live preview renders
  const preview = await getPreview();
  if (!preview) redirect("/login?next=/dashboard/theme");

  return (
    <>
      <PageHeader
        stacked
        index="05"
        label="Theme"
        title="How it looks."
        lede="Pick a palette and typefaces. The preview follows along; your site only changes when you save."
      />
      <Container className="pb-12">
        <ThemeEditor content={preview.content} address={`${preview.tenant.slug}.${ROOT_DOMAIN}`} />
      </Container>
    </>
  );
}

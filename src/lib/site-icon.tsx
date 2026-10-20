import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { readableOn, resolvePalette } from "@/lib/themes/palettes";
import type { PortfolioContent } from "@/types";

/**
 * A live portfolio's browser / home-screen icon: the owner's initial on
 * their accent colour. Portfolios carry no Folio branding, so this replaces
 * the platform icons there (see SITE_ICONS in lib/seo.ts).
 */

export const SITE_ICON_SIZE = 180;

// Glyphs Inter has; anything else (emoji, CJK…) would make satori fetch a font
const DRAWABLE = /[A-Za-z0-9À-ɏͰ-ϿЀ-ӿ]/;

function initial(name: string, slug: string): string {
  const first = [...name.trim()].find((ch) => DRAWABLE.test(ch));
  return (first ?? slug[0] ?? "·").toUpperCase();
}

export async function siteIcon(slug: string, { profile, theme }: PortfolioContent): Promise<ImageResponse> {
  const { accent } = resolvePalette(theme).colors;
  const inter = await readFile(join(process.cwd(), "src/assets/fonts/Inter-SemiBold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: accent,
          color: readableOn(accent),
          fontFamily: "Inter",
          fontSize: 112,
          letterSpacing: -4,
        }}
      >
        {initial(profile.name, slug)}
      </div>
    ),
    {
      width: SITE_ICON_SIZE,
      height: SITE_ICON_SIZE,
      fonts: [{ name: "Inter", data: inter, style: "normal", weight: 600 }],
    }
  );
}

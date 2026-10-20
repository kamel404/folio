import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ROOT_DOMAIN } from "@/lib/config";
import { startingPrice } from "@/lib/payments/plans";

/**
 * Share image for the marketing pages, rendered once at build time. Each page
 * that sets its own openGraph needs an opengraph-image file next to it (a
 * page's openGraph drops the images of the segments above it); those files
 * just call this.
 *
 * Never put one in app/ itself: a file-based image overrides metadata, so it
 * would replace tenants' own profile photos on their portfolio links.
 */

export const PLATFORM_OG_SIZE = { width: 1200, height: 630 };

const PAPER = "#F3F0E8";
const INK = "#16150F";
const MUTED = "#5C584D";
const VERMILION = "#C63D1B";

const font = (file: string) => readFile(join(process.cwd(), "src/assets/fonts", file));

export async function platformOgImage() {
  const [serif, serifItalic, mono] = await Promise.all([
    font("InstrumentSerif-Regular.ttf"),
    font("InstrumentSerif-Italic.ttf"),
    font("JetBrainsMono-Medium.ttf"),
  ]);

  const label = { fontFamily: "JetBrains Mono", fontSize: 22, letterSpacing: 2, textTransform: "uppercase" } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: PAPER,
          color: INK,
          fontFamily: "Instrument Serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 64, letterSpacing: -1 }}>
            folio<span style={{ color: VERMILION, marginLeft: -6 }}>.</span>
          </div>
          <div style={{ ...label, color: MUTED }}>Portfolio builder</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 124, lineHeight: 0.95, letterSpacing: -3 }}>
          <div style={{ display: "flex" }}>Your portfolio,</div>
          <div style={{ display: "flex" }}>
            <span style={{ fontStyle: "italic", color: VERMILION }}>live</span>
            <span style={{ marginLeft: 28 }}>in five minutes.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `2px solid ${INK}`,
            paddingTop: 24,
            ...label,
          }}
        >
          <span>{ROOT_DOMAIN}</span>
          <span style={{ color: MUTED }}>From ${startingPrice} a month</span>
        </div>
      </div>
    ),
    {
      ...PLATFORM_OG_SIZE,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Instrument Serif", data: serifItalic, style: "italic", weight: 400 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 500 },
      ],
    }
  );
}

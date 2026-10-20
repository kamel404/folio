import type { Metadata } from "next";
import { DM_Sans, Inter, Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { PLATFORM_URL } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/* Portfolio typefaces (lib/themes/fonts.ts). Not preloaded: the files only
   download on portfolios whose theme uses them. */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: false,
});

// Defaults for every platform page. Marketing pages set their own canonical,
// Open Graph and image (lib/seo.ts platformMetadata); tenant sites replace all of it.
export const metadata: Metadata = {
  title: {
    default: "Folio — Build your portfolio in 5 minutes",
    template: "%s | Folio",
  },
  description:
    "Folio is an AI-powered portfolio builder for developers and creatives. Sign up, answer a few questions or upload your CV, pick a theme, and your portfolio goes live instantly.",
  metadataBase: new URL(PLATFORM_URL),
  applicationName: "Folio",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Folio",
    title: "Folio — Build your portfolio in 5 minutes",
    description:
      "AI-powered portfolio builder. From signup to live portfolio in under 5 minutes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Folio — Build your portfolio in 5 minutes",
    description: "AI-powered portfolio builder for developers and creatives.",
  },
  // No robots default: pages are indexable unless they say otherwise, and an
  // explicit "index" here would sit next to the "noindex" Next adds to 404s.
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

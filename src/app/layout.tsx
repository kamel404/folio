import type { Metadata } from "next";
import { DM_Sans, Inter, Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Folio — Build your portfolio in 5 minutes",
    template: "%s | Folio",
  },
  description:
    "Folio is an AI-powered portfolio builder for developers and creatives. Sign up, answer a few questions or upload your CV, pick a theme, and your portfolio goes live instantly.",
  metadataBase: new URL("https://getfolio.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://getfolio.dev",
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
  robots: {
    index: true,
    follow: true,
  },
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

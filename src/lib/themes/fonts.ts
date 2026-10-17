/**
 * Typefaces a portfolio can use (theme_configs.font_heading / font_body store
 * the name). The files are loaded with next/font in app/layout.tsx, which
 * exposes each one as a CSS variable on <html>; only Inter is preloaded, the
 * others download only on portfolios that use them.
 */

export const PORTFOLIO_FONTS = [
  { name: "Inter", note: "Neutral and very legible", cssVar: "--font-inter" },
  { name: "Plus Jakarta Sans", note: "Geometric, a little warmer", cssVar: "--font-jakarta" },
  { name: "DM Sans", note: "Soft and friendly", cssVar: "--font-dm-sans" },
] as const;

export type PortfolioFont = (typeof PORTFOLIO_FONTS)[number]["name"];

export const DEFAULT_FONT: PortfolioFont = "Inter";

export const FONT_NAMES = PORTFOLIO_FONTS.map((f) => f.name) as [PortfolioFont, ...PortfolioFont[]];

/** A font-family value for a stored font name. Unknown names fall back to Inter. */
export function fontStack(name: string | null | undefined): string {
  const font = PORTFOLIO_FONTS.find((f) => f.name === name) ?? PORTFOLIO_FONTS[0];
  return `var(${font.cssVar}), system-ui, -apple-system, sans-serif`;
}

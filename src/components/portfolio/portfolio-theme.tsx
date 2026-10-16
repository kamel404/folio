import { resolvePalette, themeCss } from "@/lib/themes/palettes";
import type { ThemeConfig } from "@/types";

/**
 * Injects the tenant's palette as :root variables, overriding the platform
 * tokens for this page only. Rendered by the portfolio layouts (public site
 * and preview), so pages, 404s and error screens below them are all themed.
 */
function PortfolioTheme({ theme }: { theme: ThemeConfig }) {
  return <style>{themeCss(resolvePalette(theme))}</style>;
}

export { PortfolioTheme };

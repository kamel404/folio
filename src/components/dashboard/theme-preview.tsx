"use client";

import { useEffect, useRef, useState } from "react";
import { PortfolioHome } from "@/components/portfolio/portfolio-page";
import { themeVars } from "@/lib/themes/palettes";
import type { PortfolioContent, ThemeConfig } from "@/types";

/** Width the portfolio is laid out at before being zoomed to fit the frame (a desktop browser). */
const CANVAS_WIDTH = 1200;

interface ThemePreviewProps {
  content: PortfolioContent;
  /** The unsaved theme being edited */
  theme: ThemeConfig;
  address: string;
}

/**
 * The owner's real portfolio, rendered with the theme being edited. The theme
 * goes on a wrapper as CSS variables (the same themeVars() the live site
 * injects), and the page is laid out at desktop width then zoomed to fit.
 * `inert`: links and buttons inside are for looking at, not clicking.
 */
function ThemePreview({ content, theme, address }: ThemePreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.55);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => setZoom(entry.contentRect.width / CANVAS_WIDTH));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const { colorScheme, ...vars } = themeVars(theme);

  return (
    <figure className="isolate overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-md">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5">
        <span className="truncate font-mono text-xs text-[var(--text-secondary)]">{address}</span>
        <span className="label-mono shrink-0 text-[var(--text-tertiary)]">Live preview</span>
      </figcaption>
      <div
        ref={frameRef}
        className="h-[420px] overflow-y-auto overflow-x-hidden xl:h-[calc(100vh-16rem)] xl:max-h-[760px] xl:min-h-[480px]"
      >
        <div
          inert
          data-testid="theme-preview"
          style={{ ...vars, colorScheme, width: CANVAS_WIDTH, zoom }}
          className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]"
        >
          <PortfolioHome content={{ ...content, theme }} base="/preview" />
        </div>
      </div>
    </figure>
  );
}

export { ThemePreview };

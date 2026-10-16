/**
 * Preset portfolio palettes (tenant sites, not the Folio platform).
 * Each one maps 1:1 to the CSS variables injected on portfolio render.
 */

import type { ThemeConfig } from "@/types";

export interface ThemePalette {
  id: string;
  name: string;
  /** One-line description shown in the theme picker */
  note: string;
  colors: {
    background: string;
    surface: string;
    foreground: string;
    textMuted: string;
    accent: string;
    accentDark: string;
    border: string;
    warmBg: string;
  };
}

export const palettes: ThemePalette[] = [
  {
    id: "warm-earth",
    name: "Warm Earth",
    note: "Clay accent on soft stone",
    colors: {
      background: "#F7F6F2",
      surface: "#FFFFFF",
      foreground: "#1F1F1C",
      textMuted: "#6B6A63",
      accent: "#D97757",
      accentDark: "#B85C3E",
      border: "#E6E3DA",
      warmBg: "#EFEDE6",
    },
  },
  {
    id: "slate-blue",
    name: "Slate Blue",
    note: "Plain, trustworthy, corporate",
    colors: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      foreground: "#0F172A",
      textMuted: "#64748B",
      accent: "#3B82F6",
      accentDark: "#1D4ED8",
      border: "#E2E8F0",
      warmBg: "#F1F5F9",
    },
  },
  {
    id: "forest",
    name: "Forest",
    note: "Moss green, quiet and natural",
    colors: {
      background: "#F8FAF5",
      surface: "#FFFFFF",
      foreground: "#1A2E1A",
      textMuted: "#5F6F5F",
      accent: "#4A7C59",
      accentDark: "#355C41",
      border: "#E1E8DC",
      warmBg: "#EEF3EA",
    },
  },
  {
    id: "sand",
    name: "Sand",
    note: "Amber on paper, for creatives",
    colors: {
      background: "#FAF9F6",
      surface: "#FFFFFF",
      foreground: "#292524",
      textMuted: "#78716C",
      accent: "#B45309",
      accentDark: "#92400E",
      border: "#E7E5E4",
      warmBg: "#F5F2EC",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    note: "Dark, for people who live in a terminal",
    colors: {
      background: "#0F172A",
      surface: "#1E293B",
      foreground: "#F1F5F9",
      textMuted: "#94A3B8",
      accent: "#38BDF8",
      accentDark: "#0EA5E9",
      border: "#334155",
      warmBg: "#152036",
    },
  },
];

export function getPalette(id: string): ThemePalette {
  return palettes.find((p) => p.id === id) ?? palettes[0];
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * The tenant's palette: the preset from theme_configs.palette_id, with any
 * custom_colors laid over it. Custom values are user data, so only
 * well-formed #RRGGBB strings are accepted — they end up inside a <style> tag.
 */
export function resolvePalette(config: Pick<ThemeConfig, "palette_id" | "custom_colors"> | null): ThemePalette {
  const base = getPalette(config?.palette_id ?? "");
  const custom = config?.custom_colors;
  if (!custom || typeof custom !== "object") return base;

  const colors = { ...base.colors };
  for (const key of Object.keys(colors) as (keyof ThemePalette["colors"])[]) {
    const value = custom[key];
    if (typeof value === "string" && HEX_COLOR.test(value)) colors[key] = value;
  }
  return { ...base, colors };
}

/** WCAG relative luminance of a #RRGGBB colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Near-black or white, whichever contrasts more with the given background. */
export function readableOn(hex: string): string {
  const l = luminance(hex);
  return (l + 0.05) / 0.05 >= 1.05 / (l + 0.05) ? "#111111" : "#FFFFFF";
}

/**
 * The palette as a `:root { … }` rule. Injected by the portfolio layouts so
 * the whole page (body background, selection, focus rings) takes the theme.
 * Every value is a validated hex colour, so the string is safe to inline.
 */
export function themeCss(palette: ThemePalette): string {
  const vars = Object.entries(paletteVars(palette))
    .map(([name, value]) => `${name}:${value};`)
    .join("");
  const dark = luminance(palette.colors.background) < 0.2;
  return `:root{${vars}--accent-fg:${readableOn(palette.colors.accent)};color-scheme:${dark ? "dark" : "light"};}`;
}

/** CSS custom properties for a palette, ready for a `style` prop. */
export function paletteVars(palette: ThemePalette): React.CSSProperties {
  const c = palette.colors;
  return {
    "--background": c.background,
    "--surface": c.surface,
    "--foreground": c.foreground,
    "--text-muted": c.textMuted,
    "--accent": c.accent,
    "--accent-dark": c.accentDark,
    "--border": c.border,
    "--warm-bg": c.warmBg,
  } as React.CSSProperties;
}

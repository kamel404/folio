/**
 * Preset portfolio palettes (tenant sites, not the Folio platform).
 * Each one maps 1:1 to the CSS variables injected on portfolio render.
 */

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

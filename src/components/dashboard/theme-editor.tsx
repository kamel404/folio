"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { saveTheme } from "@/app/(dashboard)/dashboard/theme/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { FormActions, FormError } from "@/components/dashboard/form-parts";
import { ThemePreview } from "@/components/dashboard/theme-preview";
import { useActionForm } from "@/components/dashboard/use-action-form";
import { DEFAULT_FONT, PORTFOLIO_FONTS } from "@/lib/themes/fonts";
import {
  COLOR_KEYS,
  contrastRatio,
  customOverrides,
  getPalette,
  isHexColor,
  palettes,
  resolvePalette,
  type ColorKey,
} from "@/lib/themes/palettes";
import { cn } from "@/lib/utils";
import type { PortfolioContent, ThemeConfig } from "@/types";

const COLOR_FIELDS: Record<ColorKey, { label: string; hint: string }> = {
  background: { label: "Page background", hint: "Behind everything" },
  surface: { label: "Cards", hint: "Project, skill and contact cards" },
  foreground: { label: "Text", hint: "Headings and body text" },
  textMuted: { label: "Secondary text", hint: "Descriptions, dates, captions" },
  accent: { label: "Accent", hint: "Dots, icons, rules, button hover" },
  accentDark: { label: "Accent text", hint: "Your headline, links, labels" },
  border: { label: "Lines", hint: "Borders and dividers" },
  warmBg: { label: "Tinted areas", hint: "Tags, image placeholders" },
};

/** Text/background pairs worth checking when colours are customised (WCAG AA: 4.5:1). */
const CONTRAST_CHECKS: { label: string; fg: ColorKey; bg: ColorKey }[] = [
  { label: "Text on the page", fg: "foreground", bg: "background" },
  { label: "Text on cards", fg: "foreground", bg: "surface" },
  { label: "Secondary text", fg: "textMuted", bg: "background" },
  { label: "Accent text", fg: "accentDark", bg: "background" },
];

const MIN_CONTRAST = 4.5;
const HEX_HINT = "Use a hex colour like #1F2937.";

interface Draft {
  paletteId: string;
  customize: boolean;
  colors: Record<ColorKey, string>;
  fontHeading: string;
  fontBody: string;
  showPhoto: boolean;
}

const knownFont = (name: string) => (PORTFOLIO_FONTS.some((f) => f.name === name) ? name : DEFAULT_FONT);

function draftFrom(theme: ThemeConfig): Draft {
  return {
    paletteId: getPalette(theme.palette_id).id,
    customize: Object.keys(customOverrides(theme.custom_colors)).length > 0,
    colors: { ...resolvePalette(theme).colors },
    fontHeading: knownFont(theme.font_heading),
    fontBody: knownFont(theme.font_body),
    showPhoto: theme.show_photo,
  };
}

/** The draft as a ThemeConfig, for the preview. Unfinished hex values fall back to the palette. */
function themeFrom(draft: Draft): ThemeConfig {
  return {
    palette_id: draft.paletteId,
    custom_colors: draft.customize
      ? Object.fromEntries(COLOR_KEYS.filter((k) => isHexColor(draft.colors[k])).map((k) => [k, draft.colors[k]]))
      : null,
    font_heading: draft.fontHeading,
    font_body: draft.fontBody,
    show_photo: draft.showPhoto,
  };
}

function Group({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-b border-[var(--border)] py-7 first:pt-0">
      <div>
        <legend className="text-base font-medium">{title}</legend>
        {description && <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>}
      </div>
      {children}
    </fieldset>
  );
}

interface ThemeEditorProps {
  content: PortfolioContent;
  address: string;
}

function ThemeEditor({ content, address }: ThemeEditorProps) {
  const [saved, setSaved] = useState(() => draftFrom(content.theme));
  const [draft, setDraft] = useState(saved);
  const { state, pending, fieldErrors: fe, formProps } = useActionForm(saveTheme, {
    onSuccess: () => setSaved(draft),
  });

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const theme = themeFrom(draft);
  const effective = resolvePalette(theme).colors;

  // Leaving with unsaved changes (reload, close tab) asks first
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const setColor = (key: ColorKey, value: string) => setDraft((d) => ({ ...d, colors: { ...d.colors, [key]: value } }));
  // A preset replaces any custom colours: customising starts again from it
  const choosePalette = (id: string) => update({ paletteId: id, colors: { ...getPalette(id).colors } });

  return (
    <form {...formProps} className="border-t border-[var(--foreground)]">
      <FormError error={state.error} className="mt-6" />

      <div className="grid gap-10 py-8 xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-6 xl:order-last xl:self-start">
          <ThemePreview content={content} theme={theme} address={address} />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Your real content, with the settings on this page. Visitors see it after you save.
          </p>
        </div>

        <div>
          <Group title="Palette" description="Five sets of colours that are known to work together.">
            <div className="grid grid-cols-2 gap-3">
              {palettes.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    "cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors duration-150 hover:border-[var(--foreground)]",
                    "has-[:checked]:border-[var(--foreground)] has-[:checked]:ring-1 has-[:checked]:ring-[var(--foreground)]",
                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)]"
                  )}
                >
                  <input
                    type="radio"
                    name="palette_id"
                    value={p.id}
                    checked={draft.paletteId === p.id}
                    onChange={() => choosePalette(p.id)}
                    className="sr-only"
                  />
                  <span aria-hidden className="flex h-8 overflow-hidden rounded-sm border border-[var(--border)]">
                    {[p.colors.background, p.colors.surface, p.colors.accent, p.colors.foreground].map((c, i) => (
                      <span key={i} className="flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-2 text-sm font-medium">
                    {p.name}
                    {draft.paletteId === p.id && <Check size={14} aria-hidden />}
                  </span>
                  <span className="block text-xs leading-snug text-[var(--text-tertiary)]">{p.note}</span>
                </label>
              ))}
            </div>
            {fe.palette_id && (
              <p role="alert" className="text-sm text-[var(--error)]">
                {fe.palette_id}
              </p>
            )}
          </Group>

          <Group title="Typefaces" description="One for headings, one for everything else. They can be the same.">
            <Select
              name="font_heading"
              label="Headings"
              value={draft.fontHeading}
              onChange={(e) => update({ fontHeading: e.target.value })}
              hint={PORTFOLIO_FONTS.find((f) => f.name === draft.fontHeading)?.note}
              error={fe.font_heading}
            >
              {PORTFOLIO_FONTS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </Select>
            <Select
              name="font_body"
              label="Body text"
              value={draft.fontBody}
              onChange={(e) => update({ fontBody: e.target.value })}
              hint={PORTFOLIO_FONTS.find((f) => f.name === draft.fontBody)?.note}
              error={fe.font_body}
            >
              {PORTFOLIO_FONTS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
            </Select>
          </Group>

          <Group title="Photo">
            <Checkbox
              name="show_photo"
              label="Show my photo"
              hint={
                content.profile.profile_image_url
                  ? "Shown next to your name at the top of the page."
                  : "You haven't added a photo yet. Add one under Profile."
              }
              checked={draft.showPhoto}
              onChange={(e) => update({ showPhoto: e.target.checked })}
            />
          </Group>

          <Group title="Custom colours" description="Start from the palette and change any colour.">
            <Checkbox
              name="customize"
              label="Customise colours"
              hint="Choosing another palette resets them to that palette."
              checked={draft.customize}
              onChange={(e) => update({ customize: e.target.checked })}
            />

            {draft.customize && (
              <>
                <ul className="flex flex-col border-t border-[var(--border)]">
                  {COLOR_KEYS.map((key) => {
                    const value = draft.colors[key];
                    const error = fe[`color_${key}`] ?? (isHexColor(value) ? undefined : HEX_HINT);
                    const inputId = `color-${key}`;
                    return (
                      <li key={key} className="border-b border-[var(--border)] py-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            aria-label={`${COLOR_FIELDS[key].label}: colour picker`}
                            value={effective[key].toLowerCase()}
                            onChange={(e) => setColor(key, e.target.value.toUpperCase())}
                            className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-transparent p-0.5"
                          />
                          <label htmlFor={inputId} className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">{COLOR_FIELDS[key].label}</span>
                            <span className="block truncate text-xs text-[var(--text-tertiary)]">{COLOR_FIELDS[key].hint}</span>
                          </label>
                          <input
                            id={inputId}
                            name={`color_${key}`}
                            value={value}
                            onChange={(e) => setColor(key, e.target.value.trim())}
                            spellCheck={false}
                            maxLength={7}
                            aria-invalid={!!error}
                            aria-describedby={error ? `${inputId}-error` : undefined}
                            className={cn(
                              "w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 font-mono text-sm uppercase",
                              "focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20",
                              error && "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20"
                            )}
                          />
                        </div>
                        {error && (
                          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-right text-sm text-[var(--error)]">
                            {error}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div aria-live="polite">
                  <p className="label-mono text-[var(--text-tertiary)]">Readability</p>
                  <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                    {CONTRAST_CHECKS.map((c) => {
                      const ratio = contrastRatio(effective[c.fg], effective[c.bg]);
                      const ok = ratio >= MIN_CONTRAST;
                      return (
                        <li key={c.label} className="flex items-center gap-2">
                          {ok ? (
                            <Check size={14} aria-hidden className="shrink-0 text-[var(--success)]" />
                          ) : (
                            <AlertTriangle size={14} aria-hidden className="shrink-0 text-[var(--warning)]" />
                          )}
                          <span className={ok ? "" : "text-[var(--warning)]"}>
                            {c.label}: {ratio.toFixed(1)}:1
                            {!ok && " (hard to read; aim for 4.5:1)"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
          </Group>
        </div>
      </div>

      <FormActions
        pending={pending}
        submitLabel="Save theme"
        secondary={
          dirty ? (
            <span className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
              Unsaved changes
              <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(saved)} disabled={pending}>
                Discard
              </Button>
            </span>
          ) : (
            <span className="text-sm text-[var(--text-tertiary)]">All changes saved</span>
          )
        }
      />
    </form>
  );
}

export { ThemeEditor };

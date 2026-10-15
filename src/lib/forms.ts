import { z } from "zod";

/**
 * The one result shape every form action returns (auth + dashboard).
 * Unexpected failures never throw out of an action: they come back as `error`
 * so the form can show them in place without losing what the user typed.
 */
export type FormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  /** Non-sensitive values to repopulate the form after an error */
  values?: Partial<Record<string, string>>;
  /** Set when the form finished without a redirect (shown as a toast in the dashboard) */
  success?: string;
  /** Where the client should navigate after a successful save */
  redirectTo?: string;
};

/** Result of a one-shot action (delete, toggle, reorder) that isn't a form. */
export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export const SESSION_EXPIRED = "Your session has expired. Sign in again to continue.";
export const SAVE_FAILED = "Something went wrong while saving. Please try again.";
export const NETWORK_FAILED = "Couldn't reach the server. Check your connection and try again.";

export const text = (fd: FormData, key: string) => String(fd.get(key) ?? "");
export const checked = (fd: FormData, key: string) => fd.get(key) === "on";

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/* ─── Reusable field rules ─── */

/** Required single-line text, trimmed. */
export const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}.`)
    .max(max, `Keep it under ${max} characters.`);

/** Optional text: empty string becomes null so the column is cleared. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters.`)
    .transform((v) => v || null);

/** Optional http(s) URL. "github.com/me" is accepted and saved as "https://github.com/me". */
export const optionalUrl = z
  .string()
  .trim()
  .max(500, "That link is too long.")
  .transform((v) => (v && !/^[a-z][a-z0-9+.-]*:/i.test(v) ? `https://${v}` : v))
  .refine((v) => {
    if (!v) return true;
    try {
      const url = new URL(v);
      return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".");
    } catch {
      return false;
    }
  }, "Enter a valid link, like https://example.com.")
  .transform((v) => v || null);

export const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email address.")
  .transform((v) => v || null);

/** Postgres error codes we turn into friendly messages. */
export const PG_UNIQUE_VIOLATION = "23505";

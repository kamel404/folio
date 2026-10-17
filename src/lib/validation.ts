import { z } from "zod";
import { AVAILABILITY_OPTIONS } from "@/lib/options";
import { MONTH, month, optionalEmail, optionalText, optionalUrl, requiredText } from "@/lib/forms";

/**
 * Validation for every piece of portfolio content, in one place. Used by the
 * dashboard forms (server actions), the CV / interview import (server action)
 * and the import review screen (in the browser), so imported content follows
 * exactly the same rules as content typed into the forms.
 */

/* ─── Profile ─── */

/** linkedin.com or any of its subdomains (not "evil-linkedin.com"). */
export const onHost = (host: string) => (v: string | null) => {
  if (!v) return true;
  try {
    const hostname = new URL(v).hostname;
    return hostname === host || hostname.endsWith(`.${host}`);
  } catch {
    return true; // malformed links are already reported by optionalUrl
  }
};

export const profileSchema = z.object({
  name: requiredText("your name", 80),
  title: requiredText("a headline", 100),
  short_bio: optionalText(200),
  long_bio: optionalText(5000),
  email: optionalEmail,
  phone: optionalText(40).refine(
    (v) => !v || /^[+\d\s().-]{5,}$/.test(v),
    "Use digits, spaces and + ( ) - only."
  ),
  location: optionalText(80),
  availability_status: z
    .enum(["", ...AVAILABILITY_OPTIONS.map((o) => o.value)], "Choose an option from the list.")
    .transform((v) => v || null),
  linkedin_url: optionalUrl.refine(onHost("linkedin.com"), "That doesn't look like a LinkedIn link."),
  github_url: optionalUrl.refine(onHost("github.com"), "That doesn't look like a GitHub link."),
  cv_url: optionalUrl,
});

/* ─── Experience ─── */

export const experienceSchema = z
  .object({
    company: requiredText("the company", 120),
    position: requiredText("your role", 120),
    description: requiredText("a description", 5000),
    start_date: month("start date"),
    current: z.boolean(),
    end_date: z.string().trim(),
  })
  .superRefine((v, ctx) => {
    if (v.current) return;
    const end = month("end date").safeParse(v.end_date);
    if (!end.success) {
      ctx.addIssue({ code: "custom", path: ["end_date"], message: end.error.issues[0].message });
    } else if (MONTH.test(v.start_date) && end.data < v.start_date) {
      // "YYYY-MM" strings compare correctly as text
      ctx.addIssue({ code: "custom", path: ["end_date"], message: "The end date can't be before the start date." });
    }
  })
  .transform((v) => ({ ...v, end_date: v.current ? null : v.end_date }));

/* ─── Projects ─── */

export const MAX_TECHNOLOGIES = 20;
export const PROJECT_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const projectSchema = z.object({
  title: requiredText("a title", 120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80, "Keep it under 80 characters.")
    .refine((v) => !v || PROJECT_SLUG.test(v), "Use lowercase letters, numbers and single hyphens."),
  short_description: requiredText("a short description", 200),
  description: optionalText(10000),
  category: requiredText("a category", 60),
  github_url: optionalUrl,
  live_url: optionalUrl,
  featured: z.boolean(),
  published: z.boolean(),
  technologies: z
    .string()
    .transform((v) => {
      // Comma-separated; trim, collapse spaces, drop case-insensitive duplicates
      const seen = new Set<string>();
      return v
        .split(",")
        .map((t) => t.trim().replace(/\s+/g, " "))
        .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
    })
    .refine((list) => list.length <= MAX_TECHNOLOGIES, `Add at most ${MAX_TECHNOLOGIES} technologies.`)
    .refine((list) => list.every((t) => t.length <= 40), "Each technology must be under 40 characters."),
});

/* ─── Skills ─── */

export const MAX_PER_ADD = 30;
const category = requiredText("a category", 60);

export const addSchema = z.object({
  names: z
    .string()
    .transform((v) => {
      const seen = new Set<string>();
      return v
        .split(",")
        .map((s) => s.trim().replace(/\s+/g, " "))
        .filter((s) => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
    })
    .refine((list) => list.length > 0, "Enter at least one skill.")
    .refine((list) => list.length <= MAX_PER_ADD, `Add at most ${MAX_PER_ADD} skills at once.`)
    .refine((list) => list.every((s) => s.length <= 60), "Each skill must be under 60 characters."),
  category,
});

export const updateSchema = z.object({
  name: requiredText("a skill", 60),
  category,
});

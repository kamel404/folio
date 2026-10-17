import type { GeminiSchema } from "@/lib/ai/gemini-client";
import { addSchema, experienceSchema, profileSchema, projectSchema } from "@/lib/validation";
import type { Profile } from "@/types";

/**
 * A "draft": portfolio content produced by the AI (from a CV or interview
 * answers) that the user reviews and edits before importing. Every value is a
 * string, exactly like a form field, so the draft is validated with the same
 * schemas as the dashboard forms (lib/validation.ts) — in the browser while
 * reviewing, and again on the server when importing.
 *
 * Client-safe: no server imports.
 */

export const DRAFT_PROFILE_FIELDS = [
  "name",
  "title",
  "short_bio",
  "long_bio",
  "location",
  "email",
  "phone",
  "linkedin_url",
  "github_url",
] as const;
export type DraftProfileField = (typeof DRAFT_PROFILE_FIELDS)[number];
export type DraftProfile = Record<DraftProfileField, string>;

export interface DraftExperience {
  key: string;
  include: boolean;
  company: string;
  position: string;
  description: string;
  /** "YYYY-MM" or "" when unknown */
  start_date: string;
  end_date: string;
  current: boolean;
}

export interface DraftProject {
  key: string;
  include: boolean;
  title: string;
  short_description: string;
  description: string;
  category: string;
  github_url: string;
  live_url: string;
  /** Comma-separated, like the project form */
  technologies: string;
}

export interface DraftSkill {
  key: string;
  include: boolean;
  name: string;
  category: string;
}

export interface PortfolioDraft {
  source: "cv" | "interview";
  profile: DraftProfile;
  experiences: DraftExperience[];
  projects: DraftProject[];
  skills: DraftSkill[];
}

export const DRAFT_LIMITS = { experiences: 20, projects: 20, skills: 80 } as const;

/* ─── What the model must return ─── */

const str = (description: string): GeminiSchema => ({ type: "STRING", description });

export const draftResponseSchema: GeminiSchema = {
  type: "OBJECT",
  properties: {
    profile: {
      type: "OBJECT",
      properties: {
        name: str("Full name. Empty string if unknown."),
        title: str("Professional headline, e.g. 'Senior Frontend Engineer'. Max 100 characters."),
        short_bio: str("One or two sentences, first person, max 200 characters."),
        long_bio: str("A longer 'about me' in first person: 1–3 short paragraphs separated by a blank line. Empty if there is nothing to say."),
        location: str("City and/or country. Empty if unknown."),
        email: str("Email address. Empty if unknown."),
        phone: str("Phone number. Empty if unknown."),
        linkedin_url: str("LinkedIn profile URL. Empty if unknown."),
        github_url: str("GitHub profile URL (not a repository). Empty if unknown."),
      },
      required: [...DRAFT_PROFILE_FIELDS],
      propertyOrdering: [...DRAFT_PROFILE_FIELDS],
    },
    experiences: {
      type: "ARRAY",
      description: "Jobs, internships and freelance roles, most recent first.",
      items: {
        type: "OBJECT",
        properties: {
          company: str("Company or client name."),
          position: str("Job title."),
          description: str("What they did: 2–5 short lines, each starting with '- '."),
          start_date: str("YYYY-MM. Use YYYY-01 when only the year is known. Empty if unknown."),
          end_date: str("YYYY-MM, or empty when current or unknown."),
          current: { type: "BOOLEAN", description: "True if this is their current role." },
        },
        required: ["company", "position", "description", "start_date", "end_date", "current"],
      },
    },
    projects: {
      type: "ARRAY",
      description: "Notable projects, most impressive first.",
      items: {
        type: "OBJECT",
        properties: {
          title: str("Project name."),
          short_description: str("One sentence, max 200 characters."),
          description: str("A longer write-up: what it is, their role, how it was built. Empty if there is nothing more."),
          category: str("e.g. Web Application, Mobile App, API / Backend, Library / Package, CLI Tool, Data / ML, Design, Open Source."),
          github_url: str("Repository URL. Empty if unknown."),
          live_url: str("Live site / app store URL. Empty if unknown."),
          technologies: { type: "ARRAY", items: { type: "STRING" }, description: "At most 10 technologies." },
        },
        required: ["title", "short_description", "description", "category", "github_url", "live_url", "technologies"],
      },
    },
    skills: {
      type: "ARRAY",
      description: "Skills grouped into a few categories (e.g. Languages, Frontend, Backend, Databases, DevOps & Cloud, Tools, Design).",
      items: {
        type: "OBJECT",
        properties: { name: str("One skill, e.g. 'TypeScript'."), category: str("Its category.") },
        required: ["name", "category"],
      },
    },
  },
  required: ["profile", "experiences", "projects", "skills"],
  propertyOrdering: ["profile", "experiences", "projects", "skills"],
};

/* ─── Turning model output into a draft ─── */

const s = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim().slice(0, max) : "";

/** "2021-3" → "2021-03", "2021" → "2021-01", anything else → "". */
function monthOrEmpty(v: unknown): string {
  const raw = s(v, 20);
  let m = /^(\d{4})-(\d{1,2})$/.exec(raw);
  if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12) return `${m[1]}-${m[2].padStart(2, "0")}`;
  m = /^(\d{4})$/.exec(raw);
  return m ? `${m[1]}-01` : "";
}

const list = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === "object") : [];

let keySeq = 0;
const newKey = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(keySeq++).toString(36)}`;

/**
 * Lenient conversion of whatever the model returned. Never throws: unknown
 * shapes become empty fields, which the review screen then flags.
 * Profile fields the model left empty keep the user's current value.
 */
export function toDraft(raw: unknown, source: PortfolioDraft["source"], current: Profile): PortfolioDraft {
  const root = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const p = (root.profile && typeof root.profile === "object" ? root.profile : {}) as Record<string, unknown>;

  const profile = Object.fromEntries(
    DRAFT_PROFILE_FIELDS.map((f) => [f, s(p[f], f === "long_bio" ? 5000 : 500) || (current[f] ?? "")])
  ) as DraftProfile;

  const experiences = list(root.experiences)
    .slice(0, DRAFT_LIMITS.experiences)
    .map((e) => {
      const current = e.current === true;
      return {
        key: newKey("exp"),
        include: true,
        company: s(e.company, 120),
        position: s(e.position, 120),
        description: s(e.description, 5000),
        start_date: monthOrEmpty(e.start_date),
        end_date: current ? "" : monthOrEmpty(e.end_date),
        current,
      };
    })
    .filter((e) => e.company || e.position);

  const projects = list(root.projects)
    .slice(0, DRAFT_LIMITS.projects)
    .map((pr) => {
      const seen = new Set<string>();
      const techs = (Array.isArray(pr.technologies) ? pr.technologies : [])
        .map((t) => s(t, 40).replace(/,/g, " ").replace(/\s+/g, " "))
        .filter((t) => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()))
        .slice(0, 20);
      return {
        key: newKey("proj"),
        include: true,
        title: s(pr.title, 120),
        short_description: s(pr.short_description, 200),
        description: s(pr.description, 10000),
        category: s(pr.category, 60) || "Web Application",
        github_url: s(pr.github_url, 500),
        live_url: s(pr.live_url, 500),
        technologies: techs.join(", "),
      };
    })
    .filter((pr) => pr.title);

  const seenSkills = new Set<string>();
  const skills = list(root.skills)
    .map((sk) => ({
      key: newKey("skill"),
      include: true,
      name: s(sk.name, 60).replace(/,/g, " ").replace(/\s+/g, " "),
      category: s(sk.category, 60) || "Skills",
    }))
    .filter((sk) => {
      const id = `${sk.category.toLowerCase()}|${sk.name.toLowerCase()}`;
      return sk.name && !seenSkills.has(id) && seenSkills.add(id);
    })
    .slice(0, DRAFT_LIMITS.skills);

  return { source, profile, experiences, projects, skills };
}

/* ─── Validation (same rules as the forms) ─── */

export type FieldErrors = Partial<Record<string, string>>;

function errorsOf(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  const out: FieldErrors = {};
  if (!result.success) for (const i of result.error!.issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
}

/** Profile import: only the fields a draft carries; the rest of the profile is left alone. */
export const draftProfileSchema = profileSchema.pick({
  name: true,
  title: true,
  short_bio: true,
  long_bio: true,
  location: true,
  email: true,
  phone: true,
  linkedin_url: true,
  github_url: true,
});

export const validateProfile = (p: DraftProfile) => errorsOf(draftProfileSchema.safeParse(p));

export const parseExperience = (e: DraftExperience) =>
  experienceSchema.safeParse({
    company: e.company,
    position: e.position,
    description: e.description,
    start_date: e.start_date,
    end_date: e.end_date,
    current: e.current,
  });
export const validateExperience = (e: DraftExperience) => errorsOf(parseExperience(e));

export const parseProject = (p: DraftProject) =>
  projectSchema.safeParse({
    title: p.title,
    slug: "",
    short_description: p.short_description,
    description: p.description,
    category: p.category,
    github_url: p.github_url,
    live_url: p.live_url,
    featured: false,
    published: true,
    technologies: p.technologies,
  });
export const validateProject = (p: DraftProject) => errorsOf(parseProject(p));

export const parseSkill = (sk: DraftSkill) => addSchema.safeParse({ names: sk.name, category: sk.category });
export const validateSkill = (sk: DraftSkill) => {
  const e = errorsOf(parseSkill(sk));
  // addSchema reports problems with the name under "names"
  return e.names ? { ...e, name: e.names } : e;
};

/** Number of included items (plus the profile) that still have errors. */
export function countDraftErrors(d: PortfolioDraft): number {
  let n = Object.keys(validateProfile(d.profile)).length > 0 ? 1 : 0;
  n += d.experiences.filter((e) => e.include && Object.keys(validateExperience(e)).length > 0).length;
  n += d.projects.filter((p) => p.include && Object.keys(validateProject(p)).length > 0).length;
  n += d.skills.filter((sk) => sk.include && Object.keys(validateSkill(sk)).length > 0).length;
  return n;
}

/** Light shape check for drafts read back from browser storage. */
export function isDraft(v: unknown): v is PortfolioDraft {
  const d = v as PortfolioDraft;
  return (
    !!d &&
    (d.source === "cv" || d.source === "interview") &&
    !!d.profile &&
    typeof d.profile === "object" &&
    Array.isArray(d.experiences) &&
    Array.isArray(d.projects) &&
    Array.isArray(d.skills)
  );
}

"use server";

import { z } from "zod";
import { getActionTenant } from "@/lib/data/dashboard";
import { importDraft, type ImportSummary } from "@/lib/data/import";
import { revalidateTenant } from "@/lib/data/mutations";
import { AiError } from "@/lib/ai/gemini-client";
import { MAX_CV_BYTES, cleanCvText, extractCvText, sniffCv } from "@/lib/ai/cv-parser";
import { draftFromCv, draftFromInterview, rewrite, REWRITE_FIELDS, type RewriteField } from "@/lib/ai/content-generator";
import { INTERVIEW_QUESTIONS, interviewProblem } from "@/lib/ai/interview";
import { checkAiAllowance, getAiAllowance, recordAiUsage, type AiAllowance } from "@/lib/ai/usage";
import { isDraft, type PortfolioDraft } from "@/lib/ai/draft";
import { PROFILE_COLUMNS } from "@/lib/data/columns";
import { SESSION_EXPIRED } from "@/lib/forms";
import type { Profile } from "@/types";

/**
 * AI import (CV / interview → draft → import) and AI rewrites. Shared by
 * onboarding and /dashboard/import. Every action re-checks the session and
 * the plan's allowance; usage is recorded only after a successful AI call.
 */

export type DraftResult =
  | { ok: true; draft: PortfolioDraft; allowance: AiAllowance }
  | { ok: false; error: string; field?: "cv" };

const MIN_CV_TEXT = 200;
const GENERIC_AI_ERROR = "Something went wrong while reading that. Nothing was used up. Please try again.";

async function currentProfile(ctx: NonNullable<Awaited<ReturnType<typeof getActionTenant>>>): Promise<Profile | null> {
  const { data, error } = await ctx.supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("tenant_id", ctx.tenant.id)
    .maybeSingle<Profile>();
  if (error) console.error("[import] profile", error);
  return data;
}

function aiFailure(error: unknown): { ok: false; error: string } {
  if (error instanceof AiError) return { ok: false, error: `${error.message} Nothing was used up.` };
  console.error("[import] unexpected", error);
  return { ok: false, error: GENERIC_AI_ERROR };
}

/** CV file (PDF / DOCX / TXT) or pasted text → draft. */
export async function draftFromCvAction(formData: FormData): Promise<DraftResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };

  const file = formData.get("cv");
  const pasted = typeof formData.get("cv_text") === "string" ? String(formData.get("cv_text")) : "";

  let text = "";
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_CV_BYTES) return { ok: false, field: "cv", error: "That file is over 4 MB. Try a smaller PDF, or paste the text instead." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffCv(bytes, file.name);
    if (!kind) return { ok: false, field: "cv", error: "Use a PDF or Word (.docx) file, or paste the text instead." };
    try {
      text = await extractCvText(bytes, kind);
    } catch (error) {
      console.error("[draftFromCv] extract", error);
      return { ok: false, field: "cv", error: "We couldn't open that file. It may be damaged or password-protected. Try another file, or paste the text." };
    }
  } else if (pasted.trim()) {
    text = cleanCvText(pasted);
  } else {
    return { ok: false, field: "cv", error: "Choose your CV file, or paste its text." };
  }

  if (text.length < MIN_CV_TEXT) {
    return {
      ok: false,
      field: "cv",
      error: "We couldn't find much text in that. If it's a scanned PDF (a picture of a page), paste the text instead.",
    };
  }

  const blocked = await checkAiAllowance(ctx.tenant, "cv_parse");
  if (blocked) return { ok: false, error: blocked };
  const profile = await currentProfile(ctx);
  if (!profile) return { ok: false, error: GENERIC_AI_ERROR };

  try {
    const { draft, usage } = await draftFromCv(text, profile);
    await recordAiUsage(ctx.tenant.id, "cv_parse", usage);
    return { ok: true, draft, allowance: await getAiAllowance(ctx.tenant) };
  } catch (error) {
    return aiFailure(error);
  }
}

const answersSchema = z.partialRecord(z.enum(INTERVIEW_QUESTIONS.map((q) => q.id) as [string, ...string[]]), z.string().max(5000));

/** Interview answers → draft. */
export async function draftFromInterviewAction(answers: unknown): Promise<DraftResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };

  const parsed = answersSchema.safeParse(answers);
  if (!parsed.success) return { ok: false, error: "Those answers couldn't be read. Refresh the page and try again." };
  const problem = interviewProblem(parsed.data);
  if (problem) return { ok: false, error: problem };

  const blocked = await checkAiAllowance(ctx.tenant, "generate");
  if (blocked) return { ok: false, error: blocked };
  const profile = await currentProfile(ctx);
  if (!profile) return { ok: false, error: GENERIC_AI_ERROR };

  try {
    const { draft, usage } = await draftFromInterview(parsed.data, profile);
    await recordAiUsage(ctx.tenant.id, "generate", usage);
    return { ok: true, draft, allowance: await getAiAllowance(ctx.tenant) };
  } catch (error) {
    return aiFailure(error);
  }
}

export type ImportResult = { ok: true; summary: ImportSummary } | { ok: false; error: string; summary?: ImportSummary };

/** Save the reviewed draft. Doesn't use AI, so it never touches the allowance. */
export async function importDraftAction(draft: unknown): Promise<ImportResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };
  if (!isDraft(draft)) return { ok: false, error: "That import couldn't be read. Refresh the page and try again." };

  const result = await importDraft(ctx.supabase, ctx.tenant.id, draft);
  if (result.summary.profile || result.summary.experiences || result.summary.projects || result.summary.skills) {
    revalidateTenant(ctx.tenant.slug);
  }
  return result;
}

export type RewriteResult = { ok: true; text: string; allowance: AiAllowance } | { ok: false; error: string };

/** One field's text → a clearer version. The user accepts or discards it; nothing is saved here. */
export async function rewriteAction(field: unknown, text: unknown): Promise<RewriteResult> {
  const ctx = await getActionTenant();
  if (!ctx) return { ok: false, error: SESSION_EXPIRED };

  if (typeof field !== "string" || !(field in REWRITE_FIELDS)) return { ok: false, error: "That field can't be rewritten." };
  const f = REWRITE_FIELDS[field as RewriteField];
  const input = typeof text === "string" ? text.trim() : "";
  if (input.length < 20) return { ok: false, error: "Write a sentence or two first, then the AI can improve it." };
  if (input.length > f.max) return { ok: false, error: `Shorten it to ${f.max} characters first.` };

  const blocked = await checkAiAllowance(ctx.tenant, "rewrite");
  if (blocked) return { ok: false, error: blocked };
  const profile = await currentProfile(ctx);

  try {
    const result = await rewrite(field as RewriteField, input, {
      name: profile?.name ?? ctx.name,
      title: profile?.title ?? "",
    });
    await recordAiUsage(ctx.tenant.id, "rewrite", result.usage);
    return { ok: true, text: result.text, allowance: await getAiAllowance(ctx.tenant) };
  } catch (error) {
    return aiFailure(error);
  }
}

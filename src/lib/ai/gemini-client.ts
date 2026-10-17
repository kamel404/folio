/**
 * Minimal Gemini client (REST, no SDK). Server-only: reads GEMINI_API_KEY.
 * Every call asks for JSON shaped by a response schema, and the caller
 * re-validates it with zod, so a model that drifts can't put junk in the DB.
 */

const API = "https://generativelanguage.googleapis.com/v1beta/models";
/**
 * Pinned, not an alias ("-latest" moves under us). Measured 2026-10-17: ~3–7 s
 * for a CV-sized request; gemini-3.8-flash took ~60 s and the -latest alias
 * returned 503s. Override either with an env var, no code change needed.
 */
const DEFAULT_MODEL = "gemini-3.5-flash";
/** Used once when the main model is overloaded (429 / 503) or times out. */
const DEFAULT_FALLBACK_MODEL = "gemini-3.5-flash-lite";
const TIMEOUT_MS = 45_000;

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Thrown for anything the user should see as "the AI couldn't do it, nothing was used up". */
export class AiError extends Error {
  constructor(
    message: string,
    /** "unavailable" = our side / Google's side; "blocked" = the content was refused */
    readonly kind: "unavailable" | "blocked" = "unavailable"
  ) {
    super(message);
    this.name = "AiError";
  }
}

/** OpenAPI-subset schema the Gemini API accepts as responseSchema. */
export type GeminiSchema =
  | { type: "STRING"; description?: string; nullable?: boolean; enum?: string[] }
  | { type: "BOOLEAN"; description?: string; nullable?: boolean }
  | { type: "ARRAY"; description?: string; items: GeminiSchema }
  | {
      type: "OBJECT";
      description?: string;
      properties: Record<string, GeminiSchema>;
      required?: string[];
      propertyOrdering?: string[];
    };

export interface AiUsage {
  tokensIn: number;
  tokensOut: number;
}

interface GenerateOptions {
  system: string;
  prompt: string;
  schema: GeminiSchema;
  temperature?: number;
}

type Attempt = { ok: true; response: Response } | { ok: false; retryable: boolean; message: string };

async function attempt(model: string, key: string, body: string): Promise<Attempt> {
  try {
    const response = await fetch(`${API}/${model}:generateContent`, {
      method: "POST",
      // Key in a header, never in the URL (URLs end up in logs)
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (response.ok) return { ok: true, response };
    console.error(`[gemini] ${model} HTTP`, response.status, (await response.text()).slice(0, 500));
    const busy = response.status === 429 || response.status === 503;
    return {
      ok: false,
      retryable: busy,
      message: busy
        ? "The AI service is busy right now. Please try again in a minute."
        : "The AI service had a problem. Please try again.",
    };
  } catch (error) {
    console.error(`[gemini] ${model} request failed`, error);
    return { ok: false, retryable: true, message: "The AI service didn't respond. Please try again." };
  }
}

export async function generateJson({ system, prompt, schema, temperature = 0.2 }: GenerateOptions): Promise<{
  data: unknown;
  usage: AiUsage;
}> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("AI isn't set up on this server yet.");
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const fallback = process.env.GEMINI_FALLBACK_MODEL || DEFAULT_FALLBACK_MODEL;

  const request = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      // Extraction and light editing don't need long hidden reasoning (billed as output)
      thinkingConfig: { thinkingLevel: "low" },
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  let result = await attempt(model, key, request);
  if (!result.ok && result.retryable && fallback !== model) result = await attempt(fallback, key, request);
  if (!result.ok) throw new AiError(result.message);

  const body = await result.response.json();
  const candidate = body.candidates?.[0];
  const text: string | undefined = candidate?.content?.parts
    ?.filter((p: { thought?: boolean }) => !p.thought)
    .map((p: { text?: string }) => p.text ?? "")
    .join("");
  if (body.promptFeedback?.blockReason || candidate?.finishReason === "SAFETY") {
    throw new AiError("The AI couldn't work with that text. Try rephrasing it.", "blocked");
  }
  if (!text) {
    console.error("[gemini] empty response", JSON.stringify(body).slice(0, 500));
    throw new AiError("The AI returned nothing. Please try again.");
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("[gemini] invalid JSON", text.slice(0, 500));
    throw new AiError("The AI returned something unreadable. Please try again.");
  }

  return {
    data,
    usage: {
      tokensIn: body.usageMetadata?.promptTokenCount ?? 0,
      // Hidden reasoning is billed as output
      tokensOut: (body.usageMetadata?.candidatesTokenCount ?? 0) + (body.usageMetadata?.thoughtsTokenCount ?? 0),
    },
  };
}

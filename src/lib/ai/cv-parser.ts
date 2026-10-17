import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

/**
 * Turns an uploaded CV into plain text for the AI. Migrated from
 * kamelportfolio's lib/cv-parser.ts; the rule-based regex fallback was
 * dropped — when the AI is unavailable the user is told to try again, rather
 * than given a low-quality guess they then have to clean up.
 */

export const MAX_CV_BYTES = 4 * 1024 * 1024; // the Server Action body limit is 5 MB
/** Enough for a long CV; keeps prompts (and cost) bounded. */
export const MAX_CV_CHARS = 30_000;

export type CvKind = "pdf" | "docx" | "text";

/** Identify the file from its first bytes; the browser's MIME type and name can't be trusted. */
export function sniffCv(bytes: Uint8Array, fileName: string): CvKind | null {
  const ascii = String.fromCharCode(...bytes.slice(0, 5));
  if (ascii === "%PDF-") return "pdf";
  // DOCX is a ZIP container ("PK\x03\x04"); other ZIPs fail in mammoth and are reported then
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) return "docx";
  if (/\.(txt|md)$/i.test(fileName) && !bytes.slice(0, 4096).includes(0)) return "text";
  return null;
}

export async function extractCvText(bytes: Uint8Array, kind: CvKind): Promise<string> {
  let text: string;
  if (kind === "pdf") {
    const pdf = await getDocumentProxy(bytes);
    const result = await extractText(pdf, { mergePages: true });
    text = result.text;
  } else if (kind === "docx") {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    text = result.value;
  } else {
    text = new TextDecoder().decode(bytes);
  }
  return cleanCvText(text);
}

/** Collapse whitespace noise from PDF extraction and cap the length. */
export function cleanCvText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_CV_CHARS);
}

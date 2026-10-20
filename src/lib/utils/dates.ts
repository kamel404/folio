const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2023-09" → "Sep 2023". Anything unexpected is returned as-is (e.g. CV-imported free text). */
export function formatMonth(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value;
}

/** "Sep 2023 – Present" */
export function formatRange(start: string, end: string | null, current: boolean): string {
  return `${formatMonth(start)} – ${current || !end ? "Present" : formatMonth(end)}`;
}

/** ISO timestamp → "18 Oct 2026" (UTC, so server and browser agree). */
export function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

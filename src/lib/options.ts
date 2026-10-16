import type { AvailabilityStatus } from "@/types";

/** Shared by the profile form, its validation and the portfolio's availability badge. */
export const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: "open", label: "Open to work" },
  { value: "selective", label: "Open to the right opportunity" },
  { value: "unavailable", label: "Not looking right now" },
];

export function availabilityLabel(status: AvailabilityStatus | null): string | null {
  return AVAILABILITY_OPTIONS.find((o) => o.value === status)?.label ?? null;
}

/** Suggestions only; any category text is accepted. */
export const PROJECT_CATEGORY_SUGGESTIONS = [
  "Web Application",
  "Mobile App",
  "Desktop App",
  "API / Backend",
  "Library / Package",
  "CLI Tool",
  "Data / ML",
  "Design",
  "Open Source",
];

export const SKILL_CATEGORY_SUGGESTIONS = [
  "Languages",
  "Frontend",
  "Backend",
  "Databases",
  "DevOps & Cloud",
  "Tools",
  "Design",
  "Soft skills",
];

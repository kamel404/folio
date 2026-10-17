/**
 * The guided interview: plain questions, one at a time. The answers go to the
 * AI together (content-generator.ts → fromInterview). Client-safe.
 */

export interface InterviewQuestion {
  id: string;
  question: string;
  hint: string;
  placeholder: string;
  optional: boolean;
  /** Single line instead of a textarea */
  short?: boolean;
  max: number;
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "title",
    question: "What do you do?",
    hint: "Your job title, or how you'd introduce yourself professionally.",
    placeholder: "Frontend engineer",
    optional: false,
    short: true,
    max: 100,
  },
  {
    id: "summary",
    question: "Describe what you do in a sentence or two.",
    hint: "What you build, for whom, and what you care about.",
    placeholder: "I build fast, accessible web apps for small businesses…",
    optional: false,
    max: 600,
  },
  {
    id: "background",
    question: "How did you get here?",
    hint: "Your background, studies or career path. A few sentences is plenty.",
    placeholder: "I studied computer science in Beirut, then…",
    optional: true,
    max: 1500,
  },
  {
    id: "experience",
    question: "Where have you worked?",
    hint: "For each role: company, job title, dates (month and year) and what you did.",
    placeholder: "Acme, Senior Engineer, Mar 2022 – now: led the checkout rewrite…\nInitech, Engineer, 2019 – Feb 2022: …",
    optional: true,
    max: 4000,
  },
  {
    id: "projects",
    question: "What are your best projects?",
    hint: "Up to five: what each one does, what you used to build it, and any links.",
    placeholder: "Souk POS: offline-first point of sale (React, IndexedDB), souk.example.com…",
    optional: true,
    max: 4000,
  },
  {
    id: "skills",
    question: "What are you best at?",
    hint: "Languages, frameworks, tools, or anything else you'd want listed.",
    placeholder: "TypeScript, React, Node.js, PostgreSQL, Figma…",
    optional: true,
    max: 1500,
  },
  {
    id: "next",
    question: "What are you looking for next?",
    hint: "The kind of work, team or projects you want. Leave it empty if you'd rather not say.",
    placeholder: "A product team working on developer tools…",
    optional: true,
    max: 800,
  },
  {
    id: "location",
    question: "Where are you based?",
    hint: "City and country, and whether you work remotely.",
    placeholder: "Lisbon, Portugal · Remote",
    optional: true,
    short: true,
    max: 80,
  },
  {
    id: "links",
    question: "Where can people find you online?",
    hint: "GitHub, LinkedIn, or any other profile.",
    placeholder: "github.com/lina · linkedin.com/in/lina",
    optional: true,
    max: 500,
  },
];

/** Unanswered (skipped) questions are simply missing. */
export type InterviewAnswers = Partial<Record<string, string>>;

/** At least the required answers, plus one of experience / projects / skills to work from. */
export function interviewProblem(answers: InterviewAnswers): string | null {
  for (const q of INTERVIEW_QUESTIONS) {
    const a = (answers[q.id] ?? "").trim();
    if (!q.optional && !a) return `Answer “${q.question}” first.`;
    if (a.length > q.max) return `Keep “${q.question}” under ${q.max} characters.`;
  }
  if (!["experience", "projects", "skills"].some((id) => (answers[id] ?? "").trim())) {
    return "Tell us about at least your work, your projects or your skills.";
  }
  return null;
}

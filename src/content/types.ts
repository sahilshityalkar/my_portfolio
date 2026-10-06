/**
 * Content model. Every string the site shows lives in /src/content.
 *
 * A `Draft` is a value that has not been written yet. It renders in a quiet,
 * deliberate "in preparation" style instead of looking broken, and every Draft
 * is listed in PLACEHOLDERS.md so nothing ships unnoticed.
 */
export type Draft = { draft: true; hint: string };

export type Text = string | Draft;

export const draft = (hint: string): Draft => ({ draft: true, hint });

export const isDraft = (v: unknown): v is Draft =>
  typeof v === "object" && v !== null && (v as Draft).draft === true;

export type Link = { label: string; href: string | null };

export type Role = {
  company: string;
  title: string;
  start: Text;
  end: Text;
  summary: Text;
  notes: Text[];
};

export type CaseStudy = {
  slug: string;
  index: string;
  title: Text;
  kicker: Text;
  year: Text;
  role: Text;
  stack: Text;
  summary: Text;
  /** Case-study body. Each section renders with the same editorial template. */
  sections: { heading: string; body: Text }[];
  links: Link[];
  /** Optional real imagery (put the file in /public). Without it, a drafting plate is drawn. */
  image?: { src: string; alt: string };
};

export type Education = { school: string; degree: string; years: string };

export type Experiment = {
  slug: string;
  index: string;
  title: string;
  summary: string;
  status: "live" | "draft";
  tech: string;
};

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

/**
 * Demo copy: realistic, replaceable text that completes the design while real
 * facts are pending. Renders like normal text; `grep -rn "demo(" src/content`
 * lists every instance (see PLACEHOLDERS.md).
 */
export const demo = (text: string): string => text;

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
  /** A real screenshot of the shipped product (file in /public), shown on the case page. */
  image?: { src: string; alt: string; url?: string };
  /** The technical drawing that represents this project on the index and the case page. */
  plate?: "replies" | "mastery" | "heatmap";
};

export type Education = { school: string; degree: string; years: string };

/** A featured experiment. It lives on the lab site at `${labUrl}/${slug}`. */
export type Experiment = {
  slug: string;
  index: string;
  title: string;
  summary: string;
  tech: string;
  /** Which drawing to show on the card (a still sketch of the experiment). */
  preview: "glass" | "spring" | "blueprint";
};

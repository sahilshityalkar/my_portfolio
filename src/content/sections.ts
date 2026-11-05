import { labLive } from "./lab";

const all = [
  { id: "intro", label: "Intro" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "writing", label: "Writing" },
  { id: "lab", label: "Lab" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof all)[number]["id"];

/**
 * The home page's sections, in order: their anchors, sheet numbers and names.
 * The header nav, the ruler and each section head read them from here. The
 * lab appears once its site is live (content/lab.ts): until then its one
 * entry would only repeat the hero, and the numbers close up around it.
 */
export const sections = all
  .filter((s) => s.id !== "lab" || labLive)
  .map((s, i) => ({ ...s, n: String(i + 1).padStart(2, "0") }));

/** Whether a section is on the page, e.g. shown("lab") === labLive. */
export const shown = (id: SectionId) => sections.some((s) => s.id === id);

/** A section's sheet number, e.g. sheet("work") === "02". */
export const sheet = (id: SectionId) => sections.find((s) => s.id === id)?.n ?? "";

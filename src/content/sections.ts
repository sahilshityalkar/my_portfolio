/**
 * The home page's sections, in order: their anchors, sheet numbers and names.
 * The header nav, the ruler and each section head read them from here.
 */
export const sections = [
  { id: "intro", n: "01", label: "Intro" },
  { id: "work", n: "02", label: "Work" },
  { id: "experience", n: "03", label: "Experience" },
  { id: "about", n: "04", label: "About" },
  { id: "lab", n: "05", label: "Lab" },
  { id: "contact", n: "06", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

/** A section's sheet number, e.g. sheet("work") === "02". */
export const sheet = (id: SectionId) => sections.find((s) => s.id === id)!.n;

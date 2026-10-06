import { draft, type Text } from "./types";

/**
 * The single source of truth about the person this site is for.
 * Replace every `draft(...)` with real text; see PLACEHOLDERS.md.
 */
export const profile = {
  /** Inferred from the GitHub handle `sahilshityalkar`. Confirm spelling. */
  name: "Sahil Shityalkar",
  shortName: "Sahil",
  role: "Frontend Lead Engineer",
  company: "Clyra",
  companyUrl: null as string | null,
  experience: "2 years",
  /** One honest sentence. Shown in the hero and used as the meta description. */
  statement:
    "Frontend Lead Engineer at Clyra. I own how the product is built and how it feels — component architecture, interface quality and the decisions in between.",
  location: draft("City, Country — or “Remote”") as Text,
  availability: draft("e.g. “Open to senior frontend roles” — or remove") as Text,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
};

export const links = {
  email: null as string | null, // e.g. "you@domain.com"
  resume: null as string | null, // e.g. "/resume.pdf" (put the file in /public)
  github: "https://github.com/sahilshityalkar" as string | null,
  linkedin: "https://www.linkedin.com/in/sahilshityalkar/" as string | null,
  x: "https://x.com/SK_sahil05" as string | null,
};

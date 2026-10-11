import { demo, type Text } from "./types";

/**
 * The single source of truth about the person this site is for.
 * `demo(...)` marks replaceable copy; see PLACEHOLDERS.md.
 */
export const profile = {
  /** As written on the résumé published in the GitHub repo Personal-Portfolio-Website. */
  name: "Sahil Shityalkar",
  shortName: "Sahil",
  role: "Frontend Lead Engineer",
  company: "Clyra",
  companyUrl: "https://heyclyra.com" as string | null,
  experience: "2 years",
  /** One honest sentence. Shown in the hero and used as the meta description. */
  statement:
    "I build interfaces end to end: the architecture underneath, the motion on top, and the small decisions that make software feel trustworthy.",
  location: "Mumbai, India" as Text,
  /** The fourth line under the role in the hero: what you work on, in nouns. */
  focus: demo("React, TypeScript, design systems, data-dense product UI") as Text,
  availability: demo(
    "Open to conversations about senior frontend and frontend lead roles. Replies within two working days.",
  ) as Text,
  /** Shown in the hero eyebrow as a freshness signal. Bump it on every content change. */
  updated: "October 2026",
  /** The canonical domain. NEXT_PUBLIC_SITE_URL overrides it (e.g. for a staging copy). */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sahilshityalkar.com",
};

export const links = {
  email: "sahilshityalkar05@gmail.com" as string | null, // published on the GitHub profile README
  resume: null as string | null, // e.g. "/resume.pdf" (put the file in /public); hidden while null
  github: "https://github.com/sahilshityalkar" as string | null,
  linkedin: "https://www.linkedin.com/in/sahilshityalkar/" as string | null,
  x: "https://x.com/SK_sahil05" as string | null,
  /** Set it to the GitHub repo URL if this site's repo is made public; the footer title block then links it. */
  source: null as string | null,
};

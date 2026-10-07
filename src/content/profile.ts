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
    "I own how Clyra’s AI school platform is built and how it feels: component architecture, interface quality, and every decision in between.",
  location: "Mumbai, India" as Text,
  availability: demo("Currently leading frontend at Clyra. Always happy to talk about interfaces.") as Text,
  /** The canonical domain. NEXT_PUBLIC_SITE_URL overrides it (e.g. for a staging copy). */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sahilshityalkar.com",
};

export const links = {
  email: "sahilshityalkar05@gmail.com" as string | null, // published on the GitHub profile README
  resume: null as string | null, // e.g. "/resume.pdf" (put the file in /public); hidden while null
  github: "https://github.com/sahilshityalkar" as string | null,
  linkedin: "https://www.linkedin.com/in/sahilshityalkar/" as string | null,
  x: "https://x.com/SK_sahil05" as string | null,
};

import { draft, type CaseStudy } from "./types";

const template = (): CaseStudy["sections"] => [
  { heading: "Context", body: draft("What the product is, who uses it, and where this work sat in it.") },
  { heading: "My role", body: draft("What you owned. Be specific about what was yours and what was the team’s.") },
  { heading: "The problem", body: draft("The constraint or failure that made this worth doing.") },
  { heading: "Decisions", body: draft("Two or three engineering or design decisions, the options you rejected, and why.") },
  { heading: "Outcome", body: draft("What changed. Real numbers only — or describe the qualitative result honestly.") },
  { heading: "In hindsight", body: draft("What you would do differently. This is where seniority shows.") },
];

export const work: CaseStudy[] = [
  {
    slug: "case-one",
    index: "I",
    title: draft("Project title"),
    kicker: draft("One-line description of the work"),
    year: draft("Year"),
    role: draft("Your role"),
    stack: draft("Key technologies"),
    summary: draft("Two sentences: the problem and what you did about it."),
    sections: template(),
    links: [],
  },
  {
    slug: "case-two",
    index: "II",
    title: draft("Project title"),
    kicker: draft("One-line description of the work"),
    year: draft("Year"),
    role: draft("Your role"),
    stack: draft("Key technologies"),
    summary: draft("Two sentences: the problem and what you did about it."),
    sections: template(),
    links: [],
  },
  {
    slug: "case-three",
    index: "III",
    title: draft("Project title"),
    kicker: draft("One-line description of the work"),
    year: draft("Year"),
    role: draft("Your role"),
    stack: draft("Key technologies"),
    summary: draft("Two sentences: the problem and what you did about it."),
    sections: template(),
    links: [],
  },
];

export const getCase = (slug: string) => work.find((c) => c.slug === slug);

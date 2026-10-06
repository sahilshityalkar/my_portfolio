import { draft, type Education, type Role } from "./types";

export const experience: Role[] = [
  {
    company: "Clyra",
    title: "Frontend Lead Engineer",
    start: draft("Start month & year"),
    end: "Present",
    summary:
      "Leading the frontend: the architecture the product is built on, the quality bar of the interface, and the trade-offs between shipping fast and shipping well.",
    notes: [
      draft("A system you designed or own — e.g. the component library, data layer or design-token pipeline"),
      draft("A hard engineering decision and its outcome — measured if you can"),
      draft("How you raise the bar for the team — reviews, standards, mentoring"),
    ],
  },
];

/** From the résumé published in github.com/sahilshityalkar/Personal-Portfolio-Website. */
export const education: Education[] = [
  {
    school: "Ramanand Arya D.A.V. College, Mumbai",
    degree: "B.Sc. Information Technology",
    years: "2021 — 2024",
  },
];

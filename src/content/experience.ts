import { demo, type Education, type Role } from "./types";

export const experience: Role[] = [
  {
    company: "Clyra",
    title: "Frontend Lead Engineer",
    start: "Jan 2025",
    end: "Present",
    summary: demo(
      "Leading the frontend of Clyra, the AI school operating system: the student learning experience and the tools schools run on, from architecture to the last pixel.",
    ),
    notes: [
      demo(
        "Own the frontend architecture across both sides of the product: the student app (mastery map, adaptive quizzes, weekly study plans) and the institution workspace for grading and cohort insight.",
      ),
      demo(
        "Built the real-time progress dashboards and cohort heatmaps: data-dense views that stay fast and legible as classes, concepts and submissions grow.",
      ),
      demo(
        "Set the team’s frontend standards (a shared component library, design tokens and review practice) so new features ship consistent, accessible and fast by default.",
      ),
    ],
  },
];

/** From the résumé published in github.com/sahilshityalkar/Personal-Portfolio-Website. */
export const education: Education[] = [
  {
    school: "Ramanand Arya D.A.V. College, Mumbai",
    degree: "B.Sc. Information Technology",
    years: "2021 to 2024",
  },
];

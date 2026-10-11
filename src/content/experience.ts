import { demo, type Education, type Role } from "./types";

export const experience: Role[] = [
  {
    company: "Clyra",
    title: "Frontend Lead Engineer",
    start: "Jan 2025",
    end: "Present",
    location: "Mumbai",
    summary: demo(
      "Leading the frontend of Clyra, the AI school operating system, since January 2025, when the product was still early.",
    ),
    notes: [
      demo("Own the frontend architecture for both products: the student app and the institution workspace."),
      demo("Built the progress dashboards and cohort heatmaps that schools use to spot students who need help."),
      demo("Set the shared component library, design tokens and code review practice the frontend team works from."),
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

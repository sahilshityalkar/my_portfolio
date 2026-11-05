import { demo, type Text } from "./types";

export type Capability = {
  title: string;
  body: Text;
  /** The evidence a reviewer can check: a project, a measured result, this site. */
  proof: string;
  href?: string;
  /** On paper, when the proof points at something only the screen has. */
  printProof?: string;
};

/**
 * The About section is written for the people deciding whether to talk to you:
 * what level you work at, what you are good at, and the proof for each claim.
 */
export const about: {
  paragraphs: Text[];
  capabilities: Capability[];
  toolkit: { group: string; items: string[] }[];
} = {
  paragraphs: [
    demo(
      "The part of an interface I care about most is the part nobody screenshots: the loading state that doesn’t jump, the keyboard path that works, the number that is measured instead of claimed. This page shows its own construction for that reason.",
    ),
    demo(
      "I started in full-stack JavaScript, first MERN and then Next.js, so I’m at home below the interface too: APIs, databases, auth. I still build products end to end, like ReplyAI, to keep that range sharp.",
    ),
  ],

  capabilities: [
    {
      title: "Frontend architecture",
      body: demo("Component systems, design tokens and the data layer underneath them. App Router, Server Components and TypeScript, end to end."),
      proof: "ReplyAI: App Router, API routes, schema and migrations",
      href: "/work/replyai",
    },
    {
      title: "Interface quality",
      body: "Accessible, responsive and fast by default: semantic HTML, full keyboard support, reduced-motion care and performance budgets.",
      proof: "Measured in the footer of this page",
      href: "#contact",
      printProof: "Measured live in every visitor's browser at sahilshityalkar.com",
    },
    {
      title: "Full-stack product work",
      body: "Auth, Postgres, webhooks and automated tests when the product needs them, not just the screens.",
      proof: "The note: a data-loss bug 22 passing tests missed",
      href: "/writing/a-green-build-is-not-a-working-product",
      printProof: "Written up at sahilshityalkar.com/writing",
    },
  ],

  /** Plain text on purpose: scannable by people and by applicant-tracking systems. */
  toolkit: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "HTML", "CSS", "SQL"] },
    { group: "Frontend", items: ["React", "Next.js", "Redux", "Tailwind CSS", "shadcn/ui", "Material UI", "Canvas & WebGL"] },
    { group: "Backend & data", items: ["Node.js", "Express", "PostgreSQL", "Supabase", "MongoDB", "REST", "WebSockets"] },
    { group: "Quality & delivery", items: ["Vitest", "Git", "Vercel", "Sentry", "Accessibility", "Core Web Vitals"] },
  ],
};

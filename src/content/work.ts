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
    slug: "replyai",
    index: "I",
    title: "ReplyAI",
    kicker: "A workspace for answering customer complaints: generate, review and send on-brand replies across email and WhatsApp.",
    year: "2026",
    role: "Independent project — product, interface and engineering",
    stack: "Next.js 16, React 19, TypeScript, Tailwind 4, Clerk, Supabase, Groq, Resend, Vitest",
    summary:
      "Paste a customer complaint, get three professional, ready-to-send replies in under five seconds — then keep them in the brand’s voice, check them, approve them and send them from one inbox.",
    sections: [
      {
        heading: "Context",
        body: "Support teams answer the same complaints all day, across email and WhatsApp. ReplyAI started as a micro-SaaS with one promise — paste a complaint, get three ready-to-send replies in under five seconds — and grew into a customer-response workspace built around that moment.",
      },
      {
        heading: "My role",
        body: "An independent project: product, interface and engineering — from the Next.js App Router frontend and API routes to the Postgres schema and its migrations.",
      },
      {
        heading: "The problem",
        body: "Generating text is the easy part. A reply a business will actually send has to sound like that business, must not say anything it shouldn’t, and needs a person to approve it before it reaches a customer.",
      },
      {
        heading: "Decisions",
        body: "Brand-voice profiles that distil a reusable voice “DNA” and apply it to every draft. A safety engine that checks replies before they go out. An approval inbox between AI drafts and sending. Email and WhatsApp channels behind authenticated webhooks. Data connectors so replies can draw on the business’s own Postgres data. Usage tracking per plan.",
      },
      {
        heading: "Outcome",
        body: "The core flow — generate, apply brand voice, persist, history, safety — works end to end against a real auth session, a real Supabase database and live model calls, with 22 of 22 unit tests passing (test report, June 2026). Testing the running app also caught a high-severity bug a green build had missed: a missing migration made reply-history inserts fail silently. The fix was the migration, plus making the API log insert errors instead of swallowing them.",
      },
      { heading: "In hindsight", body: draft("What you would do differently — e.g. testing the running app earlier, or the safety engine’s design.") },
    ],
    links: [
      { label: "Live site", href: "https://complaint-reply-generator.vercel.app" },
      { label: "Source", href: "https://github.com/sahilshityalkar/complaint-reply-generator" },
    ],
  },
  {
    slug: "case-two",
    index: "II",
    title: draft("Your work at Clyra — the system or feature you are proudest of"),
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

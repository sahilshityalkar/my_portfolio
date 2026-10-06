import { demo, type CaseStudy } from "./types";

/**
 * Case I is written from the public ReplyAI repository, its test report and the
 * live site. Cases II and III describe real Clyra product areas (heyclyra.com);
 * everything about your specific contribution there is demo copy to replace.
 */
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
      {
        heading: "In hindsight",
        body: demo(
          "I would test the running app against real services from the first week. A passing build proved far less than I assumed; running the product end to end found the bug that mattered.",
        ),
      },
    ],
    links: [
      { label: "Live site", href: "https://complaint-reply-generator.vercel.app" },
      { label: "Source", href: "https://github.com/sahilshityalkar/complaint-reply-generator" },
    ],
  },
  {
    slug: "clyra-student-app",
    index: "II",
    title: demo("Clyra — the student app"),
    kicker: demo("Turning an AI diagnosis of what a student doesn’t know yet into an interface that feels like progress, not a report card."),
    year: "2025",
    role: "Frontend Lead",
    stack: demo("Next.js, React, TypeScript, Tailwind CSS, design tokens"),
    summary: demo(
      "Students upload their own materials, practise with adaptive quizzes, and Clyra maps their knowledge gaps into a plan. My job was making that loop clear, quick and motivating on every device.",
    ),
    sections: [
      {
        heading: "Context",
        body: "Clyra builds assessments from a student’s own materials and pinpoints which concepts are mastered and which aren’t. The student app is where that analysis becomes something a student can act on: a mastery map, flashcards, audio lessons and a weekly study plan.",
      },
      {
        heading: "My role",
        body: demo("Frontend lead: the app’s architecture, the component system it’s built from, and the interaction design of the quiz and mastery flows, working directly with product and the AI team."),
      },
      {
        heading: "The problem",
        body: demo("A gap analysis is discouraging if it reads like a list of failures. The interface had to make weak spots feel like the next step, keep quizzes fast on low-end phones, and handle AI responses that arrive over seconds, not milliseconds."),
      },
      {
        heading: "Decisions",
        body: demo("Made the mastery map the home screen, so progress is the first thing a student sees. Streamed AI-generated content into stable skeleton layouts so nothing jumps as it arrives. Kept quiz interactions optimistic and local-first, so answering never waits on the network."),
      },
      {
        heading: "Outcome",
        body: demo("Describe the result here with real numbers once you can share them — quiz completion, time to a first study plan, or performance on mid-range phones."),
      },
      { heading: "In hindsight", body: demo("What you would do differently next time.") },
    ],
    links: [{ label: "heyclyra.com", href: "https://heyclyra.com" }],
  },
  {
    slug: "clyra-institutions",
    index: "III",
    title: demo("Clyra — the institution workspace"),
    kicker: demo("Auto-grading, cohort heatmaps and live dashboards that show a school which students need help before they fall behind."),
    year: "2025",
    role: "Frontend Lead",
    stack: demo("Next.js, React, TypeScript, data visualisation, real-time updates"),
    summary: demo(
      "Teachers and school leaders get grading in seconds and a live view of every cohort. The challenge was density: a lot of data on one screen that still reads at a glance.",
    ),
    sections: [
      {
        heading: "Context",
        body: "For institutions, Clyra grades submissions with detailed feedback, flags plagiarism and AI-written work, and tracks mastery across classes in real time.",
      },
      {
        heading: "My role",
        body: demo("Frontend lead for the workspace: information architecture, the dashboard and heatmap components, and the patterns for reviewing AI-generated grades."),
      },
      {
        heading: "The problem",
        body: demo("Leaders need the whole picture; teachers need the one student who is slipping. The same data had to serve both without becoming a wall of numbers."),
      },
      {
        heading: "Decisions",
        body: demo("Built the cohort heatmap as the anchor view, with drill-down from cohort to class to student to concept. Made every AI grade reviewable and overridable inline, so teachers stay in control. Virtualised large tables and charts so they stay smooth with whole year groups."),
      },
      {
        heading: "Outcome",
        body: demo("Describe the result here with real numbers once you can share them — grading time saved, dashboard adoption, or performance with large cohorts."),
      },
      { heading: "In hindsight", body: demo("What you would do differently next time.") },
    ],
    links: [{ label: "heyclyra.com", href: "https://heyclyra.com" }],
  },
];

export const getCase = (slug: string) => work.find((c) => c.slug === slug);

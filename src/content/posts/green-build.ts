import type { Post } from "../writing";

/**
 * Every fact here is from the public ReplyAI repository: TEST_REPORT.md
 * (4 June 2026), src/app/api/generate/route.ts, src/lib/db/*.sql,
 * src/lib/db/README.md, src/lib/supabase.ts and scripts/check-schema.js
 * (commit 209c9de).
 */
export const greenBuild: Post = {
  slug: "a-green-build-is-not-a-working-product",
  title: "A green build is not a working product",
  dek: "22 of 22 tests passed and the build was clean, yet ReplyAI saved none of the replies it generated. How I found it, and how the next gap fails loudly.",
  date: "2026-11-04",
  tags: ["testing", "next.js", "supabase", "reliability"],
  links: [
    { label: "ReplyAI, live", href: "https://complaint-reply-generator.vercel.app" },
    { label: "Source and test report", href: "https://github.com/sahilshityalkar/complaint-reply-generator" },
    { label: "The case study", href: "/work/replyai" },
  ],
  body: [
    {
      type: "p",
      text: "By early June 2026 every feature in ReplyAI's plan was marked done, the build was green and the unit suite passed 22 of 22. Then I used the running app the way a customer would, and found it had not been saving a single reply it generated.",
    },
    {
      type: "p",
      text: "ReplyAI is a small product I built on my own: paste a customer complaint, get three ready-to-send replies in under five seconds, in a brand's voice, then review and send them. This post covers why nothing caught the bug, how I found it, and the two small changes that make the same class of failure loud.",
    },

    { type: "h", text: "Green meant consistent, not working" },
    {
      type: "p",
      text: "The stack is Next.js 16 with the App Router, Clerk for auth, Supabase (Postgres) for data, Groq for the model calls and Vitest for tests. The central route, `/api/generate`, takes a complaint, builds a prompt with the brand voice, asks the model for three replies, records usage and writes the result to a `reply_history` table. That table feeds the dashboard, the inbox and the send flow: sending an email updates the draft row the generate step created.",
    },
    {
      type: "p",
      text: "Every check I had was green. The project compiled, the linter was quiet and Vitest passed 22 of 22. None of those checks touched a real database.",
    },

    { type: "h", text: "Testing it the way a customer would" },
    {
      type: "p",
      text: "So I ran a different kind of test: the app on localhost with a real signed-in Clerk session, the real Supabase project and real Groq calls, driving the product through its API from the browser. The first result looked fine. `/api/generate` returned 200 with three distinct, relevant replies in about 2.6 to 2.9 seconds, inside the five-second promise.",
    },
    { type: "p", text: "The response also carried this:" },
    { type: "code", lang: "text", code: '{ "replies": [ ... ], "history_id": null }' },
    {
      type: "p",
      text: "`history_id` is the id of the row the route has just inserted. It was `null` on every call: the replies were generated and returned, and never stored. Reply history was empty, the inbox was missing manual replies, and the send flow had no draft to update.",
    },

    { type: "h", text: "A migration that never ran, and an error nobody saw" },
    {
      type: "p",
      text: "The schema lives in numbered SQL migrations in the repository. The fourth adds the columns the automation workflow needs to `reply_history`:",
    },
    {
      type: "code",
      lang: "sql",
      caption: "src/lib/db/004_automation_workflow.sql (excerpt)",
      code: `alter table reply_history add column if not exists channel text not null default 'manual';
alter table reply_history add column if not exists automation_status text not null default 'manual';`,
    },
    {
      type: "p",
      text: "The application code writes `automation_status` on every insert, but migration 004 had never been applied to the Supabase project. PostgREST, the API layer Supabase puts in front of Postgres, rejected each insert with `PGRST204`: it could not find the column.",
    },
    {
      type: "p",
      text: "That alone is a quick fix once you see it. The route, though, discarded the insert's error. The user still got their replies, so from the outside the route looked healthy.",
    },
    {
      type: "p",
      text: "The same session turned up a second, smaller bug. The brand-voice routes returned a bare 500. The cause was that the Supabase project, on the free tier, had paused itself after about a week idle, so its hostname no longer resolved (`ENOTFOUND`). The routes caught the exception and replied with no detail, hiding a cause that took seconds to fix once it was visible.",
    },

    { type: "h", text: "Fix the data, then make the failure loud" },
    {
      type: "p",
      text: "The data fix was to run migrations 002, 003 and 004 in the Supabase SQL editor. After that `/api/generate` returned a real UUID and the replies appeared on the dashboard. The code fix mattered more, because it turns the next mistake of this kind into a log line instead of silence:",
    },
    {
      type: "code",
      lang: "ts",
      caption: "src/app/api/generate/route.ts",
      code: `const { data: history, error: historyError } = await supabase
  .from("reply_history")
  .insert({ /* ... */ automation_status: "manual" })
  .select("id")
  .single();

if (historyError) {
  // Don't fail the request: the user still gets their replies. But log
  // loudly so a broken insert (e.g. missing migration) is never silent.
  console.error("[/api/generate] reply_history insert failed:", historyError);
}`,
    },
    {
      type: "p",
      text: "I chose not to fail the request. The replies are the product, and someone answering a complaint should still get them if history storage is broken. The failure is now in the logs the moment it happens. The voice routes got the same treatment: they return the underlying error detail instead of an empty 500.",
    },

    { type: "h", text: "A schema check that can fail a deploy" },
    {
      type: "p",
      text: "Logging catches the problem after a user hits it. I also wanted to catch it before, so I added a schema verifier: a Node script that lists every table and column the application code depends on, asks the database whether each one exists, and exits non-zero if anything is missing.",
    },
    {
      type: "code",
      lang: "js",
      caption: "scripts/check-schema.js (excerpt)",
      code: `// reply_history columns are the union of the base table plus every ALTER in
// 002, 003 and 004. Keep this in sync with the migration files.
const EXPECTED = {
  reply_history: [
    "id",
    /* ... */
    // 002_reply_history_profile.sql
    "profile_id",
    // 003_email_reply.sql
    "customer_email",
    /* ... */
    // 004_automation_workflow.sql
    "channel",
    "automation_status",
    /* ... */
  ],
  /* ... */
};`,
    },
    {
      type: "p",
      text: "It runs as `npm run check:schema`, reads the Supabase URL and service key from `.env.local` or the environment, and needs nothing beyond the Supabase client. Exit code 0 means every expected column is present; 1 means something is missing or the database could not be reached, and it says which, so a paused project reads as paused rather than as a missing table. It is meant to run after applying migrations, in CI and before every deploy.",
    },

    { type: "h", text: "Why 22 passing tests said nothing" },
    {
      type: "p",
      text: "The suite tested pure logic: the safety engine that flags legal threats, chargebacks and abusive language, and the prompt builder for brand voice. They found nothing wrong because nothing was wrong there. The failure lived at the boundary between my code and a system the tests never touched: the actual shape of the production database.",
    },
    {
      type: "p",
      text: "A design smell made that boundary harder to test. The Supabase client was constructed at import time and threw if its environment variables were missing, so any test that imported a module near it failed to load. One test had worked around this by copying the function under test instead of importing it, so it was testing a stale copy. I rewrote it to import the live function and gave the test config dummy environment values. Later I made the client lazy: it is now created on first use, so importing the module never throws.",
    },
    {
      type: "p",
      text: "The full test report, with every check and its result, is in the repository. If I started ReplyAI again, the end-to-end pass against real services would happen in the first week, not after everything was marked done.",
    },

    { type: "h", text: "What I'd take away" },
    {
      type: "list",
      items: [
        "A passing build proves the code is consistent with itself. Only running the product against its real services proves it works.",
        "Never swallow an error you cannot handle. Degrade if you must, but log it where someone will see it.",
        "When code depends on a schema it does not own, write the dependency down as a check that can fail a deploy.",
        "Create clients that need secrets lazily, so modules are safe to import in tests and the tests exercise the real code.",
      ],
    },
  ],
};

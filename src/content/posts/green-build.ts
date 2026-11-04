import type { Post } from "../writing";

/**
 * Every fact here is from the public ReplyAI repository: TEST_REPORT.md
 * (4 June 2026), src/app/api/generate/route.ts, src/lib/db/*.sql and
 * scripts/check-schema.js (commit 209c9de).
 */
export const greenBuild: Post = {
  slug: "a-green-build-is-not-a-working-product",
  title: "A green build is not a working product",
  dek: "22 of 22 tests passed and the build was clean, yet ReplyAI had not saved a single reply. What found the bug, and what I changed so it cannot hide again.",
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
      text: "ReplyAI is a small product I built on my own: paste a customer complaint, get three ready-to-send replies in under five seconds, keep them in a brand's voice, check them, approve them and send them. By early June 2026 every feature on the plan was marked done, the build was green and the unit suite passed. Then I tested the running app the way a customer would use it, and found that it had not been saving any of the replies it generated.",
    },
    {
      type: "p",
      text: "This post is about that bug: why nothing caught it, how it was found, and the two small changes that mean the same class of failure now fails loudly.",
    },

    { type: "h", text: "What \"done\" meant" },
    {
      type: "p",
      text: "The stack is Next.js 16 with the App Router, Clerk for auth, Supabase (Postgres) for data, Groq for the model calls and Vitest for tests. The central route, `/api/generate`, takes a complaint, asks the model for three replies, applies the brand voice, records usage and writes the result to a `reply_history` table. The reply history feeds the dashboard, the inbox and the send flow: sending an email updates the draft row the generate step created.",
    },
    {
      type: "p",
      text: "Everything I had was green. The project compiled, the linter was quiet, and the Vitest suite passed 22 of 22. None of those checks touched a real database.",
    },

    { type: "h", text: "Testing the running app" },
    {
      type: "p",
      text: "So I ran a different kind of test: the live app on localhost, a real signed-in Clerk session, the real Supabase project and real Groq calls, driving the product through its API from the browser. The first result looked fine. `/api/generate` returned 200 with three distinct, relevant replies in about 2.6 to 2.9 seconds, inside the product's five-second promise.",
    },
    { type: "p", text: "The response also carried this:" },
    { type: "code", lang: "text", code: '{ "replies": [ ... ], "history_id": null }' },
    {
      type: "p",
      text: "`history_id` is the id of the row the route just inserted. It was `null` on every call. The replies were being generated and returned, and never stored. The dashboard was empty, the inbox had no manual replies, and the send flow had no draft to update.",
    },

    { type: "h", text: "The root cause" },
    {
      type: "p",
      text: "The schema lives in numbered SQL migrations in the repo. The fourth one adds the columns the automation workflow needs to `reply_history`:",
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
      text: "The application code had moved on to write `automation_status` on every insert, but migration 004 had never been applied to the Supabase project. Postgres, through PostgREST, rejected each insert with `PGRST204`: the column did not exist.",
    },
    {
      type: "p",
      text: "That alone would have been a loud, quick fix, except the route silently discarded the insert's error. The user still got their replies, so from the outside the route looked healthy.",
    },
    {
      type: "p",
      text: "A second, smaller bug turned up in the same session. The brand-voice routes returned a bare 500. The real cause was that the Supabase project, on the free tier, had paused itself after a week without traffic, so its hostname did not resolve. The routes caught the exception and replied with no detail, which hid a cause that took seconds to fix once it was visible.",
    },

    { type: "h", text: "The fix, in two parts" },
    {
      type: "p",
      text: "The data fix was to apply migrations 002, 003 and 004. After that `/api/generate` returned a real UUID and the replies appeared on the dashboard. The code fix mattered more, because it is what turns the next mistake of this kind into a log line instead of silence:",
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
      text: "I chose not to fail the request. The replies are the product, and a user waiting on a complaint should still get them if history storage is broken. But the failure is now visible in the logs the moment it happens. The voice routes got the same treatment: they now return the underlying error detail instead of an empty 500.",
    },

    { type: "h", text: "Making the gap checkable" },
    {
      type: "p",
      text: "Logging catches the problem after a user hits it. I also wanted to catch it before a deploy, so I added a schema verifier: a small Node script that lists every table and column the application code depends on, asks the database whether each one exists, and exits non-zero if anything is missing.",
    },
    {
      type: "code",
      lang: "js",
      caption: "scripts/check-schema.js (excerpt)",
      code: `// reply_history columns are the union of the base table plus every ALTER in
// 002, 003 and 004. Keep this in sync with the migration files.
const EXPECTED = {
  reply_history: [
    "id", "user_id", "created_at", "complaint", "tone", "business_type", "replies",
    "profile_id",                                                 // 002
    "customer_email", "email_subject", "sent_via_email", "sent_at", // 003
    "channel", "automation_status", /* ... */                      // 004
  ],
  // ...
};`,
    },
    {
      type: "p",
      text: "It runs as `npm run check:schema`, reads its credentials from the environment and has no dependencies beyond the Supabase client. Exit code 0 means every expected column is present; 1 means something is missing or the database could not be reached. It belongs in CI and before every deploy, which is exactly the moment the original bug slipped through.",
    },

    { type: "h", text: "Why the tests passed" },
    {
      type: "p",
      text: "It is worth being precise about why 22 passing tests said nothing here. The suite tested pure logic: the safety engine that flags legal threats, chargebacks and abusive language, and the prompt builder for brand voice. Those are good tests and they found nothing wrong because nothing was wrong there. The failure lived at the boundary between my code and a system I did not control: the actual shape of the production database.",
    },
    {
      type: "p",
      text: "There was also a small design smell that made the boundary harder to test. The Supabase client was constructed at import time and threw if its environment variables were missing, so a test that imported anything near it failed to load. One test had worked around this by copying the function under test instead of importing it, which meant it was testing a stale copy. I rewrote it to import the live function and gave the test config dummy environment values; the better fix, still on the list, is to create the client lazily.",
    },

    { type: "h", text: "What I'd take away" },
    {
      type: "list",
      items: [
        "A passing build proves the code is consistent with itself. Only running the product against its real services proves it is consistent with the world.",
        "Never swallow an error you cannot handle. Degrade if you must, but log it where someone will see it.",
        "When code depends on a schema it does not own, write the dependency down as a check that can fail a deploy.",
        "Keep clients that need secrets lazy, so modules are safe to import in tests and the tests exercise the real code.",
      ],
    },
    {
      type: "p",
      text: "The full test report, with every check and its result, is in the repository. If I started ReplyAI again, the end-to-end pass against real services would happen in the first week, not after everything was marked done.",
    },
  ],
};

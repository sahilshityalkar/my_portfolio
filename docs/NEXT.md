# Next session: start here

Read README.md, docs/DECISIONS.md (especially "Fourth pass") and
PLACEHOLDERS.md first. Everything is committed on `main`.

## Where things stand (5 November 2026)

Everything is committed on `main`. Two sessions of autonomous work with
independent reviewers (QA and performance, a hiring panel, a senior code
reviewer, a Lighthouse/axe/metadata auditor, a tech recruiter). Every
finding that did not need the owner's facts has been fixed.

The site now has, beyond the concept (glass, blueprint, As built, title
block):
- **Drag the measure** on the hero statement (canvas re-set, CLS 0).
- **A two-page print résumé** of the home page ("Résumé (PDF)" in the
  header and hero until `links.resume` exists).
- **A first screen that never waits:** role, company, city, stack and
  contact on the first painted frame; "Selected work" and the top of
  Plate I on screen from 1366x768 up.
- **Search and share:** a 143-character meta description in recruiters'
  words, a per-case share card, JSON-LD (ProfilePage/Person, CreativeWork,
  BreadcrumbList), favicon and apple icon, theme-color that follows Night.
- **Engineering:** the glass split into `glass/model.ts`, `glass/draw.ts`
  and the component; a cached lens scene (4x CPU: 17 ms a frame); nothing
  measured while closed; a reveal failsafe if scripts never run; unit
  tests (`npm test`) for the line breaker and the spring.
- **Writing:** five notes at `/writing` (home section, RSS, share cards),
  fact-checked against the code and history. Read them before sharing.
- **`docs/profile/`:** LinkedIn, GitHub README, résumé bullets and launch
  posts, ready to fill and publish.
- **A new `docs/demo.webm`** of every signature moment
  (`node docs/record-demo.cjs` re-records it).

Measured on the production build (Chromium):

| Check | Result |
| --- | --- |
| Lighthouse, every route | 100 / 100 / 100 / 100 desktop; mobile performance 99 to 100 (one noisy run at 91) |
| LCP desktop / 390 at 4x CPU / plus 1.6 Mbps, 150 ms | about 0.13 s / 0.22 s / 0.92 s |
| CLS | 0 everywhere: load, glass demo, scroll, As built, glass, measure drags, fonts delayed on a slow network |
| Overflow 320 to 1920, Day and Night, after using the measure | 0 |
| Em or en dashes in rendered HTML, every route | 0 |
| Glass lens, 4x CPU | 17 ms average, 16.8 ms p95 |

Latest round (5 November): a hiring panel (7.2, every "now" fix applied),
QA (8.5, all seven findings fixed) and a code review of the writing and
print code (7.5, all four findings fixed). Since then: "Résumé (PDF)" works
from every route (`/?print`), notes print cleanly, /writing has its own
share card, the glass follows code blocks scrolled sideways, and code
blocks are tab stops only when they scroll.

Review scores before that round: QA 7 (fresh reviewer, all its findings since
fixed), code review 7.5 (all bugs fixed), recruiter 6 and hiring panel 7.
The recruiter and panel scores are capped by the same thing: the lead
role rests on demo copy. **The six questions at the top of
PLACEHOLDERS.md are the highest-leverage next step.**

## Queued (hiring panel, 5 November: 6/10, capped by owner facts)

Done: a curated home notes list, honest proof lines, note wording. Next, none
of which needs the owner:
1. Home Work: Clyra cases II and III as compact rows without plates, so
   ReplyAI (the only case with a screen and an outcome) leads.
2. /work/replyai Decisions: map each decision to a constraint in "The
   problem" (a short list), and reconsider the second Plate I.
3. Print: drop the "press L" line on paper; consider a three-line Notes
   block if it still fits two pages.
4. Hide #lab while `labLive` is false (its one entry repeats the hero).

## How to verify

```bash
npm run build && npm run start   # :3000
npx tsc --noEmit && npx eslint .
```

The checklist used every round: no horizontal overflow at 320, 375, 390,
768, 1024, 1440 and 1920 in Day and Night; reduced motion; keyboard order
and focus; the glass (L, click empty space to flood) and the As built lens;
the measure drag; no console errors; CLS 0 including the automatic glass
demo and long drags; zero U+2014 and U+2013 in the rendered HTML of every
route.

## Still pending from the owner

In priority order (details in PLACEHOLDERS.md):

1. Résumé PDF at `public/resume.pdf`, then `links.resume = "/resume.pdf"`.
2. Real Clyra facts: team size, what you own, one outcome you can share.
   These replace the demo lines in `experience.ts` and cases II and III.
3. An in-app ReplyAI screenshot (inbox, replies, approval) to replace the
   marketing-page one in `public/work/replyai.png`.
4. Confirm or remove the availability lines and the reply-time promise.
5. Lab site at lab.sahilshityalkar.com, or remove Glass and Springs.
6. Deploy on Vercel and connect sahilshityalkar.com.

Known, deliberately left: 320x568 phones do not show the Work rule on the
first screen. Case pages print on their own (two to three A4 pages, plates
drawn, draft sections left out), but the résumé is the home page.

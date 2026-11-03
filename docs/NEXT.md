# Next session: start here

Read README.md, docs/DECISIONS.md (especially "Fourth pass") and
PLACEHOLDERS.md first. Everything is committed on `main`.

## Where things stand (November 2026)

The agency run is finished. The landing page has been through four review
rounds with a QA and performance tester and a three-person hiring panel
(technical recruiter, engineering manager hiring a frontend lead, design
lead). Their reports from the first run are in `docs/agency/REVIEW.md`;
before and after screenshots are in `docs/agency/shots/`.

| Round | QA and performance | Hiring panel |
| --- | --- | --- |
| Before this run | 8 | 7 |
| 1 | 7.5 (found the ruler click bug) | 7.5 |
| 2 | 8.5 | 8.0 |
| 3 | 9 | 8.3 |
| 4 (final) | **9.5** | **8.5** (recruiter 8.5, engineering manager 7, design lead 9.5) |

The loop stopped there: the panel said the only thing between the page and
9 or higher is information only the owner can supply (résumé, Clyra team
size, scope and outcomes, an in-app ReplyAI screenshot), which it valued at
about +1.5 for the engineering manager. Small fixes from the round-4
reports were applied after it (canvas baselines from the DOM, the Work
aside separator, the tablet hero band).

What this run added:

- **Drag the measure** (the creative step): the hero's MEASURE dimension
  ends in a handle; drag it or use the arrow keys and the statement re-sets
  live on a canvas, then springs back. CLS stays 0 by construction. See
  DECISIONS.md, "Fourth pass", for how and why.
- **Size-tiered font fallbacks**, so the web-font swap never shifts the page
  (CLS 0.00000 from 320 to 1920 with fonts delayed).
- The recruiter line in reading size, one section-head system, the glass
  invitation in the field left of the surname, "Selected work" on the first
  screen from 1024x768 to 1920x1080, an honest Lab list, and many QA fixes
  (ruler hit areas, menu focus, short screens, deep links, no-JS controls).

Measured on the production build (Chromium, Playwright, median of 5):

| Profile | LCP | CLS |
| --- | --- | --- |
| Desktop 1440x900 | ~0.13 s | 0 |
| 390x844, 4x CPU | ~0.23 s | 0 |
| 390x844, 4x CPU, 1.6 Mbps, 150 ms RTT | ~1.0 s | 0 |

Frame time unthrottled: 16.7 ms for the As built lens, the glass and the
measure drag. Under a 4x CPU throttle the global glass averages about
22 to 25 ms (rasterising the full-viewport canvas); sizing the canvas to the
lens's bounding box is the next step if that matters.

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
first screen; the case pages still print their draft Outcome and Hindsight
sections (this run was scoped to the landing page).

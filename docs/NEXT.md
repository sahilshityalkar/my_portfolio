# Next session: start here

Read README.md, docs/DECISIONS.md and PLACEHOLDERS.md first. Everything built
so far is committed on `main`.

## Agency run status (stopped mid-run for an account switch)

Concept chosen by the creative director: **"As Built"**. Under the glass the page
becomes a drawing; on Plate I (ReplyAI) a lens turns the drawing into the real
product screenshot. Plus live hero callouts and a footer title block.

Done and committed: research (3 agents), creative brief, interaction builder,
content builder. The layout and polish builder was interrupted; its partial
edits are committed as "WIP: layout and polish pass (interrupted)".

**Resume from here:** finish the layout and polish track (type, spacing, rhythm,
Night mode, mobile-specific design across the landing page), then run the QA
and performance tester, the hiring panel review, and a lead-engineer fix pass,
as described below.

## The agency workflow plan

Goal: make the landing page creative enough that a recruiter or engineering
manager wants to hire on sight. Landing page only. Work autonomously:
research, decide, build, verify, without asking the owner for design calls.

Team (about 9 agents):

1. **Research (parallel):** trend researcher (Awwwards, FWA, Godly, Codrops,
   top frontend portfolios); hiring researcher (what makes recruiters and
   engineering managers act in 10 seconds); audit critic (scores the current
   landing page from screenshots).
2. **Decide:** creative director merges the research, explores 3 to 4 concept
   directions, picks the strongest one that fits "Under the Glass", writes the
   brief.
3. **Build (parallel branches):** interaction engineer (signature moment);
   content and story designer (structure and copy, verified facts only);
   layout and polish engineer (type, spacing, Night, mobile as its own design).
4. **Quality gate:** QA and performance tester (320 to 1920px, Day/Night,
   reduced motion, keyboard, no-WebGL, console, LCP/CLS/fps); hiring-panel
   reviewer (recruiter, engineering manager, design lead) with one revision
   round.
5. Merge, commit every step, push to `main`, report with before/after shots.

Rules: no invented facts or metrics, no em dashes in visible copy, no
generic AI look, no loss of performance or accessibility.

## Still pending from the owner

- Real Clyra details, résumé PDF (`public/resume.pdf`), photo for About.
- Deploy on Vercel and connect sahilshityalkar.com.
- Lab site at lab.sahilshityalkar.com (separate app).

# Next session: start here

Read README.md, docs/DECISIONS.md and PLACEHOLDERS.md first. Everything built
so far is committed on `main`.

## Planned next step: landing-page "agency" workflow (approved idea, not yet run)

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

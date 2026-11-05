# Placeholder checklist

The site is complete and every section reads as finished, but some copy is
**demo content**: realistic text written so the design is whole while real
details are pending. In code it's wrapped in `demo("…")`, so you can find all
of it at once:

```bash
grep -rn "demo(" src/content
```

Replace a demo string by deleting the `demo(` wrapper and its closing `)` and
editing the text. Never leave a demo claim you can't stand behind. Recruiters
and interviewers will ask about it.

Unwritten sections use `draft("…")` instead. They render in a quiet, dotted
"in preparation" style, never as instructions:

```bash
grep -rn "draft(" src/content
```

## Questions for you (answer these and the page can say more, truthfully)

Every reviewer, recruiter and hiring panel landed on the same gap: the page
proves craft, but the lead role rests on demo copy. Short answers to these
are enough; they go into `src/content/` in your words.

1. **Team:** how many engineers do you lead at Clyra, and who do you report
   to? Have you hired, interviewed or mentored anyone?
2. **Clyra notes:** which of the three Experience notes are true as written
   (architecture of both products; progress dashboards and cohort
   heatmaps; component library, tokens and code review)? One real number
   for each you keep (pages or features shipped, a performance change, a
   release cadence).
3. **Before Clyra (2021 to 2024):** internships, freelance work or first
   jobs, with dates. Without them, "Lead" straight after a degree invites
   doubt.
4. **Logistics recruiters ask first:** remote, hybrid or Mumbai on site?
   Open to relocating? Notice period?
5. **Tools:** do you use Jest, Playwright, Testing Library or Storybook? Do
   you own a design system? (Only true items go in the Toolkit.)
6. **Files:** your résumé PDF, and, if you are allowed to share them, one
   real screenshot of each Clyra product and an in-app ReplyAI screen.

## The notes in Writing were written for you

The five posts in `src/content/posts/` are written in your voice about real
work: this site's engineering (from its code and measured history) and
ReplyAI (from its public test report and code). Read each one before you
share it, change anything that does not sound like you, and make sure you
can explain every line: interviewers will ask about them. Delete any you
would rather not stand behind (remove it from `src/content/writing.ts`).

## In priority order

1. [ ] **Résumé PDF**: put it at `public/resume.pdf` and set
   `links.resume = "/resume.pdf"` in `src/content/profile.ts`. A Résumé
   button then appears in the header, the hero and Contact. Until then it is
   hidden everywhere.
2. [ ] **TOP PRIORITY to verify: the Clyra lines** in
   `src/content/experience.ts`:
   - `summary`: "Leading the frontend of Clyra, the AI school operating
     system, from its early product onward." "From its early product" is
     not verified. (The start date, Jan 2025, is verified and now shows
     beside your role in the hero, so the summary no longer repeats it.)
   - Team size: not stated anywhere yet. If you lead a team, say how many
     people (it is the single strongest line for a lead role).
   - The three `notes` (architecture for both products, progress dashboards
     and cohort heatmaps, shared component library and review practice).
     Plausible for the role, not confirmed. Keep only what's true and add
     real numbers where you can.
3. [x] **Stack line** (`profile.focus`): now "TypeScript · React · Next.js ·
   Node.js · PostgreSQL", the words recruiters search for, all taken from
   the Toolkit (your résumé and the ReplyAI repo). Reorder or swap to lead
   with what you want to be hired for.
4. [ ] **Availability** (`profile.availability`, in Contact): "Open to
   conversations about senior frontend and frontend lead roles. Replies
   within two working days." Only keep the reply time if you'll honour it.
   Its short form, `profile.availabilityShort` ("Open to senior frontend
   and frontend lead roles"), is on the first screen in the accent colour:
   delete it (set it to `""`) if you are not looking.
5. [ ] **About, paragraph 1** (`src/content/about.ts`): the paragraph about
   the part of an interface nobody screenshots. Written for you; make it
   sound like you. Paragraph 2 (MERN to Next.js, ReplyAI) is also demo.
6. [ ] **Lab entries** (`src/content/lab.ts`): Glass, Springs and Blueprint
   are demo entries. While `labLive = false` the whole Lab section is left
   off the home page (its one entry only repeated the hero's glass), and
   the nav, ruler and sheet numbers close up around it. When the lab site
   is deployed, update titles, summaries and slugs to match what you
   published, then set `labLive = true`: the section, its links and its
   nav entry come back, numbered in place.
7. [ ] **Source repo visibility**: if this site's repo is made public, set
   `links.source` in `profile.ts` to its GitHub URL. The footer title block
   then shows "Source ↗". It stays hidden while `null`.
8. [ ] **Freshness date**: bump `profile.updated` ("November 2026") whenever
   you change content. It shows in the hero eyebrow.

## Also demo or draft

### `src/content/work.ts`
- [ ] **ReplyAI**: the "In hindsight" paragraph (your reflection, written for you)
- [ ] **Case II, Clyra student app**: title, kicker, stack, `stackShort`,
      summary, and the My role / Problem / Decisions sections. The
      *Context* section describes Clyra's public product and is accurate.
- [ ] **Case III, Clyra institution workspace**: same as Case II
- [ ] **Cases II and III, Outcome and In hindsight**: still `draft()` in
      `work.ts`. The case pages leave unwritten sections out (the
      numbering follows), so nothing reads "in preparation" in public.
      Write them, with real numbers, once you can share them, and they
      appear automatically.
- [ ] Check what you're allowed to say publicly about Clyra's internals
- [ ] Imagery: ReplyAI's case page shows a screenshot of the live site
      (`public/work/replyai.png`), and the same screenshot is what the AS BUILT
      lens reveals on Plate I. For the Clyra cases, add screenshots to
      `public/work/` and set `image: { src, alt, url }` on each case; they
      show on the case page after "Decisions", and the index then gives that
      plate the lens too. Only do this for a real, shipped screen.
- [ ] **A better ReplyAI screenshot.** The current one is the product's
      marketing page. An engineering manager wants the product itself: the
      inbox, the three replies, the approval step. Replace
      `public/work/replyai.png` with a real in-app screen (same 4:3-ish crop,
      top-aligned). Note: the current screenshot's own button text, "Try it
      free — no card needed", contains an em dash (it is in the image, so the
      page's HTML stays dash-free, but it is visible inside the lens).

### `src/content/about.ts`
- [ ] Capability "Frontend architecture" is demo (its proof, "Frontend lead
      at Clyra, see Experience", links to the Experience section).
      "Interface quality" points at the measured title block in the footer,
      and "Full-stack product work" cites the ReplyAI repo: both are real.
- [x] Toolkit: every item comes from your résumé, the ReplyAI repo or this
      site. Remove anything you wouldn't want to be interviewed on.

## Verified (sourced, no action needed, but double-check)

| Fact | Source |
| --- | --- |
| Name: Sahil Shityalkar | Résumé in the Personal-Portfolio-Website repo |
| Frontend Lead Engineer at Clyra, since Jan 2025 | You |
| Clyra: "the AI school operating system" | heyclyra.com |
| Mumbai, India | GitHub profile |
| Email: sahilshityalkar05@gmail.com | GitHub profile README. Swap it if you prefer another for recruiters |
| GitHub, LinkedIn, X links | You and the GitHub profile |
| B.Sc. IT, Ramanand Arya D.A.V. College, 2021 to 2024 | Résumé (CGPA deliberately left off) |
| ReplyAI case study (except "In hindsight"), languages, screenshot | The repo, its TEST_REPORT.md and the live site |
| ReplyAI proof line: "3 replies in under 5 s · 22 of 22 tests passing · live" | The repo README, TEST_REPORT.md (June 2026) and the live site |

## Missing (hidden until provided)

- [ ] **Résumé PDF**: see priority 1.
- [x] **Site URL**: defaults to `https://sahilshityalkar.com`. Override with
      `NEXT_PUBLIC_SITE_URL` only for a staging copy.
- [ ] **Lab site**: build and deploy lab.sahilshityalkar.com (separate app),
      then set `labLive = true`.

## Deliberately not used

- `petreon` and the old portfolio: their live URLs return 404, and the code is
  early or template-based.
- `shoping-site`: its README points to another author.
- Forks (twenty, nextui, floating-ui, meshery…): no upstream contributions.
- The old résumé's "40% improvement in user engagement": nothing backs it up.
- Clyra's company stats (users, GPA): those are Clyra's results, not yours.

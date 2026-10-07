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

## Verified (sourced, no action needed, but double-check)

| Fact | Source |
| --- | --- |
| Name: Sahil Shityalkar | Résumé in the Personal-Portfolio-Website repo |
| Frontend Lead Engineer at Clyra, since Jan 2025 | You |
| Clyra: "the AI school operating system" | heyclyra.com |
| Mumbai, India | GitHub profile |
| Email: sahilshityalkar05@gmail.com | GitHub profile README. Swap it if you prefer another for recruiters |
| GitHub, LinkedIn, X links | You and the GitHub profile |
| B.Sc. IT, Ramanand Arya D.A.V. College, 2021–2024 | Résumé (CGPA deliberately left off) |
| ReplyAI case study (except "In hindsight"), languages, screenshot | The repo, its TEST_REPORT.md and the live site |

## Demo content to replace

### `src/content/profile.ts`
- [ ] `availability`: the line under your email in Contact

### `src/content/experience.ts`
- [ ] Clyra `summary`
- [ ] The three Clyra `notes` (architecture ownership, dashboards, team
      standards). These are plausible for your role, not confirmed. Keep only
      what's true, and add real numbers where you can.

### `src/content/work.ts`
- [ ] **ReplyAI**: the "In hindsight" paragraph (your reflection, written for you)
- [ ] **Case II, Clyra student app**: title, kicker, stack, summary, and the
      My role / Problem / Decisions / Outcome / Hindsight sections. The
      *Context* section describes Clyra's public product and is accurate.
- [ ] **Case III, Clyra institution workspace**: same as Case II
- [ ] Check what you're allowed to say publicly about Clyra's internals
- [ ] Imagery: ReplyAI's case page already shows a screenshot of the live
      site (`public/work/replyai.png`). For the Clyra cases, add screenshots to
      `public/work/` and set `image: { src, alt, url }` on each case; they show
      on the case page after "Decisions". The index keeps the technical drawings.

### `src/content/lab.ts`
- [ ] The three featured experiments (Glass, Springs, Blueprint) are demo
      entries. Their links go to lab.sahilshityalkar.com/glass, /springs and
      /blueprint, which don't exist until the lab site is built and deployed.
      Update titles, summaries and slugs to match what you actually publish.

### `src/content/about.ts`
- [ ] Both paragraphs
- [ ] The three principles (craft, systems, teams). Only keep beliefs you'd
      defend in an interview.

## Missing (hidden until provided)

- [ ] **Résumé PDF**: put it at `public/resume.pdf` and set
      `links.resume = "/resume.pdf"` in `profile.ts`. A Résumé button then
      appears in the header, the hero and Contact.
- [x] **Site URL**: defaults to `https://sahilshityalkar.com`. Override with
      `NEXT_PUBLIC_SITE_URL` only for a staging copy.
- [ ] **Lab site**: build and deploy lab.sahilshityalkar.com (separate app).

## Deliberately not used

- `petreon` and the old portfolio: their live URLs return 404, and the code is
  early or template-based.
- `shoping-site`: its README points to another author.
- Forks (twenty, nextui, floating-ui, meshery…): no upstream contributions.
- The old résumé's "40% improvement in user engagement": nothing backs it up.
- Clyra's company stats (users, GPA): those are Clyra's results, not yours.

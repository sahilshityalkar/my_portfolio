# Placeholder checklist

Everything below is unknown to the build and must come from you. Nothing on the
site was invented: unwritten values are `draft("…")` entries in `src/content/`,
and they render as quiet, dotted-underlined italic notes ("in preparation"),
never as fake content.

Quick audit: `grep -rn "draft(" src/content` lists every remaining placeholder,
and `grep -n "null" src/content/profile.ts` lists missing links.

## Identity — `src/content/profile.ts`

- [x] **Name.** `Sahil Shityalkar`, as written on your résumé in the
      Personal-Portfolio-Website repo.
- [ ] **Statement.** One honest sentence about your role. A draft is in place;
      rewrite it in your own voice.
- [x] **Location.** Mumbai, India (from your GitHub profile).
- [ ] **Availability.** For example "Open to senior frontend roles", or remove it.
- [ ] **Site URL.** Set `NEXT_PUBLIC_SITE_URL` in your host's environment
      (e.g. `https://yourname.dev`). Canonical URLs, the sitemap, robots and
      OG images all derive from it.

## Links — `src/content/profile.ts` → `links`

- [x] `email`: `sahilshityalkar05@gmail.com` (the address on your GitHub profile
      README). Swap it if you prefer a different one for recruiters.
- [ ] `resume`: the résumé in your old portfolio repo predates Clyra and
      lists no work experience, so it is **not** linked. Put an up-to-date PDF in `/public` (e.g. `/public/resume.pdf`) and set
      `resume: "/resume.pdf"`. The header shows a Résumé button once it's set.
- [x] `linkedin`: https://www.linkedin.com/in/sahilshityalkar/
- [x] `x`: https://x.com/SK_sahil05
- [x] `github`: `https://github.com/sahilshityalkar` (taken from the repo remote; verify)

## Experience — `src/content/experience.ts`

Your LinkedIn and X profiles couldn't be read automatically (both block
crawlers), and no public source mentions Clyra, so nothing about Clyra beyond
your title is on the site.

- [ ] Clyra start date (month and year)
- [ ] Three notes: what you own, a hard decision and its outcome, how you raise
      the team's bar. Use real numbers only.
- [ ] Earlier roles, if any: add more objects to the array.

## Selected work — `src/content/work.ts`

**Case I, ReplyAI**, is written from your repo
(github.com/sahilshityalkar/complaint-reply-generator), its TEST_REPORT.md and
the live site. Review the wording, and fill in:

- [ ] "In hindsight", the last section
- [ ] Confirm "Independent project — product, interface and engineering" as your role
- [ ] Imagery: add a screenshot at `public/work/replyai.png` and set
      `image: { src: "/work/replyai.png", alt: "…" }` on the entry

Not used, on purpose: `petreon` and the old portfolio (their live URLs return
404 and the code is early or template-based), `shoping-site` (its README points
to another author), and the forks (no upstream PRs). The résumé's "40%
improvement in user engagement" isn't used either, since nothing backs it up.

For **Case II** (intended for your Clyra work) and **Case III**:

- [ ] Title, kicker, year, role, stack, summary
- [ ] Six body sections: Context, My role, The problem, Decisions, Outcome, In hindsight
- [ ] Links (live site, repo) if public
- [ ] Rename the `slug` once the project has a real name (the URL updates itself)
- [ ] Imagery: the drafting plates (`src/components/Plate.tsx`) stand in for
      screenshots. Swap them for `next/image` when you have real visuals.

## Education

- [x] B.Sc. Information Technology, Ramanand Arya D.A.V. College, Mumbai,
      2021–2024 (from your résumé). The CGPA is left off deliberately.

## About — `src/content/about.ts`

- [ ] Two paragraphs in your own voice
- [ ] Three principles (craft, systems, teams). Only write what you actually believe.

## Optional

- [ ] Re-check the share card (`/opengraph-image`) once your name is final
- [ ] Add a second Lab experiment: see "Adding a lab experiment" in README.md

# Placeholder checklist

Everything below is unknown to the build and must come from you. Nothing on the
site was invented: unwritten values are `draft("…")` entries in `src/content/`,
and they render as quiet, dotted-underlined italic notes ("in preparation"),
never as fake content.

Quick audit: `grep -rn "draft(" src/content` lists every remaining placeholder,
and `grep -n "null" src/content/profile.ts` lists missing links.

## Identity — `src/content/profile.ts`

- [ ] **Name.** Currently `Sahil Shityalkar`, inferred from the GitHub handle
      `sahilshityalkar`. Confirm the spelling and how you want it written.
- [ ] **Statement.** One honest sentence about your role. A draft is in place;
      rewrite it in your own voice.
- [ ] **Location.** City/country, or "Remote".
- [ ] **Availability.** For example "Open to senior frontend roles", or remove it.
- [ ] **Site URL.** Set `NEXT_PUBLIC_SITE_URL` in your host's environment
      (e.g. `https://yourname.dev`). Canonical URLs, the sitemap, robots and
      OG images all derive from it.

## Links — `src/content/profile.ts` → `links`

- [ ] `email`
- [ ] `resume`: put the PDF in `/public` (e.g. `/public/resume.pdf`) and set
      `resume: "/resume.pdf"`. The header shows a Résumé button once it's set.
- [ ] `linkedin`
- [ ] `x`
- [x] `github`: `https://github.com/sahilshityalkar` (taken from the repo remote; verify)

## Experience — `src/content/experience.ts`

- [ ] Clyra start date (month and year)
- [ ] Three notes: what you own, a hard decision and its outcome, how you raise
      the team's bar. Use real numbers only.
- [ ] Earlier roles, if any: add more objects to the array.

## Selected work — `src/content/work.ts`

For each of the three case studies (`case-one`, `case-two`, `case-three`):

- [ ] Title, kicker, year, role, stack, summary
- [ ] Six body sections: Context, My role, The problem, Decisions, Outcome, In hindsight
- [ ] Links (live site, repo) if public
- [ ] Rename the `slug` once the project has a real name (the URL updates itself)
- [ ] Imagery: the drafting plates (`src/components/Plate.tsx`) stand in for
      screenshots. Swap them for `next/image` when you have real visuals.

## About — `src/content/about.ts`

- [ ] Two paragraphs in your own voice
- [ ] Three principles (craft, systems, teams). Only write what you actually believe.

## Optional

- [ ] Re-check the share card (`/opengraph-image`) once your name is final
- [ ] Add a second Lab experiment: see "Adding a lab experiment" in README.md

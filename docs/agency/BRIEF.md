# Creative brief: As Built

## concept

AS BUILT: the drawing, and what it drew. "Under the Glass" goes further in one direction only. Today the glass turns the page into its engineering drawing. This pass adds the reverse: on the Work plate for ReplyAI, the only shipped and verifiable product, a small glass turns the drawing into the real product. The visitor hovers Plate I, which shows the technical drawing of complaint to three replies, and a lens opens on the actual screenshot of complaint-reply-generator.vercel.app underneath. It reads as one sentence: "Under the glass, the page becomes a drawing. Under the glass, the drawing becomes the product." The second, smaller idea makes the measurement visible without pressing L. Three live redline callouts sit on the hero, measured from the DOM, and their numbers change while the window is resized. A drafting title block in the footer prints this visit's real measured LCP, CLS and transfer size. Everything else on the page gets quieter, tighter and less repetitive, so these two moments carry the page. Recruiter path: name, role, company, visible email address and a work cue all on the first screen, with no gate.

## rationale

Directions explored:
(1) AS BUILT lens on plates plus measured-at-rest annotations: CHOSEN.
(2) Plate-to-case-page morph with View Transitions (shared view-transition-name). Rejected for this pass. The App Router needs an experimental flag or React's canary ViewTransition to do it properly, case pages are out of scope, and it is a transition rather than proof.
(3) "Vellum" re-skin: cooler drafting-film palette, sheet numbers, registration crosses everywhere, to escape the cream-serif cliché. Rejected. It replaces rather than deepens, risks Night mode, and the trend research itself warns that static blueprint decoration is template-aesthetic. Live measured annotations escape the cliché more honestly.
(4) Variable-font opsz/weight hover on titles plus interface sound. Rejected as small and spread out; it is the "many small ideas" trap.

Why AS BUILT wins:
- It fixes the audit's three biggest problems in one move:
  - The best verified evidence (the real ReplyAI screenshot) is buried on the case page. Now it appears on the landing page, discovered by hover or a keyboard toggle.
  - The plates look like wireframes. Now one plate opens onto a real product.
  - The glass falls apart outside the hero. The Loupe now measures plate geometry instead of blanking it.
- It is honest by construction: only the case with a real screenshot gets the lens, and II/III stay drawings.
- It is a 6-second screen recording: hover drawing, see product, press L, see the page measured, including the plate's own primitives.
- It is cheap: one clip-path circle driven by the existing Spring class, a next/image that is already in /public, and no dependencies.

The hero callouts answer TRENDS #1, #3 and #12: the wow is visible at rest, and it is live, not wallpaper. The title block answers TRENDS #9 and HIRING #14 (the site as a measured work sample).

The content and layout tracks then remove the audit's repetition, dead space and buried contact. Details:
- The email address is visible in the hero (HIRING #5).
- A work cue shows on mobile (HIRING #3).
- A focus line states the target level (HIRING #6).
- Proof line and live links on ReplyAI (HIRING #8 and #13, audit P1).
- Case II/III placeholder text becomes honest draft marks (audit P1).
- A "last updated" date shows freshness (HIRING #11).
- Lab goes after About and stops linking to URLs that 404.
- Contact replaces "Let's talk." with the address itself as the display line.
- Section padding is cut by about 40%. Two numbered-row patterns go, and headings stop repeating one template.

Not changed:
- The palette, Newsreader and Plex: identity continuity.
- The hero name animation and the one-time glass demo.
- Case pages (/work/*) and 404, except the shared Plate, Loupe and globals rules, which must keep working there.

Builders: before using next/image, Link or any Next API, read the relevant guide in node_modules/next/dist/docs (per AGENTS.md). Never start a dev server: one is already running at http://localhost:3000. No new npm deps. Commit and push to main after each track (user memory rule).

## alternativesConsidered

- Plate-to-case morph with View Transitions (shared view-transition-name across routes): strong motion moment, but needs an experimental Next/React ViewTransition path, touches case pages that are out of scope, and is a transition rather than proof. Deferred.
- Vellum re-skin: cooler drafting-film Day palette with sheet numbers, registration crosses and a title block on every section, to escape the cream-serif AI cliché. Rejected because it replaces the established identity, risks Night, and static blueprint decoration is itself a 2026 template aesthetic. Live measured callouts get the same differentiation honestly.
- Scroll-driven CSS drafting (animation-timeline: view()) for plates and the ruler: elegant, but the actual problem was slow, broken-looking mid-states. Simply compressing the existing draw-in to under 1.2s fixes it with less risk.
- Variable-font optical-size hover on titles plus opt-in interface sound: tasteful but small and scattered, the many-small-ideas trap. Sound is a risk on a recruiter page.

## interactionTrack

OWNER FILES: src/components/AsBuilt.tsx (new), src/components/HeroCallouts.tsx (new), src/components/TitleBlock.tsx (new), src/components/Plate.tsx, src/components/sections/Work.tsx (structure only), src/components/Loupe.tsx, src/app/globals.css (only the plate draw-in block and new .asbuilt and .callout rules), src/content/types.ts (only add the optional `image` use; no copy). Do not write copy beyond the literal strings given here.

A. AS BUILT LENS (signature)
1. Restructure Work.tsx so no interactive element nests inside the case Link (nested interactives are invalid HTML).
   - Each <li> becomes a div.grid-12 with the same column placement as now, keeping the alternate ordering for odd i.
   - The plate column is <div class="relative">. It holds CaseVisual, and above it a full-cover Link (`absolute inset-0 z-10`, href /work/{slug}, aria-hidden="true", tabIndex={-1}), so a click anywhere on the plate still opens the case.
   - The text column keeps the index/year line. The <h3> wraps a Link to /work/{slug}; that is the accessible link, with aria-label as today. The "Read the case study" line becomes its own Link.
   - Keep `group` hover behaviour by putting `group` on the outer div.
   - Keep data-spec="Case {index}" and data-reveal on the outer element.
2. Plate.tsx: add an optional prop `asBuilt?: { src: string; alt: string; url?: string }`. CaseVisual passes `c.image` into it ONLY on the landing page. Add a prop `asBuilt` to CaseVisual and have Work.tsx pass `asBuilt={c.image}`. The case page keeps calling CaseVisual without it, so case pages are unchanged.
3. When asBuilt is present, Plate renders a client child <AsBuilt> inside the <figure>, after the svg.
   - Layer: next/image with `fill`, `sizes="(min-width: 768px) 56vw, 100vw"`, `loading="lazy"`, class `object-cover object-top`, wrapped in div.asbuilt (`absolute inset-0 z-20 pointer-events-none`).
   - The wrapper style is `clip-path: circle(var(--r,0px) at var(--x,50%) var(--y,50%))`.
   - Also render a ring div (`absolute z-30 pointer-events-none rounded-full border border-(--ink)` sized 2r, translated to x,y via transform, opacity 0 when r < 1) and a mono readout under the ring: "AS BUILT · complaint-reply-generator.vercel.app", the url from c.image.url, t-meta 10px, paper background.
4. AsBuilt behaviour, pointer:fine.
   - On pointerenter of the figure: SNAP x,y to the pointer on the first frame (Rauno: no pickup lag), then open radius r: 0 to R with `springs.aperture`, where R = clamp(84px, 22% of the figure width, 150px).
   - On pointermove: retarget x,y with `springs.glass`.
   - On pointerleave: r goes to 0 with aperture.
   - Use the existing Spring class from src/lib/spring.ts with one rAF loop that sleeps when every spring rests (same pattern as the Loupe).
   - Write CSS custom properties on the wrapper (--x, --y, --r) and a transform on the ring. No React state per frame.
5. Keyboard and touch: a <button type="button" aria-pressed> in the figure's top-right corner (`absolute right-3 top-3 z-40`, t-meta, paper background, hairline border, h-8 px-3; no rounded-full pill: use rounded-[2px]).
   - Text "As built" when off and "Drawing" when on; both labels share one grid cell so the width never changes.
   - Pressing it floods the lens: centre (50%, 50%), r to hypot(w,h)/2 + 8 with `springs.flood`. Pressing again closes it.
   - On pointer:coarse devices the button is the only trigger, and the hover lens is disabled.
   - Esc while flooded closes it.
   - The button must remain clickable above the full-cover Link (z-40 vs z-10).
6. Reduced motion: springs snap (r jumps), no ring travel. Without JS: the image is not rendered (AsBuilt returns null until mounted? NO: render the layer in SSR with clip-path radius 0 so there is no layout cost and no request until it is near the viewport; next/image lazy handles that). Without JS the drawing simply shows.
7. Perf budget:
   - Only transform, clip-path and custom properties change: no layout reads in the loop.
   - Read getBoundingClientRect of the figure once on pointerenter and on resize.
   - 60fps on a 4x CPU-throttled laptop. The image loads lazily (no impact on LCP or initial transfer).
   - The figure keeps aspect-[4/3] (CLS 0).
8. The global Loupe must ignore the AsBuilt ring and readout (data-loupe-skip). Opening the global glass (inspect !== off) closes AsBuilt.

B. PLATE DRAW-IN SPEED (audit P1). In globals.css, change only the plate block:
- `.draw`: transition 0.55s, delay calc(var(--d,0)*22ms + 60ms).
- `:is(.svg-fade,.pop,.cell)`: 0.45s, delay calc(var(--d,0)*22ms + 80ms).
- `.cell`: 0.35s, delay calc(var(--d,0)*16ms + 40ms).

Every plate must reach its final state within 1.2s of data-in. Reduced motion stays as today (final state).

C. LOUPE OVER PLATES (audit P2). In Loupe.tsx measure():
- For each media item whose figure contains an <svg>, also collect up to 160 primitives: svg rect, circle, line and text elements not inside [data-loupe-skip], with their getBoundingClientRect in document coordinates, tag name and rounded w×h.
- In draw(), for svg media:
  - Skip the diagonal cross.
  - Draw each rect and circle as a dashed mark-coloured outline (circles as arcs).
  - Draw lines at 0.6 alpha.
  - Draw svg text as line boxes, like other text.
  - Label only the largest five rects with "rect W × H" via the existing tag().
- Keep the figure frame and its "svg W × H" label.
- For img media, keep today's behaviour.

The plate is then drawn as measured primitives, never blanked.

D. HERO CALLOUTS (measured at rest). New client component HeroCallouts.tsx, rendered from Hero.tsx. Three callouts, each aria-hidden="true" and data-loupe-skip, in t-meta at 10px with tabular-nums. Number slots have fixed min-width in ch so digit changes never move anything.
1. CAP: a vertical redline dimension (1px var(--mark), 5px end ticks) beside the word "Sahil", from cap line to baseline, labelled "CAP {n} PX" to its right.
   - Positioning: Hero wraps the "Sahil" text node in <span class="relative inline-block">. The callout is absolutely positioned at left: calc(100% + 0.18em).
   - top and height in px come from measuring with canvas measureText('H').actualBoundingBoxAscent on the computed font, plus the span's line box (same method as Loupe), and are set as CSS vars.
2. MEASURE: a horizontal dimension 10px under the statement paragraph, spanning its actual widest line, from Range.getClientRects. Label: "MEASURE {chars} CH · {px} PX", where chars = round(px / width of '0' in the statement font).
3. SHEET: in the hero's bottom row, next to the InspectHint: "VIEWPORT {w} × {h} · DPR {dpr}".
Shared behaviour:
- SSR renders all labels with middle-dot placeholders ("CAP ··· PX") at opacity 0. After fonts are ready (document.fonts.ready) and first measurement, add data-ready to fade in over 400ms (opacity only).
- Update on ResizeObserver(document.body) and on resize, coalesced in rAF.
- CAP and MEASURE are hidden below 640px; SHEET shows at all widths.
- Hidden in print. No animation on number changes: they just update, which is the point.
- The callouts must not overlap the name's italic overhang or the contact list at 1024, 1280, 1440 or 1920. If CAP would collide with the right side of "Shityalkar" at lg (it shouldn't, since Sahil is on its own line), hide it.

E. TITLE BLOCK (measured colophon). New client component TitleBlock.tsx. Contact.tsx's footer renders it in place of "Built by hand. Press L to see how." It is a small bordered drafting title block: a grid of hairline cells, t-meta.
- Cells: "SHEET" / "sahilshityalkar.com"; "THIS VISIT" / "LCP {x.xx} S"; "CLS {0.000}"; "TRANSFER {n} KB"; "BUILT WITH" / "Next.js 16 · no animation libraries"; "INSPECT" / a button "Press L" (calls inspect.set('lens'), or 'full' on coarse pointers).
- Values:
  - LCP: PerformanceObserver type largest-contentful-paint, buffered: true; last entry startTime / 1000.
  - CLS: layout-shift entries without hadRecentInput, summed, buffered: true.
  - TRANSFER: sum of transferSize over navigation and resource entries, divided by 1024 and rounded.
  - Any metric the browser doesn't report renders "not reported here".
- SSR placeholders use middle dots, with fixed min-widths. Values update once after load and when CLS changes.
- If profile.ts later gets links.source (content track adds the key, null for now), render "SOURCE ↗".
- No em or en dashes anywhere.

F. Do NOT add: cursor followers, new scroll effects, sound, scroll-driven animations, or view transitions to case pages.

## contentTrack

OWNER FILES: src/content/profile.ts, work.ts, experience.ts, about.ts, lab.ts, types.ts (types only), src/app/page.tsx (order), src/components/Header.tsx (nav order, numbers, the "Index" label), src/components/Ruler.tsx (SECTIONS order only), and the copy and markup inside src/components/sections/*.tsx, building on the structure the interaction track left. Also PLACEHOLDERS.md and docs/DECISIONS.md (add a short "Third pass: As built" section). Rules: every new personal claim goes in demo(). No em or en dashes in any string; use commas, colons, periods, "to" or the middle dot.

1. SECTION ORDER: Hero, Work, Experience, About, Lab, Contact.
   - Update page.tsx.
   - Header nav: Work 02, Experience 03, About 04, Lab 05, Contact 06.
   - Ruler SECTIONS: intro 01 "Intro", work 02, experience 03, about 04, lab 05, contact 06.
   - SectionHead numbers to match.
   - The Header mobile button label "Index" becomes "Menu" (and its nav aria-label becomes "Site").
2. HERO (Hero.tsx plus profile.ts).
   a) Replace the "01 Index" eyebrow with "Portfolio · updated {profile.updated}" and add `updated: "October 2026"` to profile.ts, with a comment to bump it on each content change. The mark-coloured "01" goes.
   b) Role block stays literal: "Frontend Lead Engineer / at Clyra / Mumbai, India". Add a 4th line in text-ink-3: profile.focus = demo("React, TypeScript, design systems, data-dense product UI").
   c) Contact list: the first item is the visible address. "sahilshityalkar05@gmail.com" as a mailto link in text-ink, rendered at normal case (no uppercase transform: add `normal-case tracking-normal` on that item), followed by <CopyEmail> in a compact variant. Add prop `compact` to CopyEmail: h-7, no border, the label "Copy". The label slot keeps its width when it switches to "Copied".
      - Then Résumé (still hidden while links.resume is null), LinkedIn, GitHub, X.
      - Without JS the address is still plain visible text.
   d) The work cue is visible at all widths (remove `hidden sm:block`). Text: "Selected work ↓".
   e) Statement unchanged (profile.statement).
3. WORK (work.ts plus types.ts plus Work.tsx).
   - Add optional fields to CaseStudy: `proof?: string`, `stackShort?: Text`.
   - Case I: proof "3 replies in under 5 s · 22 of 22 tests passing · live" (verified from the README and test report). stackShort "Next.js 16, Supabase, Groq, Vitest".
   - Cases II and III: stackShort demo("Next.js, React, TypeScript"), no proof.
   - Work.tsx text column order:
     - index · year
     - title link
     - kicker
     - for case I: proof line in t-meta text-mark
     - dl with Role and Stack (stackShort ?? stack)
     - then a link row: "Read the case study →" plus, for case I only, "Live site ↗" and "Source ↗" from c.links (target _blank, rel noreferrer), each a separate link.
   - SectionHead aside changes from "3 case studies" to "1 independent · 2 at Clyra".
   - Under Plate I (figcaption is the interaction track's job), add a one-line caption below the figure in t-meta text-ink-3: "Plate I: the drawing. Hover it, or press As built, to see the shipped product." On pointer:coarse use "Tap As built to see the shipped product." Use the same CSS media-query swap technique as InspectHint.
4. CASE II and III PLACEHOLDERS (audit P1): in work.ts, change the Outcome and In hindsight bodies of cases II and III from demo("Describe the result...") / demo("What you would do differently next time.") to draft("Outcome to be published once results can be shared publicly") and draft("Reflection in preparation"). T already renders draft() as the quiet dotted "in preparation" style, so the case page shows no authoring instructions. List them in PLACEHOLDERS.md.
5. EXPERIENCE (Experience.tsx plus experience.ts).
   - Keep company, title, "Jan 2025 to Present" and heyclyra.com. Add the verified line "Mumbai".
   - Notes render as an unnumbered list (hairline-separated rows, no "01 02 03").
   - Keep the three notes as demo(), but tighten each to at most 22 words with concrete nouns and no "fast and legible" or "by default" filler:
     - demo("Own the frontend architecture for both products: the student app and the institution workspace.")
     - demo("Built the progress dashboards and cohort heatmaps that schools use to spot students who need help.")
     - demo("Set the shared component library, design tokens and code review practice the frontend team works from.")
   - Summary: demo("Leading the frontend of Clyra, the AI school operating system, since its early product.") Flag it in PLACEHOLDERS.md as TOP PRIORITY to verify, together with team size.
   - Education stays.
6. ABOUT (about.ts plus About.tsx).
   - Paragraph 1 becomes demo("The part of an interface I care about most is the part nobody screenshots: the loading state that doesn't jump, the keyboard path that works, the number that is measured instead of claimed. This page shows its own construction for that reason.").
   - Paragraph 2 stays (MERN to Next.js, ReplyAI).
   - Capabilities: remove "Leading frontend" (it repeats Experience) and remove the numbering.
   - Proofs: "Frontend architecture" proof "Clyra" (demo body stays). "Interface quality" proof "Measured in the footer of this page" (links to #contact). "Full-stack product work" keeps the ReplyAI proof and its link.
   - Toolkit stays as plain text.
   - "Leading the frontend at Clyra since January 2025" must appear at most once on the whole page, in Experience. Remove the other restatements, and make the availability line in Contact not repeat it.
7. LAB (lab.ts plus Lab.tsx).
   - Add `export const labLive = false` to lab.ts.
   - While false, cards are NOT links. Remove the per-card href, the "Open ↗" and the big host link band.
   - The aside reads "Separate site, in progress".
   - The intro sentence stays.
   - Keep the three entries (demo summaries) as a compact list: title, summary, tech, plus the small preview at most 160px tall on desktop, or drop the preview if layout needs it.
   - When labLive becomes true, the old link behaviour returns (keep the code path behind the flag).
8. CONTACT (Contact.tsx plus profile.ts).
   - The h2 becomes a t-meta label "Contact" (keep id contact-title for aria).
   - The display line is the email address itself as the mailto link, set in serif at t-title size, breaking anywhere on small screens. Below it: CopyEmail (full variant) and "Open mail app ↗".
   - "Let's talk." is deleted.
   - availability = demo("Open to conversations about senior frontend and frontend lead roles. Replies within two working days.")
   - The rows list keeps Résumé (hidden while null), LinkedIn, GitHub, X.
   - Add `source: null as string | null` to links in profile.ts, with a comment: set it to the GitHub repo URL if the repo is made public.
   - Footer: © year, name · location, then the TitleBlock from the interaction track.
9. METADATA: ensure the layout.tsx description has no dashes (it uses profile.statement, fine). Run a grep over src for "—" and "–" and fix any visible ones.
10. PLACEHOLDERS.md: move "résumé PDF at public/resume.pdf" to the top as priority 1, then the Clyra experience lines, then focus line, availability, About paragraph 1, lab entries, and source repo visibility.

## layoutTrack

OWNER: spacing, type, rhythm, Night, mobile and visual polish in src/components/sections/*.tsx, SectionHead.tsx, Ruler.tsx (visual only), AsBuilt, HeroCallouts and TitleBlock styling, and globals.css (type and spacing utilities only). No copy changes and no behaviour changes beyond what is listed.

1. RHYTHM:
   - Section padding goes from py-24 sm:py-36 to py-16 sm:py-24 (about -35 to 40%) for Work, Experience, About and Lab.
   - Contact: pt-16 sm:pt-24, and the footer margin goes from mt-28 to mt-16.
   - Work list gap: space-y-16 sm:space-y-28 becomes space-y-14 sm:space-y-20.
   - SectionHead to content margin: mt-12 sm:mt-20 becomes mt-8 sm:mt-12.
   - Target total page height at 1440×900 is at most 6200px, down from about 7758 (measure with document.documentElement.scrollHeight). At 390×844 it is at most 7600px.
2. WORK: the case grid becomes `items-start` (not items-end) so the case text top-aligns with the plate; remove the about 400px blank above ReplyAI. At md+, the text column sits at the plate's top with pt-2. The proof line for case I is t-meta in var(--mark). The link row is a flex wrap with gap-x-5.
3. HEADINGS, de-templated. Work keeps the full SectionHead (rule, number, big title). The others vary:
   - Experience: SectionHead with title size t-title but no aside. The company "Clyra" italic drops from clamp(3rem,8vw,6.5rem) to clamp(2.4rem,5vw,4rem). The left column must no longer leave about 350px empty: the notes column and left column end within 120px of each other at 1440.
   - About: no big title. A rule plus t-meta "04 About", then paragraph 1 set as t-lede across md:col-span-8. Capabilities become a 3-column row at lg (one column on mobile) with hairline tops and no numbers.
   - Lab: a compact band. Rule plus "05 Lab" meta and title t-title at clamp(1.8rem,3vw,2.6rem), list as a 3-column grid at md. Total section height at 1440 is at most 760px.
   - Contact: no "06" number above. The rule plus the "Contact" meta label, then the email display line.
   Eyebrows: reduce letter-spacing on .t-meta from 0.06em to 0.04em globally (TRENDS #14: tracked-out eyebrows), and check that nothing wraps differently on case pages at 390 and 1440.
4. HERO:
   - Desktop: change min-h-[100svh] to min-h-[calc(100svh-5rem)] at lg+, so the Work section's top rule and "02" peek above the fold at 1440×900 and 1366×768.
   - Mobile (<768): remove min-h and justify-end. Use pt-[calc(var(--header-h)+2.5rem)] pb-8 so the eyebrow starts within 140px of the top, and name, role, email and work cue all fit inside 667px height at 375 wide.
   - The visible email in the contact list must not overflow at 320px (use [overflow-wrap:anywhere]).
   - The callouts use var(--mark) lines and ink-3 labels, and must not cover the name at any width from 640 to 1920.
5. AS BUILT visuals:
   - Ring: 1px var(--ink) at 0.7 opacity plus 24 degree ticks drawn as a CSS conic-gradient mask, or skip the ticks if they cost more than 1ms per frame.
   - Readout: paper background, 10px mono.
   - The toggle button has a hairline border var(--rule-strong), radius 2px, and a hover border var(--mark). Focus-visible uses the global ring.
   - In Night: ring ink becomes parchment automatically via tokens. The screenshot stays untinted (it is the real product), and the ring keeps a 1px paper outline so it reads against the light screenshot.
6. RULER (visual): the labels for all sections are always visible at 0.6 opacity, not only on hover. The active label is var(--mark) at full opacity and shows its name ("Work", "About"...) beside the number. Labels never overlap each other: if two marks are within 18px, hide the name of the inactive one.
7. NIGHT: check every changed section in Night.
   - The proof line, callouts and title block borders use tokens only.
   - Contrast of t-meta ink-3 on paper is at least 4.5:1 in both themes. If Day ink-3 #6e685f fails at 10px on paper-2, use ink-2 for 10px text.
8. MOBILE as its own design (320, 375, 390, 430):
   - Plate figure full-bleed within the gutter, with the As built button reachable (min 32px high) and not overlapping the "Plate I" caption.
   - The title block stacks as a 2-column cell grid.
   - The Contact email display line breaks cleanly. No horizontal overflow from 320 to 1920.
9. Remove one decorative element (TRENDS #2): the per-plate hover nudges (the group-hover translate on plate SVG groups in Plate.tsx). AS BUILT replaces them as the plate's interaction. Leave the case pages' plates static too.
10. Keep CLS 0. Any element whose text is filled after measurement has a fixed min-width and line-height.

## acceptance

- Rendered HTML of / and of /work/replyai, /work/clyra-student-app and /work/clyra-institutions contains no U+2014 or U+2013 characters, including <title> and meta description (check document.documentElement.outerHTML).
- At 1440x900 and at 375x667 on first paint (no scroll): the name, 'Frontend Lead Engineer', 'Clyra', 'Mumbai', the visible address 'sahilshityalkar05@gmail.com' and 'Selected work' are all within the viewport, and none of them has opacity < 1 after 1.6s.
- At 1440x900 the Work section's top rule (#work first border) has getBoundingClientRect().top < 900 at scrollY 0.
- Hovering Plate I with a mouse opens a circular lens showing the real ReplyAI screenshot, centred on the pointer on the first frame and following it. Leaving it closes the lens. Plates II and III have no lens and no As built button.
- Tab reaches the 'As built' button on Plate I. Enter or Space floods the screenshot over the whole plate (aria-pressed=true, label 'Drawing'). Pressing again or Esc returns to the drawing. A visible focus ring is present.
- With prefers-reduced-motion: reduce emulated, the As built toggle swaps instantly, the hero callouts show no fade travel, and plates render in their final state.
- Clicking anywhere on a plate outside the As built button navigates to that case page. The case title is a keyboard-focusable link. No <a> or <button> is nested inside another <a> (querySelectorAll('a a, a button').length === 0).
- Every plate reaches its final drawn state within 1.2s after it enters the viewport (screenshot 1.3s after scrollIntoView shows all REPLY cards, edges and the NEEDS HELP card complete).
- With the global glass (L) over Plate I, the lens shows dashed outlines of the plate's rects and circles with 'rect W × H' labels, not an empty grid with a diagonal cross.
- Hero callouts: at 1440 wide 'CAP n PX', 'MEASURE n CH · n PX' and 'VIEWPORT 1440 × 900 · DPR n' show numbers (no middle-dot placeholders after 2s). Resizing the window to 1200 wide updates the VIEWPORT and MEASURE numbers without reload. Below 640px only VIEWPORT shows.
- Footer title block shows LCP as a number in seconds in Chromium, CLS as 0.000, and TRANSFER in KB. In a browser without layout-shift support, CLS shows 'not reported here'. 'Press L' opens the glass.
- Cumulative Layout Shift measured with a PerformanceObserver over load plus a full scroll to the bottom plus hovering Plate I plus toggling As built plus resizing is 0.000 (hadRecentInput excluded).
- Lighthouse-style check on throttled mobile: LCP not worse than 1.6s, and the ReplyAI screenshot is not requested before the Work section approaches the viewport (Network panel shows replyai image loaded lazily).
- Section order in DOM is intro, work, experience, about, lab, contact. Header nav and Ruler labels read Work 02, Experience 03, About 04, Lab 05, Contact 06. The mobile menu button reads 'Menu'.
- Lab cards are not links while labLive is false: no anchor on the landing page points to lab.sahilshityalkar.com/glass, /springs or /blueprint.
- /work/clyra-student-app and /work/clyra-institutions contain no text 'Describe the result' or 'What you would do differently'. Those sections show the dotted 'in preparation' draft style.
- The phrase 'Let's talk' does not appear on the page. The Contact display line is the email address as a mailto link, with Copy email and Open mail app beside it.
- The sentence about leading frontend at Clyra since January 2025 appears at most once on the landing page (count visible occurrences of 'since Jan' plus 'since January' is 1, in Experience).
- ReplyAI card shows '3 replies in under 5 s · 22 of 22 tests passing · live' plus separate 'Live site ↗' and 'Source ↗' links that open complaint-reply-generator.vercel.app and the GitHub repo in a new tab. The stack line on the landing page lists at most 4 items.
- document.documentElement.scrollHeight is at most 6200 at 1440x900 and at most 7600 at 390x844.
- No horizontal overflow (scrollWidth <= clientWidth) at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920, in Day and Night.
- Night mode: callouts, proof line, title block, As built ring and button all render in brass/parchment tokens, legible against charcoal. Theme switch while the As built lens is open causes no flash or misaligned ring.
- No console errors or hydration warnings on / and on each /work/* page. The 404 page still renders.
- Animation smoothness: with the As built lens moving continuously for 3s on a 1440 viewport, the rAF frame time average stays at or below 16.7ms (measure in page.evaluate with requestAnimationFrame deltas, tab brought to front).
- Without JavaScript (javaScriptEnabled: false): all text content including the email address, ReplyAI proof line, experience and contact is visible, and plates show their final drawing.


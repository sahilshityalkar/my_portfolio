# Decisions

How this portfolio was designed and built, and why. Written for whoever
maintains it next, including future me.

## The brief, reduced

Two audiences, one page:

1. **Recruiters** decide in about ten seconds. The first screen must answer
   *who, what, where they work, how to reach them*, with no gate and no wait.
2. **Engineers and designers** should stop scrolling and wonder how it was made.

The rule that resolves the tension: **the wow is never in front of the
essentials, it is underneath them.** The page is a calm, fast, editorial
document first. The spectacle is something you choose to uncover.

## Concept: Under the Glass

The site is a quiet gallery of work. On every page there is a **glass**, an
inspection loupe. Press `L`, or use **Inspect** in the header, and a lens
follows your pointer. Under it, the page becomes **its own engineering
drawing**:

- every component's box, padding (hatched) and size in pixels
- the vertical rhythm between sibling sections, as redline dimensions
- every line of text as its real line box, read from `Range.getClientRects()`
- display type redrawn as outlines, with baseline, x-height and cap-height
  measured by canvas text metrics, in em
- the live 12-column grid, read from computed `grid-template-columns`

Click and the glass **floods** the viewport: the whole site is now a blueprint
you can scroll, resize and re-theme, and it stays accurate because it is
measured, not drawn. Nothing under the glass is an illustration.

Why this concept:

- **Simple to grasp:** it's a magnifying glass. Anyone gets it in one second.
- **Deep to explore:** every page, every section and every viewport width has
  a different drawing, so there's always more to find.
- **Beautiful on video:** the 20-second recording writes itself. Calm
  editorial hero → the glass slides over the name and the letterforms turn
  into outlined construction lines → *wait, what?* Click: the whole page
  floods into a live blueprint → scroll, resize, switch to Night and watch the
  linework turn brass.
- **Only a frontend engineer would build it:** it's literally the box model,
  the text layout engine and the grid, made visible and beautiful. It shows
  the craft by revealing the work, not by describing it.
- **Honest:** it doesn't need a single invented claim to impress.

### Concepts considered

The candidates were sketched, and the top two alternatives were prototyped as
single-file HTML pages and checked in a real browser:

| Concept | What it was | Verdict |
| --- | --- | --- |
| **A. Under the Glass** | The loupe and live blueprint described above | **Chosen.** Legible at rest, explorable everywhere, and the payoff proves the skill. |
| **B. Galley** (prototyped) | The page as a typesetter's proof: drag the column measure and every word reflows on its own spring (FLIP) | Delightful in motion, but illegible mid-reflow (screenshotted), and it only lives inside one paragraph. Too narrow to structure a site. |
| **C. Raking light** (prototyped) | Day/Night as a light source raking across embossed paper type (WebGL normal lighting) | Handsome, but it's an *effect*: it reads as skeuomorphism, it vanishes without WebGL, and it proves shader skill rather than frontend judgment. |
| D. Exhibition rooms | Horizontal scroll through "rooms" | Scroll-jacking is hostile to recruiters and to mobile. Rejected without a prototype. |
| E. Terminal / OS desktop | The site as a fake operating system | Extremely common in developer portfolios, and it hides the content. Rejected. |

The best part of C survives as Lab experiment 001, **Glass**: real refraction
optics, where WebGL actually earns its place.

## Day and Night

Day is the default: warm paper `#f5f2ec`, graphite ink, a single vermilion
"drafting pencil" accent. Night is **the same gallery after closing**, not an
inverted theme: warm charcoal paper, parchment type, and the pencil turns to
brass. A faint, warm pool of light sits at the top of the page, like one lamp
left on. No neon, no glow, no stars.

The switch is a designed moment, built with the **View Transitions API**: the
new light washes across the old view along a soft, wide edge. Dusk falls from
above and dawn rises from below, while the old view settles back very
slightly. Reduced motion gets a short crossfade, and browsers without View
Transitions switch instantly. The choice is persisted, and an inline boot
script applies it before first paint, so there's never a flash.

## Typography

- **Newsreader** (variable: weight and *optical size*) for everything you
  read. Optical sizing gives the 160px name the tight, high-contrast cut of a
  display face and the body text a sturdier text cut, from one family.
  Editorial and warm, and deliberately not Inter.
- **IBM Plex Mono** for meta, labels and the blueprint annotations: the
  draftsman's hand.
- Two families total, self-hosted with `next/font/local` (no network at build
  time, no layout shift thanks to fallback metric adjustment).

## Motion language

One integrator (`src/lib/spring.ts`): a damped spring stepped in fixed
1/240 s sub-steps on **wall-clock time**, with the frame delta clamped. The
same spring settles identically at 60, 120 or 144 Hz, and a backgrounded tab
can't explode it. Three named presets (`glass`, `aperture`, `flood`) cover
every physical motion on the site. CSS transitions share one `--ease-out`
curve for reveals, links and hovers. The hero entrance is pure CSS, so it
starts before hydration and never delays content. Every animation loop sleeps
when nothing moves.

## Navigation model

One long, numbered **index** page (01 Index → 06 Contact), like a catalogue:
each section is an entry, not a separate site. Case studies (`/work/[slug]`)
and experiments (`/lab/[slug]`) are real routes with their own URLs,
metadata and static generation. The glass works identically on every route,
which is what binds the pages into one world.

## Mobile is its own design

There's no hover on touch, so a pointer-following lens is the wrong idea.
Tapping **Inspect** on a touch device runs a **scan**: a hairline sweeps down
the screen on a spring and leaves the blueprint behind it. Then you scroll
through the drawing with your thumb. The mobile header collapses to name,
Inspect, Day/Night and a full-screen typographic **Index** menu.

## Stack

| Choice | Why |
| --- | --- |
| **Next.js 16** (App Router, RSC, static generation) | What React teams hire for. Every page is static HTML with the content in it, which suits SEO, crawlers and first paint. Metadata routes generate the sitemap, robots and OG image. |
| **React 19 + TypeScript 5.9** | TypeScript 7 (the native port) was released, but 5.9 is what the Next.js and typescript-eslint toolchain is proven against today. Upgrade when the ecosystem catches up. |
| **Tailwind CSS v4** | Fast layout utilities over a hand-written token layer (`globals.css`). Design tokens are CSS variables, so the themes are pure CSS. |
| **No animation, 3D or state libraries** | Motion, GSAP, three.js and Zustand were all considered. The site needs one spring, one shader and two global flags. Hand-writing them costs ~400 lines, saves well over 100 KB, and *is* the portfolio. |
| **Raw WebGL2** for the lab | One fragment shader doesn't justify three.js. It's code-split behind `next/dynamic`, so it's only downloaded on `/lab/glass`. |
| **External store** (`useSyncExternalStore`) | The inspect mode and theme are read by distant components (header, loupe, hint). A 30-line store avoids re-rendering the tree through context. |

## Performance

Targets: **LCP < 1.8 s**, **CLS < 0.02**, **INP < 100 ms** on a mid-range
laptop; 60 fps while the glass moves on a normal laptop (and display-rate
smooth on 120 Hz); a home page that ships no third-party scripts.

How:

- Everything is statically generated. The LCP element (the name) is plain
  HTML text in a preloaded font with metric-adjusted fallback.
- The loupe measures the DOM only when something can have changed (resize,
  font load, reveal settle) and then only translates by scroll offset. Drawing
  is one 2D canvas, clipped. It sleeps when nothing moves.
- **Adaptive quality:** if frame time stays above 24 ms for ~40 frames, the
  canvas drops to 1× resolution and stops hatching padding. The lab shader
  does the same.
- WebGL is lazy-loaded and confined to the lab.

See the README for how to re-run the audit.

## Accessibility and resilience

- Semantic landmarks, one `h1` per page, labelled sections, a skip link, a
  visible focus ring in the accent colour.
- The glass is decorative (`aria-hidden`); everything it shows is the page
  itself. It's fully keyboard-operable: `L` toggles it, `Esc` closes it, and
  in lens mode **the glass travels to whatever has keyboard focus**, so
  tabbing through the page inspects it.
- `prefers-reduced-motion`: the composition, light and blueprint all remain;
  springs snap, the theme change crossfades, and reveals don't travel.
- No JS: all content is visible (reveal-hiding only applies under `.js`).
  No WebGL: the lab shows a still, typographic fallback, and context loss is
  handled. Fonts failing to load: metric-matched serif fallbacks.

## Honesty

All personal facts live in `src/content/`. Unknown facts are typed `Draft`
values that render as deliberate "in preparation" notes, and every one of
them is listed in `PLACEHOLDERS.md`. The colophon only states facts about the
site itself, which are verifiable by inspecting it.

## Known limitations

- The blueprint redraws display type with canvas `strokeText`. Canvas can't
  set variable-font axes explicitly, so optical size may differ very slightly
  from the DOM text in some browsers. Glyph positions are anchored per word,
  so drift never accumulates.
- `ctx.letterSpacing` is newer; where it's unsupported, outlined letters sit
  a fraction tighter than the real ones.
- The drafting plates stand in for project imagery until real visuals exist.

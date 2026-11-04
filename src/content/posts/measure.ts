import type { Post } from "../writing";

/**
 * Every fact here is from this repository: src/components/HeroCallouts.tsx
 * (MeasureCallout), src/lib/measure.ts, tests/measure.test.ts, the .measure-*
 * and #intro rules in src/app/globals.css, docs/DECISIONS.md (fourth pass)
 * and commits 955fd59, 7c20be1, 4b5592b, ec5c46a, cb9d4d1, 50d5a38 and
 * c2976c0.
 */
export const measure: Post = {
  slug: "drag-the-measure",
  title: "Drag the measure without moving the page",
  dek: "The hero's paragraph re-sets live as you drag its measure. A canvas kept layout shift at zero; matching the browser's line positions took three fixes.",
  date: "2026-11-04",
  tags: ["performance", "cls", "canvas", "typography"],
  links: [{ label: "See it on the home page", href: "/" }],
  body: [
    {
      type: "p",
      text: "In typography the *measure* is the length of a line. The statement under my name on the home page has its measure drawn beneath it as a dimension line, like an annotation on a drawing, ending in a small drafting diamond. Drag the diamond, or focus it and use the arrow keys, and the paragraph is re-set at the new width while the dimension reads `MEASURE n CH · n PX · n LINES`. Let go and it springs back.",
    },
    {
      type: "p",
      text: "Making it move was easy. Keeping it from moving the rest of the page took a canvas, a hand-off that matches the browser line for line, and an overflow fix that a QA pass found after I thought I was done.",
    },

    { type: "h", text: "Reflowing during a drag counts as layout shift" },
    {
      type: "p",
      text: "The obvious build sets the paragraph's width on every `pointermove` and lets the browser reflow it. Whenever the line count changes, everything under the paragraph moves.",
    },
    {
      type: "p",
      text: "Cumulative Layout Shift (CLS) is the Core Web Vital that scores how much visible content moves. It forgives shifts the user caused, but narrowly: only those within 500 ms of a *discrete* input such as `pointerdown` or `keydown`. A drag is a stream of `pointermove` events, which do not count as input for this purpose. The first half second would be excused and the rest would be scored, on a site whose footer reports its own CLS live.",
    },

    { type: "h", text: "Keep the DOM, draw a copy" },
    {
      type: "p",
      text: "So the real paragraph never reflows. While the measure is live, the DOM text keeps its place with `color: transparent`: still in the accessibility tree, still selectable. An absolutely positioned canvas over it draws the paragraph at the live measure, and drawing moves nothing.",
    },
    {
      type: "p",
      text: "The cost is that the canvas must break lines exactly as the browser does, or the paragraph jumps the moment you grab it.",
    },

    { type: "h", text: "Breaking lines like CSS" },
    {
      type: "p",
      text: "The line breaker, `src/lib/measure.ts`, is small on purpose. Greedy breaking at spaces is what browsers do by default: add words until the next one would not fit. Widths come from canvas `measureText` with the paragraph's computed font, size and tracking, cached per string.",
    },
    {
      type: "p",
      text: "The statement uses `text-wrap: balance`, which evens out line lengths without adding a line. I reproduced it by bisection: find the narrowest width that keeps the greedy line count, and break greedily there.",
    },
    {
      type: "code",
      lang: "ts",
      code: `/** The greedy lines at the narrowest width that still needs no extra line. */
export function balance(words: string[], width: number, measure: Measure): string[] {
  const target = greedy(words, width, measure).length;
  if (target < 2) return greedy(words, width, measure);
  let lo = 0;
  let hi = width;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (greedy(words, mid, measure).length <= target) hi = mid;
    else lo = mid;
  }
  return greedy(words, hi, measure);
}`,
      caption: "src/lib/measure.ts",
    },
    {
      type: "p",
      text: "I don't claim this is the browser's algorithm, only that at rest the canvas and the DOM break this paragraph identically. Unit tests (`node:test`, no new dependencies) cover what I rely on: greedy never splits a word and keeps every word in order, and balance keeps the greedy line count and never widens a line.",
    },

    { type: "h", text: "Ask the browser where each line is" },
    {
      type: "p",
      text: "My first version placed line *i* at `i * lh` from the paragraph's top, plus half the leading and the font's ascent. QA's second round caught the hand-off moving the text by a pixel. Taking the first baseline from the DOM, snapped to device pixels, fixed the first line. Snapping every baseline in the next round was not enough either: the third line still moved.",
    },
    {
      type: "p",
      text: "Browsers place line boxes in layout units of 1/64 px. Each line box lands on a rounded position, so multiplying the line height by the index drifts from what the browser actually did. By the third line the drift crossed a pixel.",
    },
    {
      type: "p",
      text: "The fix was to stop predicting and ask. A `Range` over the paragraph's text returns one client rect per line box, and their tops are the truth:",
    },
    {
      type: "code",
      lang: "ts",
      code: `tops = [];
for (const n of p.childNodes) {
  if (n.nodeType !== Node.TEXT_NODE) continue;
  const r = document.createRange();
  r.selectNodeContents(n);
  for (const rect of r.getClientRects()) {
    const t = rect.top - box.top;
    if (rect.width > 1 && !tops.some((v) => Math.abs(v - t) < 2)) tops.push(t);
  }
}
tops.sort((x, y) => x - y);`,
      caption: "src/components/HeroCallouts.tsx: every resting line where the DOM laid it out",
    },
    {
      type: "p",
      text: "Each baseline is then snapped where the DOM snaps it. At 1x that means whole pixels in page space, not relative to the paragraph, which can sit at a fractional position, so the canvas rounds `pTop + t + ascent` and subtracts `pTop` again. On dense screens it uses the laid-out position as is. Since that change, grabbing and releasing moves no line at 1x.",
    },

    { type: "h", text: "Making room by transform" },
    {
      type: "p",
      text: "A narrower measure adds lines, up to two beyond the paragraph's own. The rows laid out under the paragraph and the Work section carry `data-measure-yield`. While the measure is live those below the paragraph move down with the CSS `translate` property and fade with `filter: opacity(0.12)`, not `opacity`, because those rows own an entrance animation that holds `opacity`. Layout shift is measured on layout positions, which transforms do not change, so the page makes room without the metric noticing.",
    },

    { type: "h", text: "The overflow QA found" },
    {
      type: "p",
      text: "A fresh QA pass found the bug I had not looked for. The canvas reserves up to 160 px on each side of the paragraph for a centred label. After the first use it stayed in the layout, invisible and wider than the viewport: at 768 px, `scrollWidth` grew by 160, and a tablet could pan the page sideways.",
    },
    {
      type: "p",
      text: "The fix has three parts, each for a different failure. The canvas width is clamped to the viewport. The canvas is `display: none` whenever the measure is not live, so it is out of the layout. And the hero clips its own horizontal overflow with `overflow-x: clip`, which, unlike `hidden`, creates no scroll container.",
    },
    {
      type: "code",
      lang: "ts",
      code: `// room for a centred label either side, but never past the viewport's
// edges: a canvas wider than the page scrolls it sideways on a phone
padL = Math.min(PAD, box.left);
const cw = Math.min(maxW + padL + PAD, document.documentElement.clientWidth - box.left + padL);`,
      caption: "src/components/HeroCallouts.tsx",
    },
    {
      type: "p",
      text: "I checked it at 640 to 1440 px after Tab, End and Esc, and with a touch drag on an 820 px tablet: no overflow.",
    },

    { type: "h", text: "A slider for keyboards and screen readers" },
    {
      type: "p",
      text: "The handle is a focusable `role=\"slider\"`. Arrow keys move the measure by one character (the width of a zero in the paragraph's font), five with Shift. Home and End jump to the narrowest and widest measures. Enter, Esc or moving focus away lets go. `aria-valuetext` reads \"n characters wide, n lines\".",
    },
    {
      type: "p",
      text: "A code review caught that the slider's bounds depend on the layout. They are now read when the handle receives focus, which is when assistive tech announces them. With reduced motion, release snaps back instead of springing. Below 640 px the measure is not shown.",
    },

    { type: "h", text: "Results" },
    {
      type: "p",
      text: "Measured in Chromium: CLS 0.00000 over long drags at 1440, 1024 and 768 px wide. The footer's title block, which reports this visit's CLS, stays at 0.000 while you drag.",
    },

    { type: "h", text: "What I would do differently" },
    {
      type: "p",
      text: "I would read line positions from the DOM from the first day. I knew layout uses fixed-point units and wrote `lh * i` anyway because it was shorter. It cost two more rounds of fixes.",
    },
    {
      type: "p",
      text: "I would add a `scrollWidth` check to the viewport sweep before the first QA pass. An invisible element is still in the layout.",
    },
    {
      type: "p",
      text: "One trade-off remains. The canvas applies tracking only where canvas `letterSpacing` is supported, so a browser without it sets the canvas a little differently from the DOM. I accepted that because the statement's tracking is small (`-0.01em`).",
    },

    { type: "h", text: "What I'd take away" },
    {
      type: "list",
      items: [
        "A drag is continuous input. CLS only forgives shifts within 500 ms of a discrete one, so anything that reflows during a drag counts.",
        "If you draw text instead of laying it out, leave the DOM text in place. It keeps accessibility and selection for free.",
        "Do not predict where the browser put a line. Ask it with `Range.getClientRects()`.",
        "Hidden is not gone. Take an idle element out of the layout, and clip overflow at the section that owns it.",
      ],
    },
  ],
};

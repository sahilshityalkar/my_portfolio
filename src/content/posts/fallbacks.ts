import type { Post } from "../writing";

/**
 * Every fact here is from this repository: the @font-face rules and type
 * classes in src/app/globals.css, src/app/layout.tsx, docs/DECISIONS.md
 * (fourth pass, Typography, Performance) and commit ca8e025. The generator
 * bug and the test machine without Times New Roman are from the work
 * sessions, as the author recorded them.
 */
export const fallbacks: Post = {
  slug: "font-fallbacks-optical-sizes",
  title: "One fallback was not enough for optical sizes",
  dek: "A metric-matched fallback still shifted my hero when Newsreader loaded. Three size tiers and a matched italic brought delayed-font CLS to zero.",
  date: "2026-11-04",
  tags: ["fonts", "cls", "css", "performance"],
  links: [{ label: "See it on the home page", href: "/" }],
  body: [
    {
      type: "p",
      text: "A single metric-matched fallback cannot match a font with optical sizes, because the width difference changes with the size. On my portfolio that made the hero statement gain a line when the web font arrived. The fix was one fallback face per size tier, plus one for the italic.",
    },
    {
      type: "p",
      text: "The site is set in Newsreader, a variable serif, self-hosted with `next/font/local` and `display: \"swap\"`. Swap means text paints at once in a fallback face and switches to Newsreader when the file arrives. If the fallback is a different width, lines break differently, the paragraph changes height and everything under it moves. That movement is scored as Cumulative Layout Shift (CLS), and on a slow connection it is part of the first impression.",
    },
    {
      type: "p",
      text: "The usual answer is a metric-matched fallback: a local font such as Times New Roman, declared with `size-adjust` (a multiplier on the glyphs' size) and the `ascent-override`, `descent-override` and `line-gap-override` descriptors (the vertical metrics), so it takes the same space as the web font. I did that, and it still shifted.",
    },

    { type: "h", text: "Optical sizes change the width" },
    {
      type: "p",
      text: "Newsreader has an optical size axis, so it is not one design scaled up and down. With `font-optical-sizing: auto` the browser picks the cut from the font size: the name in the hero gets a tight, high-contrast display cut and the body text a sturdier text cut, from one family. That is why I chose it.",
    },
    {
      type: "p",
      text: "It is also why one fallback cannot match it. Times New Roman has no optical sizes, so the width ratio between the two changes with size. I measured Newsreader at about 2% wider than Times at lede size, 5.5% at body size and 9% at display size. A single `size-adjust` can be right at one of those sizes and wrong at the other two.",
    },

    { type: "h", text: "How it showed up" },
    {
      type: "p",
      text: "With one `size-adjust`, the hero statement wrapped onto one more line when Newsreader arrived. On a slow network at 390 px that measured CLS 0.0064. That is under the site's own target of 0.02, but it is not zero, and the content under the statement moved on every slow first visit.",
    },
    {
      type: "p",
      text: "It reproduces wherever Times New Roman or a metric clone is installed. My Linux test machine at first had none, so the fallback face never matched there and the extra line did not reproduce. A fallback test only means something where the fallback font exists.",
    },

    { type: "h", text: "Three tiers and an italic" },
    {
      type: "p",
      text: "The fix is one fallback face per size tier, each with its own `size-adjust`: body at 105.5%, lede at 102.0% and display at 109.0%. The lede and display tiers are custom properties that start with Newsreader's own family name and then name their fallback:",
    },
    {
      type: "code",
      lang: "css",
      code: `/* the same face with a size-matched fallback (see the @font-face tiers);
   --nr-face is Newsreader's own family name, set on <html> in layout.tsx */
--serif-lede: var(--nr-face, newsreader), "Newsreader Fallback Lede", Georgia, serif;
--serif-display: var(--nr-face, newsreader), "Newsreader Fallback Display", Georgia, serif;`,
      caption: "src/app/globals.css, :root",
    },
    {
      type: "p",
      text: "`.t-lede` and the role line use the lede stack. `.t-display`, `.t-title` and the contact address use the display stack. Everything else keeps the body stack, which is the one `next/font` builds.",
    },
    {
      type: "p",
      text: "For that body stack I turned off the automatic fallback with `adjustFontFallback: false`. `next/font` derives a single roman fallback, so italics fell back to a synthesized oblique about 4% narrower than Newsreader's italic, and the right-aligned surname moved on swap. Both styles are declared in `globals.css` instead and named in the `fallback` option. Because `next/font` renames the family it generates, the layout reads the real name back and sets it on `<html>` for the other two stacks:",
    },
    {
      type: "code",
      lang: "tsx",
      code: `const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-roman.woff2", style: "normal", weight: "300 500" },
    { path: "./fonts/newsreader-italic.woff2", style: "italic", weight: "300 400" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  /* ... */
  adjustFontFallback: false,
  fallback: ["Newsreader Fallback", "Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
});

/* ... */
const newsreaderFace = (newsreader.style.fontFamily.split(",")[0] ?? "").trim();`,
      caption: "src/app/layout.tsx",
    },
    {
      type: "p",
      text: "The italic is its own case. It only appears at display sizes, so the font file is instanced with the italic's optical size pinned, and one value fits everywhere it is used. I matched it to the name as actually set, weight 380 and tracking `-0.035em`, rather than to a neutral sample, which gave `size-adjust: 103.2%`. The same italic face sits under all three tiers.",
    },

    { type: "h", text: "Divide the overrides by size-adjust" },
    {
      type: "p",
      text: "Width is half the match. The vertical metrics decide where the baseline sits in the line box, and if they differ the text moves vertically on swap even when no line breaks change. Newsreader's ascent is 1470 and its descent 530, in a 2000-unit em. `size-adjust` scales the overrides along with the glyphs, so each override is divided by the face's `size-adjust` to land back on Newsreader's own metrics:",
    },
    {
      type: "code",
      lang: "text",
      code: `ascent-override   = (1470 / 2000) / size-adjust
descent-override  = (530 / 2000) / size-adjust
line-gap-override = 0%

body     0.735 / 1.055 = 69.67%    0.265 / 1.055 = 25.12%
lede     0.735 / 1.020 = 72.06%    0.265 / 1.020 = 25.98%
display  0.735 / 1.090 = 67.43%    0.265 / 1.090 = 24.31%
italic   0.735 / 1.032 = 71.22%    0.265 / 1.032 = 25.68%`,
    },
    {
      type: "code",
      lang: "css",
      code: `@font-face {
  font-family: "Newsreader Fallback Display";
  font-style: normal;
  src: local("Times New Roman"), local("TimesNewRomanPSMT"), local("Liberation Serif"), local("Tinos");
  ascent-override: 67.43%;
  descent-override: 24.31%;
  line-gap-override: 0%;
  size-adjust: 109.0%;
}`,
      caption: "src/app/globals.css: the display tier",
    },
    {
      type: "p",
      text: "Liberation Serif and Tinos are metric clones of Times New Roman, so the same overrides hold on Linux and ChromeOS. They follow the Times names in every `src`. IBM Plex Mono gets the same treatment from Courier New, whose advance already matches Plex Mono's 0.6 em, so only its vertical metrics are overridden.",
    },

    { type: "h", text: "A generator bug that looked like font loading" },
    {
      type: "p",
      text: "I generated the override values with a small script rather than by hand. Its first version multiplied by 100 twice and produced `ascent-override: 7205%`: an ascent of about 72 em instead of 0.72.",
    },
    {
      type: "p",
      text: "With an ascent that large, the fallback's baseline sits far below where it belongs, so the text is drawn out of sight until Newsreader arrives. That looks like the browser blocking text while the font loads, the very thing `swap` exists to prevent. The cause was in the generated CSS, not the browser. With the extra multiplication gone, the values were right.",
    },

    { type: "h", text: "Results" },
    {
      type: "p",
      text: "With the font files delayed, CLS measured 0.00000 at every width from 320 to 1920 px. The hero statement now breaks the same way before and after the swap.",
    },

    { type: "h", text: "Trade-offs, and what I'd change" },
    {
      type: "p",
      text: "Three tiers is a compromise. The type sizes are fluid, set with `clamp()`, so a tier is matched at the sizes it was measured for and close at the rest. That was enough for this page. With more distinct sizes I would measure more tiers rather than stretch these.",
    },
    {
      type: "p",
      text: "The match depends on a local font. If none of the `local()` sources exists, the face does not load and the stack falls through to the next family (Georgia, for the lede and display tiers), unadjusted. That case can still shift, and I have not closed it.",
    },
    {
      type: "p",
      text: "I would test delayed fonts on a machine with Times New Roman from the start, and give the generator a sanity check on its output: an override far outside 0% to 200% is a bug, not a font.",
    },
  ],
};

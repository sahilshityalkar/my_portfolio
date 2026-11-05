import type { Post } from "../writing";

/**
 * Sources: src/components/TitleBlock.tsx; commits 955fd59 (LCP stops at the
 * first scroll or input; scripted scroll-throughs had read 5.5 s) and
 * 50d5a38 (CLS as the largest session window); docs/agency/REVIEW.md (the
 * fallback text that did not fit its slot).
 */
export const titleBlock: Post = {
  slug: "a-footer-that-measures-its-own-visit",
  title: "A footer that measures its own visit, honestly",
  dek: "My footer prints this visit's LCP, CLS and transfer size. The first version summed CLS and let LCP keep growing. What it takes to report your own Web Vitals truthfully.",
  date: "2026-11-05",
  tags: ["performance", "web vitals", "observability"],
  links: [{ label: "See it in the footer of the home page", href: "/#contact" }],
  body: [
    {
      type: "p",
      text: "The footer of my portfolio is a drafting title block, and one of its cells reads like this: `LCP 0.13 S · CLS 0.000 · TRANSFER 391 KB`. Those are not numbers I measured once and typed in. They are this visit, measured by the visitor's own browser while the page loads. If the page is slow for you, the footer says so.",
    },
    {
      type: "p",
      text: "That is a strong promise to make on a portfolio, so the numbers have to mean what the browser's own tools mean by them. My first version did not quite. Going back over it found two gaps, and both are worth knowing if you ever report Web Vitals from inside a page.",
    },

    { type: "h", text: "Three numbers, three observers" },
    {
      type: "p",
      text: "Largest Contentful Paint (LCP) is when the biggest piece of content in the first view finished painting. Cumulative Layout Shift (CLS) scores how much visible content moved without the user asking it to. Transfer is how many kilobytes the visit actually fetched. The first two come from `PerformanceObserver`; the third from Navigation and Resource Timing.",
    },
    {
      type: "p",
      text: "All three are read in an effect after hydration, with `buffered: true` so entries recorded before the component mounted are not lost. Nothing is published until the `load` event, and then in a single animation frame, so the numbers arrive together instead of flickering in one at a time.",
    },

    { type: "h", text: "LCP stops at the first input" },
    {
      type: "p",
      text: "The browser stops reporting new LCP candidates once the user interacts with the page, because anything painted after that is not the first view any more. My observer had no such rule. It took the last entry it received, whenever it arrived.",
    },
    {
      type: "p",
      text: "A scripted scroll through the page made the footer read 5.5 seconds. The cause: the contact section at the bottom sets my email address at display size, and when it was revealed it became the largest paint so far. A scripted scroll is not user input, so the browser kept sending candidates, and my footer kept believing them. With a real mouse wheel the same visit read 0.13 seconds.",
    },
    {
      type: "p",
      text: "The fix is to freeze LCP the moment the visitor scrolls, presses a pointer or presses a key, and to ignore any entry painted after that moment. Buffered entries that were painted earlier but delivered later still count:",
    },
    {
      type: "code",
      lang: "ts",
      caption: "src/components/TitleBlock.tsx",
      code: `let lcpUntil = Infinity;
const freeze = () => {
  lcpUntil = Math.min(lcpUntil, performance.now());
  /* ... remove the three listeners ... */
};
addEventListener("scroll", freeze, { passive: true, once: true });
addEventListener("pointerdown", freeze, { once: true });
addEventListener("keydown", freeze, { once: true });

const o = new PerformanceObserver((list) => {
  // buffered entries painted before the first input still count
  const last = list.getEntries().filter((e) => e.startTime < lcpUntil).at(-1);
  if (last) lcpMs = last.startTime;
  publish();
});
o.observe({ type: "largest-contentful-paint", buffered: true });`,
    },
    {
      type: "p",
      text: "Comparing `startTime` with the freeze time, instead of simply disconnecting the observer, matters on reload. A browser that restores your scroll position fires a scroll event early, sometimes before the buffered LCP entry has been delivered. Disconnecting there would lose the real reading; filtering by time keeps it.",
    },

    { type: "h", text: "CLS is a session window, not a total" },
    {
      type: "p",
      text: "My first CLS was a running sum of every layout shift without recent input. That is how the metric was first defined, but not how browsers report it today. Current CLS groups shifts into session windows: a window collects shifts that are less than one second apart, and it lasts at most five seconds. The score is the largest window, not the sum of all of them.",
    },
    {
      type: "p",
      text: "On a page that stays at zero the difference never shows. It shows on a long visit with a few small, unrelated shifts: a sum keeps growing for as long as the tab is open, while the session-window score stays at the worst single burst. A footer labelled CLS should mean what the browser means by CLS, so it now does:",
    },
    {
      type: "code",
      lang: "ts",
      caption: "src/components/TitleBlock.tsx",
      code: `for (const e of list.getEntries()) {
  if (e.hadRecentInput) continue;
  if (windowValue && e.startTime - windowLast < 1000 && e.startTime - windowStart < 5000) {
    windowValue += e.value;
  } else {
    windowValue = e.value;
    windowStart = e.startTime;
  }
  windowLast = e.startTime;
  shift = Math.max(shift ?? 0, windowValue);
}`,
    },
    {
      type: "p",
      text: "Shifts within 500 ms of a click, tap or key press carry `hadRecentInput` and are skipped, exactly as the browser skips them. That is also why the rest of the site is careful to move things with transforms during long gestures like a drag: a drag is not a discrete input, and anything that reflows during one would count.",
    },

    { type: "h", text: "Transfer, and what it cannot see" },
    {
      type: "p",
      text: "Transfer is the navigation's `transferSize` plus every resource's, read once after `load`, so it covers what the first view needed. It is an honest number with two known blind spots. A resource served from the cache reports 0 bytes, so a second visit reads lower than the first. And a cross-origin resource without a `Timing-Allow-Origin` header also reports 0. This site loads nothing from other origins, so only the first applies, and a returning visitor seeing a smaller number is seeing something true.",
    },

    { type: "h", text: "The footer must not move the page" },
    {
      type: "p",
      text: "A layout-shift readout that causes a layout shift would be its own punchline. The values are filled in after load, so each one sits in a fixed-width slot with tabular figures. Before measurement the slots hold middle dots; after, the digits replace them without changing the width.",
    },
    {
      type: "p",
      text: "Browsers that do not report an entry type get `n/a`, with the full explanation in a `title` attribute. The first version printed \"not reported here\", which was wider than its slot and reflowed the row in exactly the browsers that could not measure the reflow. And without JavaScript the whole \"This visit\" cell is hidden, because a placeholder that never fills is worse than no cell at all.",
    },

    { type: "h", text: "Why bother" },
    {
      type: "p",
      text: "Anyone can claim a fast site. A footer that measures each visit puts the claim where the reader can check it, on their own device and network, and it keeps me honest: every change since has had to keep layout shift at zero before it shipped. The cost is about a hundred lines and the discipline to make them mean what the browser means.",
    },
    {
      type: "p",
      text: "If I built it again, I would start from the definitions in the browser's documentation rather than from the metric's name. Both bugs came from implementing what \"largest paint\" and \"cumulative shift\" sound like instead of what they are.",
    },
  ],
};

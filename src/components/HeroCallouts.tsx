"use client";

import { useEffect, useRef } from "react";

/**
 * Measured at rest: three redline callouts on the hero, read from the live DOM
 * and canvas text metrics, the same way the Loupe measures. They update while
 * the window is resized, with no animation on the numbers: they just change,
 * which is the point. Decorative to assistive tech (aria-hidden) and invisible
 * to the Loupe (data-loupe-skip). Server-rendered with middle-dot placeholders
 * in fixed-width slots, faded in once fonts are ready and the first
 * measurement is in, so nothing moves when the real numbers arrive.
 */

/* ---------------------------------------------------- one shared scheduler */

const subs = new Set<() => void>();
let frame = 0;
let ro: ResizeObserver | null = null;
let fontsReady = false;

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    subs.forEach((fn) => fn());
  });
}

/** Run `fn` now-ish, after fonts load, and on every resize, coalesced in rAF. */
function onLayout(fn: () => void) {
  subs.add(fn);
  if (!ro) {
    ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    addEventListener("resize", schedule);
    const fonts = document.fonts;
    if (fonts) {
      fonts.ready.then(() => {
        fontsReady = true;
        schedule();
      });
    } else fontsReady = true;
  }
  schedule();
  return () => {
    subs.delete(fn);
    if (!subs.size && ro) {
      ro.disconnect();
      ro = null;
      removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

let canvas: CanvasRenderingContext2D | null = null;
const metrics = () => (canvas ??= document.createElement("canvas").getContext("2d"));
const fontOf = (cs: CSSStyleDeclaration) => `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

/** Fade in once there is something true to show. */
const ready = (el: HTMLElement) => {
  if (fontsReady && !el.hasAttribute("data-ready")) el.setAttribute("data-ready", "");
};

/* ---------------------------------------------------------------- CAP */

/**
 * A vertical dimension beside the first name, from cap line to baseline.
 * Render it inside an inline-block wrapper around the word (the text node
 * must be the wrapper's first child).
 */
export function CapCallout() {
  const ref = useRef<HTMLSpanElement>(null);
  const num = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const range = document.createRange();
    return onLayout(() => {
      const el = ref.current;
      const word = el?.parentElement;
      const text = word?.firstChild;
      const ctx = metrics();
      if (!el || !word || !text || text.nodeType !== Node.TEXT_NODE || !ctx || !num.current) return;
      if (getComputedStyle(el).display === "none") return;
      ctx.font = fontOf(getComputedStyle(word));
      const ascent = ctx.measureText("Hxg").fontBoundingBoxAscent;
      const cap = ctx.measureText("H").actualBoundingBoxAscent;
      range.selectNodeContents(text);
      const line = range.getClientRects()[0];
      if (!line) return;
      // the text's content box starts one font ascent above its baseline
      const baseline = line.top - word.getBoundingClientRect().top + ascent;
      el.style.setProperty("--cap-top", `${(baseline - cap).toFixed(2)}px`);
      el.style.setProperty("--cap-h", `${cap.toFixed(2)}px`);
      num.current.textContent = `${Math.round(cap)}`;
      ready(el);
    });
  }, []);

  return (
    <span ref={ref} aria-hidden="true" data-loupe-skip className="callout callout-cap">
      <span className="callout-label">
        Cap{" "}
        <span ref={num} className="callout-num min-w-[3ch] text-right">
          ···
        </span>{" "}
        px
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------- MEASURE */

/**
 * A horizontal dimension under a paragraph, spanning its widest rendered
 * line. Render it as the last child of the (relatively positioned) paragraph.
 */
export function MeasureCallout() {
  const ref = useRef<HTMLSpanElement>(null);
  const chars = useRef<HTMLSpanElement>(null);
  const px = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const range = document.createRange();
    return onLayout(() => {
      const el = ref.current;
      const p = el?.parentElement;
      const ctx = metrics();
      if (!el || !p || !ctx || !chars.current || !px.current) return;
      if (getComputedStyle(el).display === "none") return;
      // every line box of the paragraph's own text, grouped into rendered lines
      const lines = new Map<number, [number, number]>();
      for (const n of p.childNodes) {
        if (n.nodeType !== Node.TEXT_NODE) continue;
        range.selectNodeContents(n);
        for (const r of range.getClientRects()) {
          if (r.width < 1) continue;
          const k = Math.round(r.top);
          const [l, rt] = lines.get(k) ?? [r.left, r.right];
          lines.set(k, [Math.min(l, r.left), Math.max(rt, r.right)]);
        }
      }
      let widest: [number, number] | null = null;
      for (const span of lines.values()) if (!widest || span[1] - span[0] > widest[1] - widest[0]) widest = span;
      if (!widest) return;
      const box = p.getBoundingClientRect();
      const w = widest[1] - widest[0];
      ctx.font = fontOf(getComputedStyle(p));
      const zero = ctx.measureText("0").width || 1;
      el.style.setProperty("--m-left", `${(widest[0] - box.left).toFixed(2)}px`);
      el.style.setProperty("--m-w", `${w.toFixed(2)}px`);
      chars.current.textContent = `${Math.round(w / zero)}`;
      px.current.textContent = `${Math.round(w)}`;
      ready(el);
    });
  }, []);

  return (
    <span ref={ref} aria-hidden="true" data-loupe-skip className="callout callout-measure">
      <span className="callout-label">
        Measure{" "}
        <span ref={chars} className="callout-num min-w-[2ch] text-right">
          ··
        </span>{" "}
        ch ·{" "}
        <span ref={px} className="callout-num min-w-[3ch] text-right">
          ···
        </span>{" "}
        px
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------- SHEET */

/** The sheet this page is being drawn on: the viewport, in CSS px, and its density. */
export function SheetCallout({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const w = useRef<HTMLSpanElement>(null);
  const h = useRef<HTMLSpanElement>(null);
  const dpr = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      onLayout(() => {
        const el = ref.current;
        if (!el || !w.current || !h.current || !dpr.current) return;
        w.current.textContent = `${innerWidth}`;
        h.current.textContent = `${innerHeight}`;
        dpr.current.textContent = `${Number((devicePixelRatio || 1).toFixed(2))}`;
        ready(el);
      }),
    [],
  );

  return (
    <span ref={ref} aria-hidden="true" data-loupe-skip className={`callout callout-sheet ${className}`}>
      Viewport{" "}
      <span ref={w} className="callout-num min-w-[4ch] text-right">
        ····
      </span>{" "}
      ×{" "}
      <span ref={h} className="callout-num min-w-[4ch]">
        ····
      </span>{" "}
      · DPR{" "}
      <span ref={dpr} className="callout-num min-w-[4ch]">
        ·
      </span>
    </span>
  );
}

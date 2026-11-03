"use client";

import { useEffect, useRef } from "react";
import { Spring, springs } from "@/lib/spring";
import { balance, greedy } from "@/lib/measure";
import { inspect } from "@/lib/store";

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
 * must be the wrapper's first child). It carries no text of its own.
 */
export function CapCallout() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const range = document.createRange();
    return onLayout(() => {
      const el = ref.current;
      const word = el?.parentElement;
      const text = word?.firstChild;
      const ctx = metrics();
      if (!el || !word || !text || text.nodeType !== Node.TEXT_NODE || !ctx) return;
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
      // an attribute, drawn by CSS: the h1's text stays exactly the name
      el.dataset.cap = `${Math.round(cap)}`;
      ready(el);
    });
  }, []);

  // The label is generated content (see .callout-cap::after), not text, so
  // the heading's textContent, reader mode and copy-paste get only the name.
  return <span ref={ref} aria-hidden="true" data-loupe-skip data-cap="···" className="callout callout-cap" />;
}

/* ---------------------------------------------------------------- MEASURE */

/**
 * A horizontal dimension under a paragraph: its measure, the line length it
 * is set to. Render it as the last child of the (relatively positioned)
 * paragraph.
 *
 * Its end is a handle: drag it (or focus it and use the arrow keys) and the
 * paragraph is re-set live at the new measure, then springs back on release.
 * Reflowing the real text during a drag would move the page (a drag is not a
 * discrete input, so the browser counts it as layout shift), so while the
 * measure is live the DOM text keeps its place, invisible, and the paragraph
 * is drawn on a canvas instead, broken into lines by the same rules
 * (src/lib/measure.ts) with the same font metrics. Nothing in the layout
 * moves: the footer's CLS stays at 0.000 while you play with it.
 */
export function MeasureCallout() {
  const ref = useRef<HTMLSpanElement>(null);
  const chars = useRef<HTMLSpanElement>(null);
  const px = useRef<HTMLSpanElement>(null);
  const handle = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return onLayout(() => {
      const el = ref.current;
      const p = el?.parentElement;
      const ctx = metrics();
      if (!el || !p || !ctx || !chars.current || !px.current) return;
      if (getComputedStyle(el).display === "none") return;
      // the measure is the paragraph's own width as set (its line length
      // limit), the same quantity the handle drags
      const box = p.getBoundingClientRect();
      ctx.font = fontOf(getComputedStyle(p));
      const zero = ctx.measureText("0").width || 1;
      el.style.setProperty("--m-left", "0px");
      el.style.setProperty("--m-w", `${box.width.toFixed(2)}px`);
      chars.current.textContent = `${Math.round(box.width / zero)}`;
      px.current.textContent = `${Math.round(box.width)}`;
      handle.current?.setAttribute("aria-valuenow", `${Math.round(box.width / zero)}`);
      ready(el);
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    const p = el?.parentElement;
    const knob = handle.current;
    const hero = p?.closest("section");
    if (!el || !p || !knob || !hero) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const PAD = 160; // canvas room left of the paragraph, for a centred label on a short measure
    const W = new Spring(0, springs.aperture);
    let canvas: HTMLCanvasElement | null = null;
    let c: CanvasRenderingContext2D | null = null;
    let live = false;
    let raf = 0;
    let last = 0;
    // geometry and type, read once when the measure goes live
    let w0 = 0; // the paragraph's own measure (its box width)
    let minW = 0;
    let maxW = 0;
    let lh = 0;
    let rest = 0; // line count at rest
    let zero = 1;
    let ascent = 0;
    let half = 0;
    let tops: number[] = []; // every resting line's content top, from the DOM
    let dpr = 1;
    let pTop = 0; // the paragraph's page position: the DOM snaps baselines there
    let below: HTMLElement[] = []; // rows set under the paragraph (phones, tablets)
    let knobX = 0; // the handle's laid-out x, relative to the paragraph
    let dimY = 0; // the dimension's laid-out y at rest, relative to the paragraph
    let words: string[] = [];
    let measure: (s: string) => number = () => 0;
    let colors = { ink: "", ink2: "", ink3: "", mark: "", paper: "" };
    let mono = "";
    let font = "";
    let tracking = "0px";

    const read = () => {
      const cs = getComputedStyle(p);
      const box = p.getBoundingClientRect();
      w0 = box.width;
      lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3;
      words = [...p.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent ?? "")
        .join("")
        .trim()
        .split(/\s+/);
      const root = getComputedStyle(document.documentElement);
      colors = {
        ink: cs.color,
        ink2: root.getPropertyValue("--ink-2").trim(),
        ink3: root.getPropertyValue("--ink-3").trim(),
        mark: root.getPropertyValue("--mark").trim(),
        paper: root.getPropertyValue("--paper").trim(),
      };
      mono = `400 10px ${root.getPropertyValue("--mono")}`;

      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = "measure-live";
        canvas.setAttribute("aria-hidden", "true");
        canvas.setAttribute("data-loupe-skip", "");
        p.appendChild(canvas);
      }
      // room for the widest allowed measure and a few extra lines
      const right = hero.querySelector<HTMLElement>("[data-spec=Contact]");
      const rr = right?.getBoundingClientRect();
      const wrap = hero.querySelector<HTMLElement>(".wrap")?.getBoundingClientRect();
      let limit = (wrap?.right ?? innerWidth) - box.left;
      // beside the contact column (wide screens), stop short of its text
      if (rr && rr.top < box.bottom && rr.bottom > box.top) {
        let textLeft = rr.right;
        for (const a of right!.querySelectorAll("a")) textLeft = Math.min(textLeft, a.getBoundingClientRect().left);
        limit = Math.min(limit, textLeft - box.left - 40);
      }
      maxW = Math.max(w0, limit);
      dpr = Math.min(devicePixelRatio || 1, 2);
      const cw = maxW + PAD * 2;
      const ch = el.offsetTop + lh * 3 + 24;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      canvas.style.left = `${-PAD}px`;
      c = canvas.getContext("2d");
      if (!c) return;
      c.setTransform(dpr, 0, 0, dpr, PAD * dpr, 0);
      font = fontOf(cs);
      tracking = cs.letterSpacing;
      c.font = font;
      c.fontKerning = "normal";
      if ("letterSpacing" in c) (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = tracking;
      const fm = c.measureText("Hg");
      ascent = fm.fontBoundingBoxAscent;
      half = (lh - (fm.fontBoundingBoxAscent + fm.fontBoundingBoxDescent)) / 2;
      // Each resting line where the DOM laid it out (its content box top;
      // the baseline is that plus the font's ascent), so the hand-off
      // between DOM and canvas does not move the text by a pixel. Line boxes
      // are placed in 1/64px units, so lh times i drifts on the third line.
      tops = [];
      for (const n of p.childNodes) {
        if (n.nodeType !== Node.TEXT_NODE) continue;
        const r = document.createRange();
        r.selectNodeContents(n);
        for (const rect of r.getClientRects()) {
          const t = rect.top - box.top;
          if (rect.width > 1 && !tops.some((v) => Math.abs(v - t) < 2)) tops.push(t);
        }
      }
      tops.sort((x, y) => x - y);
      if (!tops.length) tops = [half];
      pTop = box.top + scrollY;
      // rows laid out under the paragraph step down with its extra lines
      below = [...document.querySelectorAll<HTMLElement>("[data-measure-yield]")].filter(
        (n) => n.getBoundingClientRect().top >= box.bottom - 1,
      );
      zero = c.measureText("0").width || 1;
      const cache = new Map<string, number>();
      const ctx = c;
      measure = (s) => {
        let v = cache.get(s);
        if (v === undefined) cache.set(s, (v = ctx.measureText(s).width));
        return v;
      };
      rest = balance(words, w0, measure).length;
      // never more than two lines beyond the paragraph's own; everything
      // laid out below it (the rows under it on narrow screens, and the Work
      // section) steps down by transform and steps back on release
      minW = Math.max(zero * 10, w0 * 0.4);
      while (minW < w0 && greedy(words, minW, measure).length > rest + 2) minW += zero;
      knobX = parseFloat(el.style.getPropertyValue("--m-left") || "0") + parseFloat(el.style.getPropertyValue("--m-w") || "0");
      dimY = el.offsetTop;
    };

    const draw = () => {
      if (!c || !canvas) return;
      const width = W.value;
      // the paragraph's own type first: line breaking measures with it
      c.font = font;
      if ("letterSpacing" in c) (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = tracking;
      const lines = balance(words, width, measure);
      c.clearRect(-PAD - 1, -1, maxW + PAD * 2 + 2, canvas.height + 2);
      // the paragraph, set at the live measure
      c.fillStyle = colors.ink;
      c.textBaseline = "alphabetic";
      // every baseline snapped to device pixels in page space, as the DOM
      // snaps them (the paragraph itself sits at a fractional position)
      const last = tops.length - 1;
      lines.forEach((line, i) => {
        const t = i <= last ? tops[i]! : (tops[last] ?? 0) + (i - last) * lh;
        // at 1x the DOM snaps baselines to whole pixels in page space; on
        // dense screens it places them as laid out
        const y = dpr < 2 ? Math.round(pTop + t + ascent) - pTop : t + ascent;
        c!.fillText(line, 0, y);
      });
      // the dimension under it: the measure as set, with its ticks
      const y = dimY + (lines.length - rest) * lh;
      c.fillStyle = colors.mark;
      c.fillRect(0, y + 2, width, 1);
      c.fillRect(0, y, 1, 5);
      c.fillRect(width - 1, y, 1, 5);
      // label: MEASURE n CH · n PX · n LINES, numbers a step darker
      c.font = mono;
      if ("letterSpacing" in c) (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0.4px";
      const parts: [string, string][] = [
        ["MEASURE ", colors.ink3],
        [`${Math.round(width / zero)}`, colors.ink2],
        [" CH · ", colors.ink3],
        [`${Math.round(width)}`, colors.ink2],
        [" PX · ", colors.ink3],
        [`${lines.length}`, colors.ink2],
        [lines.length === 1 ? " LINE" : " LINES", colors.ink3],
      ];
      const tw = parts.reduce((a, [t]) => a + c!.measureText(t).width, 0);
      // centred on the dimension, or beside the handle once the measure is
      // too short to hold it
      let x = tw + 24 < width ? width / 2 - tw / 2 : width + 16;
      // the design measure stays marked on the dimension line, so the way
      // back is visible without a guide running through the text (and not
      // through the label either)
      if (w0 < x - 8 || w0 > x + tw + 8) {
        c.fillStyle = colors.mark;
        c.globalAlpha = 0.6;
        c.fillRect(w0 - 0.5, y - 6, 1, 17);
        c.globalAlpha = 1;
      }
      c.fillStyle = colors.paper;
      c.fillRect(x - 6, y - 4, tw + 12, 13);
      c.textBaseline = "middle";
      for (const [t, col] of parts) {
        c.fillStyle = col;
        c.fillText(t, x, y + 3);
        x += c.measureText(t).width;
      }
      // the handle rides the end of the dimension, by transform only
      const extra = Math.max(0, lines.length - rest) * lh;
      knob.style.transform = `translate3d(${(width - knobX).toFixed(2)}px, ${((lines.length - rest) * lh).toFixed(2)}px, 0)`;
      // by transform, so they never count as layout shift
      for (const n of below) n.style.translate = extra ? `0 ${extra.toFixed(2)}px` : "";
      knob.setAttribute("aria-valuenow", `${Math.round(width / zero)}`);
      knob.setAttribute("aria-valuetext", `${Math.round(width / zero)} characters wide, ${lines.length} lines`);
    };

    const start = () => {
      if (live) return;
      read();
      if (!c) return;
      live = true;
      W.snap(W.value > 0 && raf ? W.value : w0);
      knob.setAttribute("aria-valuemin", `${Math.round(minW / zero)}`);
      knob.setAttribute("aria-valuemax", `${Math.round(maxW / zero)}`);
      hero.setAttribute("data-measuring", "");
      el.classList.add("is-live");
      p.classList.add("is-measured");
      draw();
    };

    const finish = () => {
      live = false;
      cancelAnimationFrame(raf);
      raf = 0;
      hero.removeAttribute("data-measuring");
      for (const n of below) n.style.translate = "";
      el.classList.remove("is-live");
      p.classList.remove("is-measured");
      knob.style.transform = "";
      knob.setAttribute("aria-valuenow", `${Math.round(w0 / zero)}`);
      knob.removeAttribute("aria-valuetext");
      c?.clearRect(-PAD - 1, -1, maxW + PAD * 2 + 2, (canvas?.height ?? 0) + 2);
    };

    const tick = (t: number) => {
      const dt = last ? (t - last) / 1000 : 1 / 60;
      last = t;
      const moving = W.step(dt);
      draw();
      if (moving) raf = requestAnimationFrame(tick);
      else finish();
    };

    // let go: spring back to the design measure, then hand back to the DOM
    const release = () => {
      if (!live) return;
      W.target = w0;
      if (reduced.matches) {
        W.snap(w0);
        finish();
        return;
      }
      last = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    const set = (width: number) => {
      cancelAnimationFrame(raf);
      raf = 0;
      W.snap(Math.min(maxW, Math.max(minW, width)));
      draw();
    };

    let from = 0;
    let fromW = 0;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      knob.setPointerCapture(e.pointerId);
      // a deliberate act: the automatic glass demonstration gives way
      dispatchEvent(new Event("glass:yield"));
      if (inspect.get() !== "off") inspect.set("off");
      start();
      from = e.clientX;
      fromW = W.value;
    };
    const move = (e: PointerEvent) => {
      if (!live || !knob.hasPointerCapture(e.pointerId)) return;
      set(fromW + (e.clientX - from));
    };
    const up = (e: PointerEvent) => {
      if (knob.hasPointerCapture(e.pointerId)) knob.releasePointerCapture(e.pointerId);
      release();
    };
    const key = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 5 : 1;
      let next: number | null = null;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = -step;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = step;
      else if (e.key === "Home" || e.key === "End") next = 0;
      else if (e.key === "Escape" || e.key === "Enter") {
        if (live) {
          e.preventDefault();
          e.stopPropagation();
          release();
        }
        return;
      }
      if (next === null) return;
      e.preventDefault();
      start();
      if (e.key === "Home") set(minW);
      else if (e.key === "End") set(maxW);
      else set(W.value + next * zero);
    };

    knob.addEventListener("pointerdown", down);
    knob.addEventListener("pointermove", move);
    knob.addEventListener("pointerup", up);
    knob.addEventListener("pointercancel", up);
    knob.addEventListener("keydown", key);
    knob.addEventListener("blur", release);
    addEventListener("resize", release);
    // the glass and a live measure never share the stage
    const unsub = inspect.subscribe(() => {
      if (inspect.get() !== "off") release();
    });
    return () => {
      cancelAnimationFrame(raf);
      knob.removeEventListener("pointerdown", down);
      knob.removeEventListener("pointermove", move);
      knob.removeEventListener("pointerup", up);
      knob.removeEventListener("pointercancel", up);
      knob.removeEventListener("keydown", key);
      knob.removeEventListener("blur", release);
      removeEventListener("resize", release);
      unsub();
      canvas?.remove();
    };
  }, []);

  return (
    <span ref={ref} data-loupe-skip className="callout callout-measure">
      <span className="callout-label" aria-hidden="true">
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
      {/* the end of the dimension is a handle: drag the measure */}
      <span
        ref={handle}
        role="slider"
        tabIndex={0}
        aria-label="Measure of this paragraph. Drag or use the arrow keys to re-set it; it springs back on release."
        aria-orientation="horizontal"
        aria-valuemin={10}
        aria-valuemax={60}
        aria-valuenow={33}
        title="Drag to re-set this paragraph"
        className="measure-handle"
      />
      {/* the invitation, beside the handle, until the measure is taken up */}
      <span aria-hidden="true" className="measure-cue">
        Drag
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

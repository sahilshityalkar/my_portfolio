"use client";

import { useEffect, useRef, useState } from "react";
import { Spring, springs } from "@/lib/spring";
import { inspect, useStore, type InspectMode } from "@/lib/store";
import { EMPTY, measure, type Model } from "./glass/model";
import { draw, drawLens, hatch, readMono, readPalette, type Frame, type Palette } from "./glass/draw";

/**
 * The Loupe: the site's signature.
 *
 * A glass that shows the page's own engineering drawing. Everything under it is
 * measured from the live DOM at runtime, nothing is pre-drawn:
 *
 *  - [data-spec="Name"]  component boxes: outline, padding hatch, W × H, sibling gaps
 *  - [data-spec-type]    letterforms re-drawn as outlines, with baseline, x-height
 *                        and cap-height measured by canvas text metrics
 *  - every other text node: its real line boxes, from Range.getClientRects()
 *  - [data-spec-grid]    the live column grid, read from computed grid tracks
 *
 * Drawn on a 2D canvas, clipped to a circle whose position and radius are
 * springs. "lens" follows the pointer; "full" floods the glass across the
 * viewport. As a lens the visible canvas is only a lens-sized window, fed
 * from a second, offscreen canvas holding the scene, which is redrawn only
 * when the page scrolls, resizes, is remeasured, re-themed or refocused.
 * Nothing is measured while the glass is closed, and the loop sleeps
 * whenever nothing moves.
 */

/* ------------------------------------------------------------------ component */

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
const isInteractive = (t: EventTarget | null) =>
  t instanceof Element && !!t.closest("a,button,input,textarea,select,label,summary,[role=button],[data-loupe-skip]");

export function Loupe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = useStore(inspect, "off");
  const [hud, setHud] = useState({ fps: 0, nodes: 0 });
  const [visible, setVisible] = useState(false);
  const fpsRef = useRef(0);

  // the HUD's frame rate, twice a second, only while the glass is showing
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setHud((h) => (h.fps === fpsRef.current ? h : { ...h, fps: fpsRef.current })), 500);
    return () => clearInterval(t);
  }, [visible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    const lensRadius = () => Math.round(Math.min(190, Math.max(120, Math.min(innerWidth, innerHeight) * 0.2)));

    let dpr = Math.min(devicePixelRatio || 1, 2);
    // clientWidth excludes the scrollbar, so labels never tuck under it
    let W = document.documentElement.clientWidth;
    let H = innerHeight;
    readMono();
    let palette = readPalette();
    let pattern: CanvasPattern | null = null;
    let model: Model = EMPTY;
    let stale = true;
    let current: InspectMode = inspect.get();

    const px = new Spring(W / 2, springs.glass);
    const py = new Spring(H / 2, springs.glass);
    const radius = new Spring(0, springs.aperture);
    const scan = new Spring(0, springs.flood);

    let pointer = { x: W / 2, y: H / 2, seen: false };
    let raf = 0;
    let last = 0;
    let frameAvg = 16.7;
    let slowFrames = 0;
    let dirty = true;
    let focusGen = 0; // bumps on every focus change: the cached scene draws the ring
    const inUse = () => current !== "off" || radius.value > 0.5 || scan.value > 0.001;

    /* The canvas is a window. Flooded (or scanning on touch) it covers the
       viewport; as a lens it is only as big as the lens and its readout,
       moved by transform, and the drawing is offset to match, so every
       routine below still works in viewport coordinates. Rasterising a
       full-viewport canvas every frame for a 380px lens was most of the
       frame on a slow CPU. */
    let small = false;
    let box = 0; // the small window's side, CSS px
    // the scene behind the lens, rendered only when something it shows changes
    const scene = document.createElement("canvas");
    const sctx = scene.getContext("2d");
    let sceneKey = "";
    let sceneModel: Model | null = null;
    let scenePalette: Palette | null = null;
    const windowFor = () => {
      const r = lensRadius();
      // the aperture spring overshoots a little; the readout hangs below
      return Math.ceil(r * 2.3 + 64);
    };
    const size = (w: number, h: number) => {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    const layout = (toSmall: boolean) => {
      small = toSmall;
      if (small) {
        box = windowFor();
        size(box, box);
      } else {
        size(W, H);
        canvas.style.transform = "";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    // place the small window around the lens; returns the drawing offset
    const place = (cx: number, cy: number) => {
      const bx = Math.round(cx - box / 2);
      const by = Math.round(cy - box / 2 + 16);
      canvas.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
      ctx.setTransform(dpr, 0, 0, dpr, -bx * dpr, -by * dpr);
    };

    // While the glass is closed nothing is measured or allocated: a resize
    // (a phone's URL bar hides on every scroll) only marks the work as due.
    let laidOut = false;
    const resize = () => {
      W = document.documentElement.clientWidth;
      H = innerHeight;
      stale = true;
      laidOut = false;
      if (!inUse()) return;
      layout(small);
      laidOut = true;
      pattern = hatch(ctx, palette.mark, dpr);
      kick();
    };

    const remeasure = () => {
      model = measure(ctx);
      stale = false;
      setHud((h) => ({ ...h, nodes: model.boxes.length + model.types.length + model.lines.length }));
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? (now - last) / 1000 : 1 / 60;
      last = now;
      frameAvg += (dt * 1000 - frameAvg) * 0.1;
      fpsRef.current = Math.round(1000 / frameAvg);

      // adaptive quality: sustained slow frames drop resolution and hatching
      if (frameAvg > 24 && dpr > 1) {
        if (++slowFrames > 40) {
          dpr = 1;
          slowFrames = 0;
          resize();
        }
      } else slowFrames = 0;

      if (!laidOut) {
        layout(small);
        laidOut = true;
        pattern = hatch(ctx, palette.mark, dpr);
      }
      if (stale) remeasure();

      const snap = reduced.matches;
      let moving = false;
      for (const s of [px, py, radius, scan]) {
        if (snap) s.snap(s.target);
        else moving = s.step(dt) || moving;
      }

      // lens or full window: a lens that has opened past its own size is
      // flooding, so it needs the whole viewport
      const wantSmall = !coarse.matches && current !== "full" && radius.value <= lensRadius() * 1.12;
      if (wantSmall !== small) layout(wantSmall);
      if (small) place(px.value, py.value);

      const frame: Frame = {
        ctx,
        W,
        H,
        cx: px.value,
        cy: py.value,
        r: radius.value,
        reveal: scan.value,
        scan: coarse.matches,
        p: palette,
        hatch: pattern,
        model,
        fps: Math.round(1000 / frameAvg),
      };
      if (small && sctx) {
        // re-render the scene only when what it shows has changed
        const key = `${scrollX},${scrollY},${W},${H},${dpr},${focusGen}`;
        if (key !== sceneKey || model !== sceneModel || palette !== scenePalette) {
          if (scene.width !== Math.round(W * dpr) || scene.height !== Math.round(H * dpr)) {
            scene.width = Math.round(W * dpr);
            scene.height = Math.round(H * dpr);
          }
          sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          // a lens wider than the viewport: the whole scene, no culling, no rim
          draw({ ...frame, ctx: sctx, cx: W / 2, cy: H / 2, r: Math.hypot(W, H) * 2, scan: false, reveal: 1 });
          sceneKey = key;
          sceneModel = model;
          scenePalette = palette;
        }
        drawLens(frame, scene);
      } else {
        draw({ ...frame, hatch: frameAvg < 20 ? pattern : null });
      }
      dirty = false;

      if (current === "off" && radius.value < 0.5 && scan.value <= 0.001) {
        setVisible(false);
        last = 0;
        return;
      }
      if (moving || dirty) kick();
      else last = 0;
    };

    function kick() {
      dirty = true;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    const apply = (m: InspectMode) => {
      const prev = current;
      current = m;
      const full = Math.hypot(W, H) + 40;
      if (m !== "off") {
        setVisible(true);
        // everything waiting to be revealed is revealed, so the drawing matches the page
        document.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-in", ""));
        stale = true;
      }
      if (coarse.matches) {
        scan.target = m === "off" ? 0 : 1;
      } else if (m === "lens") {
        if (prev === "off") {
          const at = pointer.seen ? pointer : { x: W * 0.62, y: H * 0.5 };
          px.snap(at.x);
          py.snap(at.y);
        }
        radius.config = prev === "full" ? springs.flood : springs.aperture;
        radius.target = lensRadius();
      } else if (m === "full") {
        radius.config = springs.flood;
        radius.target = full;
      } else {
        radius.config = springs.aperture;
        radius.target = 0;
      }
      kick();
    };

    /* ---- the one-time demonstration ----
       On a first visit, once the name has inked and the visitor is still, the
       glass crosses the surname by itself. Moving the mouse hands it over;
       scrolling or a key closes it. Never on touch or with reduced motion. */
    let demo: { from: { x: number; y: number }; timers: number[] } | null = null;
    const endDemo = (close: boolean) => {
      if (!demo) return;
      demo.timers.forEach(clearTimeout);
      demo = null;
      if (close && current === "lens") inspect.set("off");
    };
    const demoTimer = window.setTimeout(() => {
      if (!matchMedia("(pointer: fine)").matches || reduced.matches || current !== "off" || window.scrollY > 40) return;
      // only on the home page, with the surname on screen; the once-per-session
      // flag is spent only when the demonstration actually runs
      const word = document.querySelector<HTMLElement>("#intro-title .mask-line:nth-child(2) > span")?.firstChild;
      if (!word) return;
      const r = document.createRange();
      r.selectNodeContents(word);
      const b = r.getBoundingClientRect();
      if (b.width < 50 || b.bottom < 0 || b.top > H) return;
      try {
        if (sessionStorage.getItem("glass-demo")) return;
        sessionStorage.setItem("glass-demo", "1");
      } catch {
        return;
      }
      const y = b.top + b.height * 0.55;
      const at = (f: number) => b.left + b.width * f;
      demo = { from: { ...pointer }, timers: [] };
      pointer = { x: at(0.12), y, seen: true };
      inspect.set("lens");
      const step = (ms: number, f: number) =>
        demo?.timers.push(
          window.setTimeout(() => {
            if (!demo) return;
            px.target = at(f);
            py.target = y;
            kick();
          }, ms),
        );
      step(500, 0.42);
      step(1300, 0.72);
      step(2100, 0.9);
      demo.timers.push(window.setTimeout(() => endDemo(true), 3300));
    }, 3600);

    const onMove = (e: PointerEvent) => {
      if (demo) {
        // a deliberate move takes the glass over; a nudge doesn't
        if (Math.hypot(e.clientX - demo.from.x, e.clientY - demo.from.y) < 24) return;
        endDemo(false);
      }
      pointer = { x: e.clientX, y: e.clientY, seen: true };
      if (current === "lens") {
        px.target = e.clientX;
        py.target = e.clientY;
        kick();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (demo) endDemo(e.key.toLowerCase() !== "l" && e.key !== "Escape");
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" && current !== "off") inspect.set("off");
      else if (e.key.toLowerCase() === "l") inspect.set(current === "off" ? "lens" : "off");
    };

    const onClick = (e: MouseEvent) => {
      if (coarse.matches || isInteractive(e.target)) return;
      if (current === "lens") {
        px.target = e.clientX;
        py.target = e.clientY;
        inspect.set("full");
      } else if (current === "full") {
        px.snap(e.clientX);
        py.snap(e.clientY);
        inspect.set("lens");
      }
    };

    // keyboard users: the glass travels to whatever has focus
    const onFocus = (e: FocusEvent) => {
      focusGen++;
      if (current === "off" || !(e.target instanceof Element)) return;
      if (current === "lens") {
        const r = e.target.getBoundingClientRect();
        px.target = r.left + r.width / 2;
        py.target = r.top + r.height / 2;
      }
      kick(); // repaint the focus ring
    };

    // focus leaving for nothing (to the body) must also clear the drawn ring
    const onBlur = () => {
      focusGen++;
      if (current !== "off") kick();
    };

    // another interaction on the page (dragging the hero's measure) wants the stage
    const onYield = () => {
      clearTimeout(demoTimer);
      endDemo(true);
    };

    const onScroll = () => {
      if (demo) endDemo(true);
      if (current !== "off") kick();
    };
    // transitions end in bursts (a reveal, a row of underlines): one remeasure
    // after the burst, not one per event
    let settle = 0;
    // a link's colour or underline ending changes nothing the glass draws
    const GEOMETRY = /^(transform|translate|scale|rotate|width|height|inset|top|left|right|bottom|margin|padding|font|letter-spacing|line-height|max-width|grid)/;
    const onSettle = (e?: Event) => {
      if (current === "off") return;
      if (e instanceof TransitionEvent && !GEOMETRY.test(e.propertyName)) return;
      if ((e instanceof TransitionEvent || e instanceof AnimationEvent) && e.target instanceof Element && e.target.closest("a, button")) return;
      clearTimeout(settle);
      settle = window.setTimeout(() => {
        stale = true;
        kick();
      }, 120);
    };
    // a code block scrolled sideways moves its text, but its scroll event
    // never reaches the window: listen in the capture phase and re-measure
    // once the scroll settles
    const onInnerScroll = (e: Event) => {
      if (current === "off" || e.target === document) return;
      clearTimeout(settle);
      settle = window.setTimeout(() => {
        stale = true;
        kick();
      }, 120);
    };
    const onTheme = new MutationObserver(() => {
      palette = readPalette();
      pattern = hatch(ctx, palette.mark, dpr);
      kick();
    });
    onTheme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const ro = new ResizeObserver(() => onSettle());
    ro.observe(document.body);
    document.fonts?.ready.then(() => onSettle());

    resize();
    const unsub = inspect.subscribe(() => apply(inspect.get()));
    if (current !== "off") apply(current);

    addEventListener("resize", resize);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onInnerScroll, { capture: true, passive: true });
    addEventListener("glass:yield", onYield);
    addEventListener("keydown", onKey);
    addEventListener("click", onClick);
    addEventListener("focusin", onFocus);
    addEventListener("focusout", onBlur);
    document.addEventListener("transitionend", onSettle);
    document.addEventListener("animationend", onSettle);

    return () => {
      clearTimeout(demoTimer);
      clearTimeout(settle);
      endDemo(false);
      removeEventListener("glass:yield", onYield);
      unsub();
      cancelAnimationFrame(raf);
      ro.disconnect();
      onTheme.disconnect();
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onInnerScroll, { capture: true });
      removeEventListener("keydown", onKey);
      removeEventListener("click", onClick);
      removeEventListener("focusin", onFocus);
      removeEventListener("focusout", onBlur);
      document.removeEventListener("transitionend", onSettle);
      document.removeEventListener("animationend", onSettle);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-loupe-skip
        className="pointer-events-none fixed inset-0 z-40"
        style={{ visibility: visible ? "visible" : "hidden" }}
      />
      {mode === "full" || (mode === "lens" && visible) ? (
        <div
          data-loupe-skip
          aria-hidden="true"
          className="t-meta pointer-events-none fixed inset-x-0 bottom-0 z-50 flex gap-4 border-t border-(--rule-strong) bg-paper px-(--gutter) py-2.5 tabular-nums text-ink-3 fade-in"
          style={{ ["--i" as string]: 0 }}
        >
          {/* a full-width paper strip along the bottom edge, so the status
              never prints over (or between) the page's own lines */}
          {/* one slot for both names: the flood must not move the readings */}
          <span className="inline-block min-w-[9ch] text-mark">{mode === "full" ? "Blueprint" : "Glass"}</span>
          <span className="hidden sm:inline">
            <span className="inline-block min-w-[3ch] text-right">{hud.nodes}</span> measured nodes
          </span>
          {/* a fixed slot: 99 to 120 fps must not move the text after it */}
          <span>
            <span className="inline-block min-w-[3ch] text-right">{hud.fps}</span> fps
          </span>
          <span className="hidden sm:[@media(pointer:fine)]:inline">
            {mode === "lens" ? "Click empty space to flood · Esc to close" : "Click to return · Esc to close"}
          </span>
          {/* touch: no Esc key, so say where the way out is */}
          <span className="[@media(pointer:fine)]:hidden">Tap the lens icon to close</span>
        </div>
      ) : null}
    </>
  );
}


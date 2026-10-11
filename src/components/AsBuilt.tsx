"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Spring, springs } from "@/lib/spring";
import { inspect } from "@/lib/store";

export type AsBuiltImage = { src: string; alt: string; url?: string };

/**
 * AS BUILT: the Loupe in reverse. The global glass turns the page into its
 * drawing; this small glass turns a plate's drawing into the shipped product.
 *
 * A circular clip over the real screenshot, whose centre and radius are
 * springs. Pointer (fine) hover opens a lens that snaps to the pointer on the
 * first frame and then follows it; the corner button (keyboard, touch) floods
 * it across the whole plate. Per frame, only three custom properties (feeding
 * clip-path) and two transforms are written: no layout reads, no React state.
 *
 * The screenshot is only mounted once the plate is in view after load, so it
 * costs nothing on first load. Without JS the drawing simply shows.
 */
export function AsBuilt({ src, alt, url }: AsBuiltImage) {
  const layerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLDivElement>(null);
  const floodRef = useRef<((on: boolean) => void) | null>(null);
  const [flooded, setFlooded] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const layer = layerRef.current;
    const ring = ringRef.current;
    const read = readRef.current;
    const fig = layer?.closest("figure");
    // the plate's column: the figure plus the full-cover case link above it
    const host = fig?.parentElement;
    if (!layer || !ring || !read || !fig || !host) return;

    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");

    // figure geometry in document coordinates, read once per open and on resize
    let w = 0;
    let h = 0;
    let left = 0;
    let top = 0;
    let readW = 0;
    let readH = 0;
    const measure = () => {
      const r = fig.getBoundingClientRect();
      w = r.width;
      h = r.height;
      left = r.left + scrollX;
      top = r.top + scrollY;
      readW = read.offsetWidth;
      readH = read.offsetHeight;
    };

    const x = new Spring(0, springs.glass);
    const y = new Spring(0, springs.glass);
    const r = new Spring(0, springs.aperture);
    let base = 1; // the ring's laid-out radius; it is scaled from this
    let inside = false;
    let flood = false;
    let client = { x: 0, y: 0 };

    const hoverR = () => Math.min(150, Math.max(84, w * 0.22));
    const floodR = () => Math.hypot(w, h) / 2 + 8;
    const local = () => ({ x: client.x + scrollX - left, y: client.y + scrollY - top });

    /** One style write per open, so the ring is exactly 1px at rest. */
    const setBase = (radius: number) => {
      base = Math.max(1, radius);
      ring.style.width = ring.style.height = `${base * 2}px`;
    };

    const paint = () => {
      const rv = Math.max(0, r.value);
      layer.style.setProperty("--x", `${x.value.toFixed(2)}px`);
      layer.style.setProperty("--y", `${y.value.toFixed(2)}px`);
      layer.style.setProperty("--r", `${rv.toFixed(2)}px`);
      const s = rv / base;
      // a ring much larger than its laid-out size would draw a thick border: hide it
      ring.style.opacity = rv >= 1 && s < 1.25 ? "1" : "0";
      ring.style.transform = `translate3d(${x.value - base}px, ${y.value - base}px, 0) scale(${s})`;
      let rx: number;
      let ry: number;
      if (flood) {
        rx = 12;
        ry = h - readH - 12;
      } else {
        rx = Math.min(Math.max(x.value - readW / 2, 8), w - readW - 8);
        ry = y.value + rv + 10;
        if (ry + readH > h - 8) ry = y.value - rv - 10 - readH;
      }
      read.style.opacity = rv >= 1 ? "1" : "0";
      read.style.transform = `translate3d(${Math.round(rx)}px, ${Math.round(ry)}px, 0)`;
    };

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = 0;
      const dt = last ? (now - last) / 1000 : 1 / 60;
      last = now;
      let moving = false;
      for (const s of [x, y, r]) {
        if (reduced.matches) s.snap(s.target);
        else moving = s.step(dt) || moving;
      }
      paint();
      if (moving) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const canHover = (e: PointerEvent) =>
      (e.pointerType === "mouse" || e.pointerType === "pen") && fine.matches && inspect.get() === "off";

    const enter = (e: PointerEvent) => {
      if (!canHover(e)) return;
      inside = true;
      setNear(true);
      if (flood) return;
      measure();
      client = { x: e.clientX, y: e.clientY };
      const p = local();
      // no pickup lag: the glass is already under the pointer on the first frame
      x.config = y.config = springs.glass;
      x.snap(p.x);
      y.snap(p.y);
      r.config = springs.aperture;
      setBase(hoverR());
      r.target = hoverR();
      paint();
      kick();
    };
    const move = (e: PointerEvent) => {
      if (!inside) return enter(e);
      client = { x: e.clientX, y: e.clientY };
      if (flood) return;
      const p = local();
      x.target = p.x;
      y.target = p.y;
      kick();
    };
    const leave = () => {
      inside = false;
      if (flood) return;
      r.config = springs.aperture;
      r.target = 0;
      kick();
    };

    // scrolling moves the plate under a still pointer: follow it, no layout read
    const onScroll = () => {
      if (!inside || flood) return;
      const p = local();
      if (p.x < 0 || p.y < 0 || p.x > w || p.y > h) return leave();
      x.target = p.x;
      y.target = p.y;
      kick();
    };

    const setFlood = (on: boolean) => {
      if (on === flood) return;
      measure();
      flood = on;
      if (on) {
        if (r.value < 1) {
          x.snap(w / 2);
          y.snap(h / 2);
        }
        x.config = y.config = r.config = springs.flood;
        x.target = w / 2;
        y.target = h / 2;
        setBase(floodR());
        r.target = floodR();
      } else {
        x.config = y.config = springs.glass;
        r.config = springs.aperture;
        if (inside && fine.matches) {
          const p = local();
          x.target = p.x;
          y.target = p.y;
          setBase(hoverR());
          r.target = hoverR();
        } else {
          r.target = 0;
        }
      }
      kick();
    };
    floodRef.current = setFlood;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !flood) return;
      setFlood(false);
      setFlooded(false);
    };

    const onResize = () => {
      if (r.value < 0.5 && r.target === 0) return;
      measure();
      if (flood) {
        x.target = w / 2;
        y.target = h / 2;
        setBase(floodR());
        r.target = floodR();
      }
      kick();
    };

    // the global glass and this one never compete: opening it closes AS BUILT
    const unsub = inspect.subscribe(() => {
      if (inspect.get() === "off") return;
      inside = false;
      if (flood) setFlooded(false);
      setFlood(false);
      r.target = 0;
      kick();
    });

    // fetch the screenshot only once the page has loaded and the plate is
    // actually in view (or on first intent: hover, or the toggle), so it never
    // competes with the first paint or counts toward the initial transfer
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) {
        setNear(true);
        io.disconnect();
      }
    });
    const watch = () => io.observe(fig);
    if (document.readyState === "complete") watch();
    else addEventListener("load", watch, { once: true });

    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      io.disconnect();
      removeEventListener("load", watch);
      floodRef.current = null;
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = () => {
    const next = !flooded;
    setNear(true);
    setFlooded(next);
    floodRef.current?.(next);
  };

  return (
    <>
      <div ref={layerRef} className="asbuilt absolute inset-0 z-20 pointer-events-none" data-loupe-skip aria-hidden={!flooded}>
        {near ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 768px) 56vw, 100vw"
            loading="lazy"
            className="object-cover object-top"
          />
        ) : null}
      </div>
      <div ref={ringRef} aria-hidden="true" data-loupe-skip className="asbuilt-ring absolute left-0 top-0 z-30 pointer-events-none rounded-full" />
      <div
        ref={readRef}
        aria-hidden="true"
        data-loupe-skip
        className="asbuilt-read t-meta absolute left-0 top-0 z-30 pointer-events-none whitespace-nowrap bg-paper px-1.5 py-0.5 text-[10px] text-ink-2"
      >
        <span className="text-mark">As built</span>
        {url ? (
          <>
            {" · "}
            <span className="normal-case tracking-normal">{url}</span>
          </>
        ) : null}
      </div>
      <button
        type="button"
        aria-pressed={flooded}
        onClick={toggle}
        className="asbuilt-toggle t-meta absolute right-0 top-0 z-40 grid h-8 items-center justify-items-center border-b border-l border-(--rule-strong) bg-paper px-3 text-ink transition-colors hover:border-mark sm:right-3 sm:top-3 sm:rounded-[2px] sm:border"
      >
        <span className={`col-start-1 row-start-1 ${flooded ? "invisible" : ""}`}>As built</span>
        <span className={`col-start-1 row-start-1 ${flooded ? "" : "invisible"}`}>Drawing</span>
      </button>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { section, useStore } from "@/lib/store";

const SECTIONS = [
  { id: "intro", n: "01", label: "Index" },
  { id: "work", n: "02", label: "Work" },
  { id: "experience", n: "03", label: "Experience" },
  { id: "lab", n: "04", label: "Lab" },
  { id: "about", n: "05", label: "About" },
  { id: "contact", n: "06", label: "Contact" },
];

/**
 * A drafting ruler down the right edge: the whole page mapped onto its length,
 * a tick for every section, and a bracket showing the slice you're looking at.
 * It also tracks the active section for the header. Desktop only; the bracket
 * follows scroll directly (no easing) so it always tells the truth.
 *
 * It is also the page's scrollbar: drag the bracket, or press anywhere on the
 * scale to jump there and keep dragging. While it is mounted on a wide screen
 * the native scrollbar is hidden (`html.ruler`, set before first paint by the
 * boot script so the page never changes width after load).
 */
export function Ruler() {
  const active = useStore(section, null);
  const root = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<{ id: string; n: string; label: string; at: number }[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;

    const measure = () => {
      const doc = document.documentElement.scrollHeight;
      setMarks(
        SECTIONS.flatMap((s) => {
          const node = document.getElementById(s.id);
          return node ? [{ ...s, at: (node.getBoundingClientRect().top + scrollY) / doc }] : [];
        }),
      );
      paint();
    };
    const paint = () => {
      raf = 0;
      const doc = document.documentElement.scrollHeight;
      el.style.setProperty("--top", String(scrollY / doc));
      el.style.setProperty("--h", String(innerHeight / doc));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    // ---- scrollbar behaviour ----
    const wide = matchMedia("(min-width: 1024px)");
    const syncClass = () => document.documentElement.classList.toggle("ruler", wide.matches);
    syncClass();
    wide.addEventListener("change", syncClass);

    let grab: number | null = null; // where on the bracket it was grabbed, as a fraction
    const fraction = (y: number) => {
      const r = el.getBoundingClientRect();
      return Math.min(1, Math.max(0, (y - r.top) / r.height));
    };
    const scrollToFraction = (f: number) => {
      const doc = document.documentElement.scrollHeight;
      window.scrollTo({ top: f * doc, behavior: "instant" });
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target instanceof Element && e.target.closest("a"))) return;
      e.preventDefault();
      const doc = document.documentElement.scrollHeight;
      const top = scrollY / doc;
      const h = innerHeight / doc;
      const f = fraction(e.clientY);
      // inside the bracket: drag from where it was grabbed; outside: centre it there
      grab = f >= top && f <= top + h ? f - top : h / 2;
      if (grab === h / 2) scrollToFraction(f - grab);
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
    };
    const onDrag = (e: PointerEvent) => {
      if (grab === null) return;
      scrollToFraction(fraction(e.clientY) - grab);
    };
    const onUp = (e: PointerEvent) => {
      grab = null;
      delete el.dataset.dragging;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onDrag);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    // the section whose body crosses the middle of the screen is "here"
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) section.set(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach((s) => {
      const node = document.getElementById(s.id);
      if (node) io.observe(node);
    });

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      wide.removeEventListener("change", syncClass);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onDrag);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      document.documentElement.classList.remove("ruler");
      section.set(null);
    };
  }, []);

  return (
    <nav
      aria-label="Page ruler"
      data-loupe-skip
      className="pointer-events-none fixed bottom-6 right-2 top-[calc(var(--header-h)+1.5rem)] z-30 hidden w-7 lg:block print:hidden"
    >
      <div
        ref={root}
        className="group pointer-events-auto relative h-full w-full cursor-pointer touch-none select-none data-[dragging]:cursor-grabbing"
      >
        {/* the scale: minor ticks every 8px, major every 64px */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-2 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--rule-strong) 0 1px, transparent 1px 8px), repeating-linear-gradient(to bottom, var(--ink-3) 0 1px, transparent 1px 64px)",
            backgroundSize: "6px 100%, 9px 100%",
            backgroundPosition: "right top, right top",
            backgroundRepeat: "repeat-y",
          }}
        />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-px bg-(--rule-strong)" />

        {/* the slice of the page in view */}
        <div
          aria-hidden="true"
          className="absolute right-0 w-3 cursor-grab border-y border-l border-mark bg-(--mark-soft) transition-[width] duration-300 group-hover:w-4 group-data-[dragging]:w-4 group-data-[dragging]:cursor-grabbing"
          style={{ top: "calc(var(--top, 0) * 100%)", height: "max(calc(var(--h, 0.1) * 100%), 10px)" }}
        />

        <ol>
          {marks.map((m) => {
            const here = m.id === active;
            return (
              <li key={m.id} className="absolute right-0 flex -translate-y-1/2 items-center" style={{ top: `${m.at * 100}%` }}>
                <a
                  href={`#${m.id}`}
                  aria-current={here ? "location" : undefined}
                  className="t-meta flex items-center gap-1.5 py-1 pl-2 text-[0.625rem] text-ink-3 transition-colors hover:text-ink aria-[current=location]:text-mark"
                >
                  <span className="pointer-events-none whitespace-nowrap bg-paper px-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {m.label}
                  </span>
                  <span className="bg-paper px-0.5">{m.n}</span>
                  <span aria-hidden="true" className={`block h-px bg-current ${here ? "w-4" : "w-2.5"} transition-[width] duration-500`} />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

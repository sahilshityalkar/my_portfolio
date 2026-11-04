"use client";

import { useEffect } from "react";

/**
 * One observer for the whole document. Elements marked [data-reveal] get
 * [data-in] when they first enter the viewport; CSS does the motion.
 *
 * Content must never stay hidden: anything already scrolled past (a fast
 * fling, a jump from the nav, a deep link, a throttled tab) is revealed at
 * once, and a scroll listener backs the observer up in case its callbacks
 * are delayed.
 */
export function RevealObserver() {
  useEffect(() => {
    // the boot script's failsafe stands down: the observer is here
    document.documentElement.dataset.revealReady = "1";
    document.documentElement.classList.add("js");
    const show = (el: Element) => el.setAttribute("data-in", "");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // in view, or already above the viewport: either way, show it
          if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
            show(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px", threshold: 0 },
    );

    const pending = () => document.querySelectorAll("[data-reveal]:not([data-in])");
    const observe = () => pending().forEach((el) => io.observe(el));

    // safety net: on scroll settle, reveal everything above the fold line
    let t = 0;
    const sweep = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const fold = innerHeight;
        pending().forEach((el) => {
          if (el.getBoundingClientRect().top < fold) {
            show(el);
            io.unobserve(el);
          }
        });
      }, 120);
    };

    // A deep link or a reload partway down: what is already on screen is
    // shown as it is, with no rise or draw-in (one frame without transitions),
    // so the first paint there is not held back by the reveal.
    if (scrollY > 40) {
      const root = document.documentElement;
      root.classList.add("reveal-instant");
      pending().forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) show(el);
      });
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("reveal-instant")));
    }

    observe();
    sweep();
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });
    addEventListener("scroll", sweep, { passive: true });
    addEventListener("hashchange", sweep);
    return () => {
      io.disconnect();
      mo.disconnect();
      clearTimeout(t);
      removeEventListener("scroll", sweep);
      removeEventListener("hashchange", sweep);
    };
  }, []);
  return null;
}

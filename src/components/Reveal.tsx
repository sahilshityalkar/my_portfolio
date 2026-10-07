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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    const pending = () => document.querySelectorAll("[data-reveal]:not([data-in])");
    const observe = () => pending().forEach((el) => io.observe(el));

    // safety net: on scroll settle, reveal everything above the fold line
    let t = 0;
    const sweep = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const fold = innerHeight * 0.92;
        pending().forEach((el) => {
          if (el.getBoundingClientRect().top < fold) {
            show(el);
            io.unobserve(el);
          }
        });
      }, 120);
    };

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

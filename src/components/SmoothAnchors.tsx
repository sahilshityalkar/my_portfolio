"use client";

import { useEffect } from "react";
import { Spring } from "@/lib/spring";

/**
 * In-page links (`#work`, `/#work`) glide to their section on the site's own
 * spring instead of jumping. Critically damped, so it never overshoots the
 * section, and it takes about the same time near or far. Any wheel, touch or
 * key input hands control straight back to the reader. Reduced motion jumps.
 */
const travel = { stiffness: 110, damping: 21 }; // ≈ 2·√k: critical damping

export function SmoothAnchors() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const glide = (to: number) => {
      stop();
      const y = new Spring(window.scrollY, travel);
      y.target = to;
      let last = 0;
      const tick = (now: number) => {
        const dt = last ? (now - last) / 1000 : 1 / 60;
        last = now;
        const moving = y.step(dt);
        window.scrollTo({ top: y.value, behavior: "instant" });
        raf = moving ? requestAnimationFrame(tick) : 0;
      };
      raf = requestAnimationFrame(tick);
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[href*='#']") : null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      e.preventDefault();
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const to = Math.min(max, Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset));

      if (location.hash !== url.hash) history.pushState(null, "", url.hash);
      // move focus for keyboard and screen-reader users without a second jump
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });

      if (reduced.matches) window.scrollTo({ top: to, behavior: "instant" });
      else glide(to);
    };

    const interrupt = () => raf && stop();
    document.addEventListener("click", onClick);
    addEventListener("wheel", interrupt, { passive: true });
    addEventListener("touchstart", interrupt, { passive: true });
    addEventListener("keydown", interrupt);
    return () => {
      stop();
      document.removeEventListener("click", onClick);
      removeEventListener("wheel", interrupt);
      removeEventListener("touchstart", interrupt);
      removeEventListener("keydown", interrupt);
    };
  }, []);

  return null;
}

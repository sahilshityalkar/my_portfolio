"use client";

import { useEffect } from "react";

/**
 * Code blocks render as labelled, focusable regions so a keyboard can scroll
 * a long line even without JavaScript. Once scripts run, only a block that
 * actually overflows keeps its tab stop, role and label; the rest would be
 * empty stops in the tab order and noise in the landmark list. Re-checked
 * whenever a block changes size.
 */
export function CodeFocus() {
  useEffect(() => {
    const blocks = [...document.querySelectorAll<HTMLElement>(".prose-code pre")];
    const check = (el: HTMLElement) => {
      if (el.scrollWidth > el.clientWidth + 1) {
        el.tabIndex = 0;
        el.setAttribute("role", "region");
        el.setAttribute("aria-label", el.dataset.label ?? "Code");
      } else {
        for (const a of ["tabindex", "role", "aria-label"]) el.removeAttribute(a);
      }
    };
    blocks.forEach(check);
    const ro = new ResizeObserver((entries) => entries.forEach((e) => check(e.target as HTMLElement)));
    blocks.forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, []);
  return null;
}

"use client";

import { useEffect } from "react";

/**
 * Code blocks render with tabIndex 0 so a keyboard can scroll a long line
 * even without JavaScript. Once scripts run, only a block that actually
 * overflows keeps its tab stop; the rest would be empty stops in the tab
 * order. Re-checked whenever a block changes size.
 */
export function CodeFocus() {
  useEffect(() => {
    const blocks = [...document.querySelectorAll<HTMLElement>(".prose-code pre")];
    const check = (el: HTMLElement) => {
      if (el.scrollWidth > el.clientWidth + 1) el.tabIndex = 0;
      else el.removeAttribute("tabindex");
    };
    blocks.forEach(check);
    const ro = new ResizeObserver((entries) => entries.forEach((e) => check(e.target as HTMLElement)));
    blocks.forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, []);
  return null;
}

"use client";

import { theme, type Theme } from "./store";

import { PAPER, THEME_KEY as KEY } from "./theme-boot";

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "night" ? "night" : "day";
}

/**
 * Change the light. Uses a View Transition when available so the new theme
 * washes across the old one; otherwise it switches instantly, which is fine.
 */
export function setTheme(next: Theme) {
  const root = document.documentElement;
  const apply = () => {
    root.dataset.theme = next;
    theme.set(next);
    // A choice made here outranks the OS preference that Next's theme-color
    // tags were written for. The first matching theme-color wins, so this one
    // (not React's, so hydration never sees it change) goes first in <head>.
    let meta = document.getElementById("theme-color") as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.id = "theme-color";
      document.head.prepend(meta);
    }
    meta.content = PAPER[next];
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };

  if (!document.startViewTransition) return apply();

  root.dataset.transition = next === "night" ? "dusk" : "dawn";
  const vt = document.startViewTransition(apply);
  vt.finished.finally(() => delete root.dataset.transition);
}

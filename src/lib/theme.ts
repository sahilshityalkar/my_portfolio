"use client";

import { theme, type Theme } from "./store";

const KEY = "theme";

/** Inline, render-blocking script: applies the saved theme before first paint. */
export const themeBootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('${KEY}');if(t==='night'||t==='day'){d.dataset.theme=t}}catch(e){}if(location.pathname==='/'&&matchMedia('(min-width: 1024px)').matches){d.classList.add('ruler')}})();`;

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
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  };

  if (!document.startViewTransition) return apply();

  root.dataset.transition = next === "night" ? "dusk" : "dawn";
  const vt = document.startViewTransition(apply);
  vt.finished.finally(() => delete root.dataset.transition);
}

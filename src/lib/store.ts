"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny observable store. The inspector and the theme are global UI states read
 * by several distant components (header, loupe, hero hint), which is exactly
 * the case for an external store rather than context re-rendering the tree.
 */
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next: T | ((prev: T) => T)) {
      const value = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      if (Object.is(value, state)) return;
      state = value;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

type Store<T> = ReturnType<typeof createStore<T>>;

export function useStore<T>(store: Store<T>, server: T): T {
  return useSyncExternalStore(store.subscribe, store.get, () => server);
}

/** off: normal page · lens: the glass follows the pointer · full: whole page is blueprint */
export type InspectMode = "off" | "lens" | "full";
export const inspect = createStore<InspectMode>("off");

export type Theme = "day" | "night";
export const theme = createStore<Theme>("day");

/** The home-page section currently in view (for the header and the ruler). */
export const section = createStore<string | null>(null);

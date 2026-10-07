"use client";

import { inspect, useStore } from "@/lib/store";

/** The invitation. Never required, always one keypress away. */
export function InspectHint() {
  const mode = useStore(inspect, "off");
  return (
    <button
      type="button"
      onClick={() => inspect.set(mode !== "off" ? "off" : matchMedia("(pointer: coarse)").matches ? "full" : "lens")}
      className="t-meta group flex max-w-[44ch] items-center gap-3 text-left text-ink-3 transition-colors hover:text-ink"
    >
      <span
        aria-hidden="true"
        className="relative grid size-8 shrink-0 place-items-center rounded-full border border-(--rule-strong) transition-[border-color,transform] duration-700 ease-(--ease-out) group-hover:scale-110 group-hover:border-mark"
      >
        <span className="size-1 rounded-full bg-mark" />
      </span>
      <span>
        {mode === "off" ? (
          <>
            <span className="hidden [@media(pointer:fine)]:inline">
              Press <kbd className="font-[inherit] text-ink">L</kbd> to look under the glass:
            </span>
            <span className="[@media(pointer:fine)]:hidden">Tap to look under the glass:</span>{" "}
            this page, measured live from its own DOM.
          </>
        ) : (
          <>Under the glass. Esc to close.</>
        )}
      </span>
    </button>
  );
}

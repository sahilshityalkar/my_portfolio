"use client";

import { inspect } from "@/lib/store";

/** Opens the glass on this page: the lens on a fine pointer, the full blueprint on touch. */
export function InspectButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => inspect.set(matchMedia("(pointer: coarse)").matches ? "full" : "lens")}
      className={className}
    >
      {children}
    </button>
  );
}

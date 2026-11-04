"use client";

import { openGlass } from "@/lib/store";

/** Opens the glass on this page: the lens on a fine pointer, the full blueprint on touch. */
export function InspectButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={openGlass}
      className={className}
    >
      {children}
    </button>
  );
}

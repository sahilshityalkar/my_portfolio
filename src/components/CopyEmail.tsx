"use client";

import { useEffect, useState } from "react";

/**
 * mailto: often does nothing on office machines with no mail app set up, so
 * the address can also be copied in one click, with clear feedback.
 */
export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2200);
    return () => clearTimeout(t);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="t-meta inline-flex h-9 items-center gap-2 rounded-full border border-(--rule-strong) px-4 text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor">
        {state === "copied" ? (
          <path d="M2 6.5l2.5 2.5L10 3.5" />
        ) : (
          <>
            <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
            <path d="M1.5 8V2.5a1 1 0 011-1H8" />
          </>
        )}
      </svg>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Press Ctrl+C" : "Copy email"}</span>
    </button>
  );
}

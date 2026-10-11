"use client";

import { useEffect, useState } from "react";

/**
 * mailto: often does nothing on office machines with no mail app set up, so
 * the address can also be copied in one click, with clear feedback.
 *
 * `compact` is the inline variant that sits beside the address in the hero:
 * no border, shorter, and the label is just "Copy". Every label shares one
 * grid cell, so the button keeps its width when the label changes.
 */
export function CopyEmail({ email, compact = false }: { email: string; compact?: boolean }) {
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

  const labels = {
    idle: compact ? "Copy" : "Copy email",
    copied: "Copied",
    failed: compact ? "Ctrl+C" : "Press Ctrl+C",
  } as const;

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={compact ? `Copy ${email}` : "Copy email"}
      className={
        compact
          ? "t-meta inline-flex h-7 items-center gap-1.5 rounded-[2px] px-1.5 text-ink-3 transition-colors hover:text-ink"
          : "t-meta inline-flex h-9 items-center gap-2 rounded-full border border-(--rule-strong) px-4 text-ink transition-colors hover:bg-ink hover:text-paper"
      }
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
      <span className="grid text-left" aria-hidden="true">
        {(Object.keys(labels) as (keyof typeof labels)[]).map((k) => (
          <span key={k} className={`col-start-1 row-start-1 ${k === state ? "" : "invisible"}`}>
            {labels[k]}
          </span>
        ))}
      </span>
      <span className="sr-only" aria-live="polite">
        {state === "idle" ? "" : labels[state]}
      </span>
    </button>
  );
}

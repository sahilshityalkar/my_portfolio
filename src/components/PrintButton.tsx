"use client";

/**
 * Until a résumé PDF exists, the page itself is the thing to forward: print
 * (or Save as PDF) sets it as a two-page summary (see the print rules at the
 * end of globals.css). Needs JS, so it is hidden without it.
 */
export function PrintButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`${className} [html:not(.js)_&]:hidden`}
      title="This page as a two-page résumé: save it as PDF, or print it"
    >
      {children}
    </button>
  );
}

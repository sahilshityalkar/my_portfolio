"use client";

import { useEffect } from "react";

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

/**
 * On the home page: arriving with ?print (the header's "Résumé (PDF)" from
 * another page) opens the print dialog once the page and its fonts are
 * ready, then drops the parameter so a reload does not print again.
 */
export function PrintOnArrival() {
  useEffect(() => {
    if (!new URLSearchParams(location.search).has("print")) return;
    let cancelled = false;
    // the parameter goes only when printing actually starts: under
    // StrictMode the first run is cancelled, and the second must still see it
    const go = () =>
      document.fonts.ready.then(() => {
        if (cancelled) return;
        history.replaceState(history.state, "", location.pathname + location.hash);
        window.print();
      });
    if (document.readyState === "complete") go();
    else addEventListener("load", go, { once: true });
    return () => {
      cancelled = true;
      removeEventListener("load", go);
    };
  }, []);
  return null;
}

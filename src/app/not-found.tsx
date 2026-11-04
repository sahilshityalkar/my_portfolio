import type { Metadata } from "next";
import Link from "next/link";

// Next marks a 404 noindex itself; this page only needs its own words and no
// canonical (it would otherwise inherit the home page's)
export const metadata: Metadata = {
  title: "Not in the collection",
  description: "This page is not part of the portfolio of Sahil Shityalkar.",
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[100svh] flex-col justify-end pb-12 pt-[calc(var(--header-h)+2rem)]">
      <p className="t-meta text-mark">404</p>
      <h1 className="t-display mt-6 hyphens-manual" data-spec-type="Newsreader">
        Not in the <span className="italic">collection.</span>
      </h1>
      <p className="t-lede mt-8 max-w-[34ch] text-ink-2">This page isn’t on display. It may have moved, or never existed.</p>
      <p className="t-meta mt-10">
        <Link href="/" className="link-draw">
          ← Back to the index
        </Link>
      </p>
    </div>
  );
}

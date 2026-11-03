import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Loupe } from "@/components/Loupe";
import { RevealObserver } from "@/components/Reveal";
import { SmoothAnchors } from "@/components/SmoothAnchors";
import { profile } from "@/content/profile";
import { themeBootScript } from "@/lib/theme";
import "./globals.css";

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-roman.woff2", style: "normal", weight: "300 500" },
    { path: "./fonts/newsreader-italic.woff2", style: "italic", weight: "300 400" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  // next/font derives a single roman fallback, so italics fell back to a
  // synthesized oblique about 4% narrower and the right-aligned surname moved
  // on swap. Both faces are declared in globals.css instead.
  adjustFontFallback: false,
  fallback: ["Newsreader Fallback", "Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
});

const plexMono = localFont({
  src: [
    { path: "./fonts/plex-mono-400.woff2", weight: "400" },
    { path: "./fonts/plex-mono-500.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  // next/font can only derive a fallback from Arial or Times New Roman, both
  // proportional, so mono lines wrapped differently until Plex arrived. The
  // fallback is declared in globals.css instead: Courier New, whose advance
  // (0.6 em) already matches Plex Mono, with Plex's vertical metrics.
  adjustFontFallback: false,
  fallback: ["Plex Mono Fallback", "ui-monospace", "Menlo", "monospace"],
});

/** Newsreader's own family name, without its fallbacks: the size-tiered
 * fallback stacks in globals.css (--serif-lede, --serif-display) start with it. */
const newsreaderFace = (newsreader.style.fontFamily.split(",")[0] ?? "").trim();

const title = `${profile.name} · ${profile.role}`;
// The hero states the role once, visually; search results still need it in words.
const description = `${profile.role} at ${profile.company}, Mumbai. ${profile.statement}`;

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s · ${profile.name}` },
  description,
  applicationName: profile.name,
  authors: [{ name: profile.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.name,
    title,
    description,
    locale: "en",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#11100f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="day" className={`${newsreader.variable} ${plexMono.variable}`}
      style={{ ["--nr-face" as string]: newsreaderFace }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      {/* browser extensions (e.g. ColorZilla) add attributes to <body> before React loads */}
      <body suppressHydrationWarning>
        <a
          id="skip"
          href="#main"
          className="t-meta fixed left-4 top-3 z-[60] -translate-y-20 bg-ink px-3 py-2 text-paper focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <Loupe />
        <RevealObserver />
        <SmoothAnchors />
      </body>
    </html>
  );
}

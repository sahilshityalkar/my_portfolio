import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Loupe } from "@/components/Loupe";
import { RevealObserver } from "@/components/Reveal";
import { profile } from "@/content/profile";
import { themeBootScript } from "@/lib/theme";
import "./globals.css";

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-roman.woff2", style: "normal", weight: "200 800" },
    { path: "./fonts/newsreader-italic.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  fallback: ["Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/plex-mono-400.woff2", weight: "400" },
    { path: "./fonts/plex-mono-500.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "monospace"],
});

const title = `${profile.name} — ${profile.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: { default: title, template: `%s — ${profile.name}` },
  description: profile.statement,
  applicationName: profile.name,
  authors: [{ name: profile.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.name,
    title,
    description: profile.statement,
    locale: "en",
  },
  twitter: { card: "summary_large_image", title, description: profile.statement },
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
    <html lang="en" data-theme="day" className={`${newsreader.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <a
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
      </body>
    </html>
  );
}

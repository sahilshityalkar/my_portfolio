"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile, links } from "@/content/profile";
import { inspect, openGlass, section, theme, useStore } from "@/lib/store";
import { readTheme, setTheme } from "@/lib/theme";
import { usePathname } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { sections } from "@/content/sections";

export const nav = sections.filter((s) => s.id !== "intro").map((s) => ({ href: `/#${s.id}`, label: s.label, n: s.n }));

export function Header() {
  const mode = useStore(inspect, "off");
  const t = useStore(theme, "day");
  const here = useStore(section, null);
  const home = usePathname() === "/";
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => theme.set(readTheme()), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // the page behind the full-screen menu is out of reach: no focus, no clicks
    const main = document.getElementById("main");
    const skip = document.getElementById("skip");
    const opener = menuButton.current;
    if (main) main.inert = true;
    if (skip) skip.inert = true;
    document.documentElement.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      if (main) main.inert = false;
      if (skip) skip.inert = false;
      document.documentElement.style.overflow = "";
      removeEventListener("keydown", onKey);
      // back to where the visitor was: the button that opened the menu
      // (unless a menu link moved focus on purpose)
      if (!document.activeElement || document.activeElement === document.body) opener?.focus();
    };
  }, [open]);

  const inspecting = mode !== "off";

  return (
    <header
      data-spec="Header"
      className="fixed inset-x-0 top-0 z-50 h-(--header-h)"
    >
      {/* The blur lives on its own layer: backdrop-filter on the header itself would
          become the containing block for the fixed full-screen menu below. */}
      <div aria-hidden="true" className="absolute inset-0 bg-[color-mix(in_srgb,var(--paper)_86%,transparent)] backdrop-blur-md" />
      <div className="wrap relative flex h-full items-center justify-between gap-4 sm:gap-6">
        <Link href="/" className="t-meta flex items-baseline gap-3 whitespace-nowrap" aria-label={`${profile.name}, home`}>
          <span className="text-ink">{profile.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="t-meta flex gap-5 whitespace-nowrap text-ink-2 lg:gap-6">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  aria-current={n.href === `/#${here}` ? "location" : undefined}
                  className="link-draw transition-colors hover:text-ink aria-[current=location]:text-ink aria-[current=location]:[background-size:100%_1px]"
                >
                  {n.label}
                  {/* the sheet number, as on the ruler and the section heads */}
                  <span aria-hidden="true" className="ml-1.5 hidden w-[2ch] text-ink-3 tabular-nums lg:inline-block">
                    {n.n}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="t-meta flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            data-on={inspecting || undefined}
            aria-label={inspecting ? "Close the glass" : "Inspect the page"}
            aria-keyshortcuts="L"
            onClick={() => (inspecting ? inspect.set("off") : openGlass())}
            className="group flex h-9 items-center gap-2 rounded-full px-2.5 text-ink-2 [html:not(.js)_&]:hidden sm:px-3 transition-colors hover:text-ink data-[on]:text-mark"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true" className="overflow-visible">
              <circle cx="5.5" cy="5.5" r="4.75" fill="none" stroke="currentColor" />
              <path d="M9 9l3.25 3.25" stroke="currentColor" />
              <circle
                cx="5.5"
                cy="5.5"
                r="2"
                fill="currentColor"
                className="origin-center scale-0 transition-transform duration-500 [transform-box:fill-box] group-data-[on]:scale-100"
              />
            </svg>
            {/* both labels share one cell, so switching never resizes the button
                (an automatic switch would otherwise count as a layout shift) */}
            <span className="hidden sm:inline-grid">
              <span className={`col-start-1 row-start-1 ${inspecting ? "invisible" : ""}`}>Inspect</span>
              <span aria-hidden="true" className={`col-start-1 row-start-1 ${inspecting ? "" : "invisible"}`}>
                Close
              </span>
            </span>
            {/* the key cap's letter is generated content, so the button's
                visible text stays "Inspect", which its name begins with
                (aria-keyshortcuts announces the L) */}
            <kbd
              aria-hidden="true"
              data-key="L"
              className="hidden rounded border border-(--rule-strong) px-1 font-[inherit] text-[0.625rem] text-ink-3 after:content-[attr(data-key)] lg:inline"
            />
          </button>

          <button
            type="button"
            onClick={() => setTheme(t === "day" ? "night" : "day")}
            aria-label={t === "day" ? "Day theme, switch to night" : "Night theme, switch to day"}
            className="flex h-9 items-center gap-2 rounded-full px-3 text-ink-2 transition-colors hover:text-ink [html:not(.js)_&]:hidden"
          >
            <span aria-hidden="true" className="relative block size-3 overflow-hidden rounded-full border border-current">
              <span
                className="absolute inset-0 rounded-full bg-current transition-transform duration-700 ease-(--ease-out)"
                style={{ transform: t === "night" ? "translateX(0)" : "translateX(60%)" }}
              />
            </span>
            {/* one cell for both labels: a stored Night theme is applied after
                hydration, and a width change here would shift the whole bar */}
            <span className="hidden sm:inline-grid">
              <span className={`col-start-1 row-start-1 ${t === "day" ? "" : "invisible"}`}>Day</span>
              <span aria-hidden="true" className={`col-start-1 row-start-1 ${t === "day" ? "invisible" : ""}`}>
                Night
              </span>
            </span>
          </button>

          {/* where recruiters look for a résumé: the real file once it exists,
              until then the page itself, printed as a two-page summary */}
          {links.resume ? (
            <a
              href={links.resume}
              className="hidden h-9 items-center rounded-full border border-(--rule-strong) px-4 text-ink transition-colors hover:bg-ink hover:text-paper sm:flex"
            >
              Résumé
            </a>
          ) : (
            // the summary is the home page printed: elsewhere the button goes
            // there and asks it to print (?print), never prints this page
            home ? (
              <PrintButton className="hidden h-9 items-center rounded-full border border-(--rule-strong) px-4 text-ink transition-colors hover:bg-ink hover:text-paper lg:flex">
                Résumé (PDF)
              </PrintButton>
            ) : (
              <Link
                href="/?print"
                className="hidden h-9 [html:not(.js)_&]:hidden items-center rounded-full border border-(--rule-strong) px-4 text-ink transition-colors hover:bg-ink hover:text-paper lg:flex"
              >
                Résumé (PDF)
              </Link>
            )
          )}

          <button
            type="button"
            ref={menuButton}
            className="flex h-9 items-center px-2 text-ink md:hidden"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu" className="fixed inset-x-0 top-(--header-h) bottom-0 z-50 bg-paper md:hidden">
          <nav aria-label="Site" className="wrap flex h-full flex-col justify-between pb-10 pt-6">
            <ul>
              {nav.map((n, i) => (
                <li key={n.href} className="rule fade-in" style={{ ["--i" as string]: i - 3 }}>
                  <a href={n.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-4">
                    <span className="t-title">{n.label}</span>
                    <span className="t-meta text-ink-3">{n.n}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="t-meta text-ink-3">Tip: tap Inspect to see how this page is built.</p>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

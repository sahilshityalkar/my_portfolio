"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { profile, links } from "@/content/profile";
import { inspect, theme, useStore } from "@/lib/store";
import { readTheme, setTheme } from "@/lib/theme";

export const nav = [
  { href: "/#work", label: "Work", n: "02" },
  { href: "/#experience", label: "Experience", n: "03" },
  { href: "/#lab", label: "Lab", n: "04" },
  { href: "/#about", label: "About", n: "05" },
  { href: "/#contact", label: "Contact", n: "06" },
];

export function Header() {
  const mode = useStore(inspect, "off");
  const t = useStore(theme, "day");
  const [open, setOpen] = useState(false);

  useEffect(() => theme.set(readTheme()), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  const inspecting = mode !== "off";

  return (
    <header
      data-spec="Header"
      className="fixed inset-x-0 top-0 z-50 h-(--header-h) bg-[color-mix(in_srgb,var(--paper)_86%,transparent)] backdrop-blur-md"
    >
      <div className="wrap flex h-full items-center justify-between gap-6">
        <Link href="/" className="t-meta flex items-baseline gap-3" aria-label={`${profile.name} — home`}>
          <span className="text-ink">{profile.name}</span>
          <span className="hidden text-ink-3 lg:inline">
            {profile.role}, {profile.company}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="t-meta flex gap-6 text-ink-2">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="link-draw hover:text-ink">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="t-meta flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-pressed={inspecting}
            onClick={() => inspect.set(inspecting ? "off" : matchMedia("(pointer: coarse)").matches ? "full" : "lens")}
            className="group flex h-9 items-center gap-2 rounded-full px-3 text-ink-2 transition-colors hover:text-ink aria-pressed:text-mark"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true" className="overflow-visible">
              <circle cx="5.5" cy="5.5" r="4.75" fill="none" stroke="currentColor" />
              <path d="M9 9l3.25 3.25" stroke="currentColor" />
              <circle
                cx="5.5"
                cy="5.5"
                r="2"
                fill="currentColor"
                className="origin-center scale-0 transition-transform duration-500 [transform-box:fill-box] group-aria-pressed:scale-100"
              />
            </svg>
            <span>{inspecting ? "Close" : "Inspect"}</span>
            <kbd className="hidden rounded border border-(--rule-strong) px-1 font-[inherit] text-[0.625rem] text-ink-3 lg:inline">
              L
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setTheme(t === "day" ? "night" : "day")}
            aria-label={t === "day" ? "Switch to night" : "Switch to day"}
            className="flex h-9 items-center gap-2 rounded-full px-3 text-ink-2 transition-colors hover:text-ink"
          >
            <span aria-hidden="true" className="relative block size-3 overflow-hidden rounded-full border border-current">
              <span
                className="absolute inset-0 rounded-full bg-current transition-transform duration-700 ease-(--ease-out)"
                style={{ transform: t === "night" ? "translateX(0)" : "translateX(60%)" }}
              />
            </span>
            <span className="hidden sm:inline">{t === "day" ? "Day" : "Night"}</span>
          </button>

          {links.resume ? (
            <a
              href={links.resume}
              className="hidden h-9 items-center rounded-full border border-(--rule-strong) px-4 text-ink transition-colors hover:bg-ink hover:text-paper sm:flex"
            >
              Résumé
            </a>
          ) : null}

          <button
            type="button"
            className="flex h-9 items-center px-2 text-ink md:hidden"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Index"}
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu" className="fixed inset-x-0 top-(--header-h) bottom-0 z-50 bg-paper md:hidden">
          <nav aria-label="Index" className="wrap flex h-full flex-col justify-between pb-10 pt-6">
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
            <p className="t-meta text-ink-3">Tip — tap Inspect to see how this page is built.</p>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

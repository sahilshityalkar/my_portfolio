"use client";

import { useEffect, useState } from "react";
import { links } from "@/content/profile";
import { inspect } from "@/lib/store";

/** undefined: not measured yet · null: this browser does not report it */
type Reading = number | null | undefined;

const NOT_REPORTED = "not reported here";

/**
 * The colophon as a drafting title block: what this sheet is, how this visit
 * actually performed (measured by the visitor's own browser, not claimed), what
 * it is built with, and the way under the glass. Server-rendered with
 * middle-dot placeholders in fixed-width slots; values arrive once after load
 * and again if layout shift changes.
 */
export function TitleBlock() {
  const [lcp, setLcp] = useState<Reading>(undefined);
  const [cls, setCls] = useState<Reading>(undefined);
  const [kb, setKb] = useState<Reading>(undefined);

  useEffect(() => {
    const types = (typeof PerformanceObserver !== "undefined" && PerformanceObserver.supportedEntryTypes) || [];
    const observers: PerformanceObserver[] = [];
    let lcpMs: number | null = types.includes("largest-contentful-paint") ? 0 : null;
    let shift: number | null = types.includes("layout-shift") ? 0 : null;
    let loaded = false;
    let frame = 0;

    const transfer = (): number | null => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (!nav || typeof nav.transferSize !== "number") return null;
      let bytes = nav.transferSize;
      for (const r of performance.getEntriesByType("resource") as PerformanceResourceTiming[]) bytes += r.transferSize || 0;
      return Math.round(bytes / 1024);
    };

    const publish = () => {
      if (!loaded || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setLcp(lcpMs === null || lcpMs === 0 ? null : lcpMs / 1000);
        setCls(shift);
      });
    };

    if (lcpMs !== null) {
      const o = new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) lcpMs = last.startTime;
        publish();
      });
      o.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(o);
    }
    if (shift !== null) {
      const o = new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!e.hadRecentInput) shift = (shift ?? 0) + e.value;
        }
        publish();
      });
      o.observe({ type: "layout-shift", buffered: true });
      observers.push(o);
    }

    // after load, so the transfer covers everything the first view needed
    const onLoad = () =>
      window.setTimeout(() => {
        loaded = true;
        setKb(transfer());
        publish();
      }, 0);
    let t = 0;
    if (document.readyState === "complete") t = onLoad();
    else addEventListener("load", onLoad, { once: true });

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(frame);
      removeEventListener("load", onLoad);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  const value = (v: Reading, fmt: (n: number) => string, dots: string) =>
    v === undefined ? dots : v === null ? NOT_REPORTED : fmt(v);
  const source = (links as { source?: string | null }).source ?? null;

  return (
    <div className="titleblock t-meta grid grid-flow-dense grid-cols-2 gap-px border border-(--rule-strong) bg-(--rule-strong) lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_auto]">
      <Cell label="Sheet">
        <span className="normal-case tracking-normal">sahilshityalkar.com</span>
      </Cell>
      <Cell label="This visit" className="col-span-2 lg:col-span-1">
        <span className="flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
          <span>
            LCP <Slot w="6ch">{value(lcp, (n) => `${n.toFixed(2)} S`, "···· S")}</Slot>
          </span>
          <span>
            CLS <Slot w="5ch">{value(cls, (n) => n.toFixed(3), "·····")}</Slot>
          </span>
          <span>
            Transfer <Slot w="7ch">{value(kb, (n) => `${n} KB`, "··· KB")}</Slot>
          </span>
        </span>
      </Cell>
      <Cell label="Built with" className="col-span-2 lg:col-span-1">
        Next.js 16 · no animation libraries
        {source ? (
          <>
            {" · "}
            <a href={source} target="_blank" rel="noreferrer" className="link-draw text-ink">
              Source ↗
            </a>
          </>
        ) : null}
      </Cell>
      <Cell label="Inspect">
        <button
          type="button"
          onClick={() => inspect.set(matchMedia("(pointer: coarse)").matches ? "full" : "lens")}
          className="link-draw uppercase text-ink"
        >
          Press L
        </button>
      </Cell>
    </div>
  );
}

function Cell({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-paper px-3 pb-2.5 pt-2 ${className}`}>
      <p className="text-[10px] text-ink-3">{label}</p>
      <div className="mt-1.5 text-ink-2">{children}</div>
    </div>
  );
}

function Slot({ w, children }: { w: string; children: React.ReactNode }) {
  return (
    <span className="inline-block text-ink" style={{ minWidth: w }}>
      {children}
    </span>
  );
}

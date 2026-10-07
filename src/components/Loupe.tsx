"use client";

import { useEffect, useRef, useState } from "react";
import { Spring, springs } from "@/lib/spring";
import { inspect, useStore, type InspectMode } from "@/lib/store";

/**
 * The Loupe: the site's signature.
 *
 * A glass that shows the page's own engineering drawing. Everything under it is
 * measured from the live DOM at runtime, nothing is pre-drawn:
 *
 *  - [data-spec="Name"]  component boxes: outline, padding hatch, W × H, sibling gaps
 *  - [data-spec-type]    letterforms re-drawn as outlines, with baseline, x-height
 *                        and cap-height measured by canvas text metrics
 *  - every other text node: its real line boxes, from Range.getClientRects()
 *  - [data-spec-grid]    the live column grid, read from computed grid tracks
 *
 * One 2D canvas, clipped to a circle whose position and radius are springs.
 * "lens" follows the pointer; "full" floods the glass across the viewport.
 * The loop sleeps whenever nothing moves.
 */

type Box = {
  label: string;
  x: number; y: number; w: number; h: number; // document coordinates
  pad: [number, number, number, number]; // t r b l
  fixed: boolean;
  group: Element | null;
};
/** Each word keeps its own font, so a roman line and an italic line both redraw truthfully. */
type Word = { text: string; x: number; y: number; w: number; h: number; font: string; spacing: string; ascent: number };
type TypeSpec = {
  font: string;
  spacing: string;
  size: number;
  ascent: number; // font-box ascent, px
  cap: number;
  xh: number;
  desc: string;
  words: Word[];
  x: number; y: number; w: number; h: number;
};
type Line = { x: number; y: number; w: number; h: number; fixed: boolean };
type Grid = { cols: [number, number][] } | null;
type Media = { x: number; y: number; w: number; h: number; label: string };
type Model = { boxes: Box[]; types: TypeSpec[]; lines: Line[]; grid: Grid; media: Media[] };

type Palette = { paper: string; ink: string; ink3: string; mark: string; rule: string };

const EMPTY: Model = { boxes: [], types: [], lines: [], grid: null, media: [] };

function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return { paper: v("--paper"), ink: v("--ink"), ink3: v("--ink-3"), mark: v("--mark"), rule: v("--rule-strong") };
}

function isFixed(el: Element): boolean {
  for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
    if (getComputedStyle(n).position === "fixed") return true;
  }
  return false;
}

function measure(ctx: CanvasRenderingContext2D): Model {
  const sx = window.scrollX;
  const sy = window.scrollY;

  const boxes: Box[] = [];
  document.querySelectorAll<HTMLElement>("[data-spec]").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const cs = getComputedStyle(el);
    const fixed = isFixed(el);
    boxes.push({
      label: el.dataset.spec || el.tagName.toLowerCase(),
      x: r.left + (fixed ? 0 : sx),
      y: r.top + (fixed ? 0 : sy),
      w: r.width,
      h: r.height,
      pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat) as Box["pad"],
      fixed,
      group: el.parentElement,
    });
  });

  const types: TypeSpec[] = [];
  const range = document.createRange();
  document.querySelectorAll<HTMLElement>("[data-spec-type]").forEach((el) => {
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    ctx.font = font;
    const m = ctx.measureText("Hxg");
    const ascent = m.fontBoundingBoxAscent;
    const cap = ctx.measureText("H").actualBoundingBoxAscent;
    const xh = ctx.measureText("x").actualBoundingBoxAscent;
    const words: Word[] = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent ?? "";
      const ps = n.parentElement ? getComputedStyle(n.parentElement) : cs;
      const wfont = `${ps.fontStyle} ${ps.fontWeight} ${ps.fontSize} ${ps.fontFamily}`;
      ctx.font = wfont;
      const wascent = ctx.measureText("Hxg").fontBoundingBoxAscent;
      for (const match of text.matchAll(/\S+/g)) {
        range.setStart(n, match.index);
        range.setEnd(n, match.index + match[0].length);
        const wr = range.getClientRects()[0];
        if (!wr || wr.width < 1) continue;
        words.push({
          text: match[0],
          x: wr.left + sx,
          y: wr.top + sy,
          w: wr.width,
          h: wr.height,
          font: wfont,
          spacing: ps.letterSpacing,
          ascent: wascent,
        });
      }
    }
    const r = el.getBoundingClientRect();
    const family = cs.fontFamily.split(",")[0]?.replace(/['"]/g, "").replace(/^__|_[a-f0-9]+$/g, "") ?? "";
    types.push({
      font,
      spacing: cs.letterSpacing,
      size,
      ascent,
      cap,
      xh,
      desc: `${el.dataset.specType || family} ${Math.round(size)}px / ${(parseFloat(cs.lineHeight) / size || 1).toFixed(2)} · ${cs.fontWeight}`,
      words,
      x: r.left + sx,
      y: r.top + sy,
      w: r.width,
      h: r.height,
    });
  });

  const lines: Line[] = [];
  const skip = (el: Element | null) => !!el?.closest("[data-spec-type],[data-loupe-skip],script,style,noscript");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.textContent?.trim() && !skip(n.parentElement) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const parent = n.parentElement;
    if (!parent || parent.closest("[aria-hidden=true]")) continue;
    const fixed = isFixed(parent);
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 2 || r.height < 2) continue;
      lines.push({ x: r.left + (fixed ? 0 : sx), y: r.top + (fixed ? 0 : sy), w: r.width, h: r.height, fixed });
    }
  }

  let grid: Grid = null;
  const g = document.querySelector<HTMLElement>("[data-spec-grid]");
  if (g) {
    const cs = getComputedStyle(g);
    const tracks = cs.gridTemplateColumns.split(" ").map(parseFloat).filter((n) => !Number.isNaN(n));
    const gap = parseFloat(cs.columnGap) || 0;
    const left = g.getBoundingClientRect().left + parseFloat(cs.paddingLeft) + sx;
    let x = left;
    const cols: [number, number][] = [];
    for (const t of tracks) {
      cols.push([x, t]);
      x += t + gap;
    }
    grid = { cols };
  }

  // figures and images: drawn the way architects mark a picture on a plan
  const media: Media[] = [];
  document.querySelectorAll<HTMLElement>("main figure, main img, main canvas").forEach((el) => {
    if (el.closest("[data-loupe-skip]") || (el.tagName !== "FIGURE" && el.closest("figure"))) return;
    const r = el.getBoundingClientRect();
    if (r.width < 80 || r.height < 60) return;
    const kind = el.tagName === "FIGURE" ? (el.querySelector("img") ? "img" : el.querySelector("svg") ? "svg" : "figure") : el.tagName.toLowerCase();
    media.push({ x: r.left + sx, y: r.top + sy, w: r.width, h: r.height, label: `${kind} ${Math.round(r.width)} × ${Math.round(r.height)}` });
  });

  return { boxes, types, lines, grid, media };
}

/* ------------------------------------------------------------------ drawing */

function hatch(ctx: CanvasRenderingContext2D, color: string, dpr: number): CanvasPattern | null {
  const c = document.createElement("canvas");
  const s = Math.round(6 * dpr);
  c.width = c.height = s;
  const x = c.getContext("2d");
  if (!x) return null;
  x.strokeStyle = color;
  x.globalAlpha = 0.3;
  x.lineWidth = dpr * 0.75;
  x.beginPath();
  x.moveTo(0, s);
  x.lineTo(s, 0);
  x.stroke();
  const p = ctx.createPattern(c, "repeat");
  p?.setTransform(new DOMMatrix().scale(1 / dpr));
  return p;
}

/** next/font renames families, so read the real one from the CSS variable. */
let MONO = "500 10px ui-monospace, monospace";
const readMono = () => {
  const fam = getComputedStyle(document.documentElement).getPropertyValue("--font-plex-mono").trim();
  if (fam) MONO = `500 10px ${fam}, ui-monospace, monospace`;
};

function tag(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, p: Palette, fill = p.mark) {
  ctx.font = MONO;
  const w = ctx.measureText(text).width + 10;
  ctx.fillStyle = fill;
  ctx.fillRect(x, y - 15, w, 15);
  ctx.fillStyle = p.paper;
  ctx.fillText(text, x + 5, y - 4);
}

function dimension(ctx: CanvasRenderingContext2D, x: number, y1: number, y2: number, p: Palette) {
  const h = y2 - y1;
  if (h < 14) return;
  ctx.strokeStyle = p.mark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y1 + 1);
  ctx.lineTo(x, y2 - 1);
  ctx.moveTo(x - 4, y1 + 0.5);
  ctx.lineTo(x + 4, y1 + 0.5);
  ctx.moveTo(x - 4, y2 - 0.5);
  ctx.lineTo(x + 4, y2 - 0.5);
  ctx.stroke();
  ctx.font = MONO;
  const label = `${Math.round(h)}`;
  const w = ctx.measureText(label).width;
  ctx.fillStyle = p.paper;
  ctx.fillRect(x + 6, (y1 + y2) / 2 - 7, w + 6, 13);
  ctx.fillStyle = p.mark;
  ctx.fillText(label, x + 9, (y1 + y2) / 2 + 3);
}

type Frame = {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  cx: number;
  cy: number;
  r: number;
  reveal: number; // 0..1 for the touch scan; 1 otherwise
  scan: boolean;
  p: Palette;
  hatch: CanvasPattern | null;
  model: Model;
  fps: number;
};

function draw(f: Frame) {
  const { ctx, W, H, cx, cy, r, p, model } = f;
  const sx = window.scrollX;
  const sy = window.scrollY;
  ctx.clearRect(0, 0, W, H);
  if (r < 0.5 && f.reveal <= 0) return;

  ctx.save();
  ctx.beginPath();
  if (f.scan) ctx.rect(0, 0, W, H * f.reveal);
  else ctx.arc(cx, cy, Math.max(r, 0), 0, Math.PI * 2);
  ctx.clip();

  // vellum
  ctx.globalAlpha = 0.975;
  ctx.fillStyle = p.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // millimetre paper: an 8px field, emphasised every 64px, locked to the document
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 1;
  const oy = -(sy % 64);
  ctx.globalAlpha = 0.09;
  ctx.beginPath();
  for (let y = oy % 8; y < H; y += 8) {
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(W, Math.round(y) + 0.5);
  }
  for (let x = 0; x < W; x += 8) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
  }
  ctx.stroke();
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  for (let y = oy; y < H; y += 64) {
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(W, Math.round(y) + 0.5);
  }
  for (let x = 0; x < W; x += 64) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  // column grid
  if (model.grid) {
    ctx.fillStyle = p.mark;
    ctx.globalAlpha = 0.022;
    for (const [x, w] of model.grid.cols) ctx.fillRect(x - sx, 0, w, H);
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = p.mark;
    ctx.beginPath();
    for (const [x, w] of model.grid.cols) {
      ctx.moveTo(Math.round(x - sx) + 0.5, 0);
      ctx.lineTo(Math.round(x - sx) + 0.5, H);
      ctx.moveTo(Math.round(x - sx + w) - 0.5, 0);
      ctx.lineTo(Math.round(x - sx + w) - 0.5, H);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // text line boxes
  ctx.fillStyle = p.ink;
  for (const l of model.lines) {
    const x = l.x - (l.fixed ? 0 : sx);
    const y = l.y - (l.fixed ? 0 : sy);
    if (y > H || y + l.h < 0 || x > W || x + l.w < 0) continue;
    ctx.globalAlpha = 0.1;
    ctx.fillRect(x, y, l.w, l.h);
    ctx.globalAlpha = 0.55;
    ctx.fillRect(x, y + l.h * 0.78, l.w, 1);
  }
  ctx.globalAlpha = 1;

  // media: frame, diagonals, size
  for (const m of model.media) {
    const x = m.x - sx;
    const y = m.y - sy;
    if (y > H || y + m.h < 0) continue;
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(m.w) - 1, Math.round(m.h) - 1);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + m.w, y + m.h);
    ctx.moveTo(x + m.w, y);
    ctx.lineTo(x, y + m.h);
    ctx.globalAlpha = 0.18;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = MONO;
    const lw = ctx.measureText(m.label).width;
    ctx.fillStyle = p.paper;
    ctx.fillRect(x + m.w / 2 - lw / 2 - 6, y + m.h / 2 - 9, lw + 12, 17);
    ctx.fillStyle = p.ink;
    ctx.fillText(m.label, x + m.w / 2 - lw / 2, y + m.h / 2 + 3);
  }

  // letterforms
  const LS = (v: string) => {
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = v;
  };
  for (const t of model.types) {
    const ty = t.y - sy;
    if (ty > H || ty + t.h < 0) continue;
    ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = Math.max(0.75, t.size / 160);
    const rows = new Map<number, Word[]>();
    for (const w of t.words) {
      const key = Math.round(w.y);
      rows.set(key, [...(rows.get(key) ?? []), w]);
      ctx.font = w.font;
      LS(w.spacing);
      ctx.strokeText(w.text, w.x - sx, w.y - sy + w.ascent);
    }
    LS("0px");

    const x0 = t.x - sx;
    const x1 = t.x - sx + t.w;
    let first = true;
    for (const [y, row] of rows) {
      const w0 = row[0]!;
      ctx.font = w0.font;
      const cap = ctx.measureText("H").actualBoundingBoxAscent;
      const xh = ctx.measureText("x").actualBoundingBoxAscent;
      const base = y - sy + w0.ascent;
      const lines: [number, string, boolean][] = [
        [base, "baseline", false],
        [base - xh, `x-height ${(xh / t.size).toFixed(2)}em`, true],
        [base - cap, `cap height ${(cap / t.size).toFixed(2)}em`, true],
      ];
      const rowEnd = Math.max(...row.map((w) => w.x + w.w)) - sx;
      for (const [ly, label, dashed] of lines) {
        ctx.strokeStyle = p.mark;
        ctx.lineWidth = 1;
        ctx.globalAlpha = dashed ? 0.7 : 1;
        ctx.setLineDash(dashed ? [3, 4] : []);
        ctx.beginPath();
        ctx.moveTo(x0 - 12, Math.round(ly) + 0.5);
        ctx.lineTo(Math.min(x1, rowEnd + 160), Math.round(ly) + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        if (first || t.size > 60) {
          ctx.font = MONO;
          const lw = ctx.measureText(label).width;
          const lx = Math.min(rowEnd + 24, W - lw - 16);
          ctx.fillStyle = p.paper;
          ctx.fillRect(lx - 4, ly - 7, lw + 8, 13);
          ctx.fillStyle = p.mark;
          ctx.fillText(label, lx, ly + 3);
        }
      }
      first = false;
    }
    tag(ctx, t.desc, x0, ty - 6, p, p.ink);
  }

  // component boxes, padding and redline gaps
  const byGroup = new Map<Element, Box[]>();
  for (const b of model.boxes) {
    const x = b.x - (b.fixed ? 0 : sx);
    const y = b.y - (b.fixed ? 0 : sy);
    if (b.group) byGroup.set(b.group, [...(byGroup.get(b.group) ?? []), b]);
    if (y > H || y + b.h < 0) continue;
    const [pt, pr, pb, pl] = b.pad;
    if (f.hatch && (pt || pr || pb || pl)) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, b.w, b.h);
      ctx.rect(x + pl, y + pt, b.w - pl - pr, b.h - pt - pb);
      ctx.clip("evenodd");
      ctx.fillStyle = f.hatch;
      ctx.fillRect(x, y, b.w, b.h);
      ctx.restore();
    }
    ctx.strokeStyle = p.mark;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(b.w) - 1, Math.round(b.h) - 1);
    ctx.setLineDash([]);
    // keep the tag readable below the fixed header while its box scrolls past
    const headerH = b.fixed ? 15 : 78;
    tag(ctx, b.label, Math.round(x), Math.min(Math.max(Math.round(y), headerH), Math.round(y + b.h)), p);
    ctx.font = MONO;
    const dims = `${Math.round(b.w)} × ${Math.round(b.h)}`;
    ctx.fillStyle = p.mark;
    ctx.fillText(dims, x + b.w - ctx.measureText(dims).width - 4, y + b.h - 5);
  }
  for (const group of byGroup.values()) {
    const sorted = group.filter((b) => !b.fixed).sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) {
      const a = sorted[i - 1]!;
      const b = sorted[i]!;
      const gap0 = a.y + a.h - sy;
      const gap1 = b.y - sy;
      if (gap1 < 0 || gap0 > H) continue;
      dimension(ctx, Math.max(a.x, b.x) - sx + 24, gap0, gap1, p);
    }
  }

  ctx.restore();

  // The glass sits above the page, so it would hide the focus ring of the very
  // element it travels to. Redraw keyboard focus on top, in the accent colour.
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && focused !== document.body && focused.matches(":focus-visible")) {
    const fr = focused.getBoundingClientRect();
    ctx.strokeStyle = p.mark;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(Math.round(fr.left) - 3.5, Math.round(fr.top) - 3.5, Math.round(fr.width) + 7, Math.round(fr.height) + 7);
  }

  if (f.scan) {
    // the scan head on touch devices
    if (f.reveal > 0 && f.reveal < 1) {
      const y = H * f.reveal;
      ctx.strokeStyle = p.mark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
      ctx.stroke();
    }
    return;
  }

  if (r > 4 && r < Math.hypot(W, H) * 0.9) {
    // the rim: a hairline bezel with degree ticks, crosshair and live readout
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const len = i % 6 === 0 ? 7 : 3;
      ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.lineTo(cx + Math.cos(a) * (r - len), cy + Math.sin(a) * (r - len));
    }
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(cx - r + 10, cy + 0.5);
    ctx.lineTo(cx - 6, cy + 0.5);
    ctx.moveTo(cx + 6, cy + 0.5);
    ctx.lineTo(cx + r - 10, cy + 0.5);
    ctx.moveTo(cx + 0.5, cy - r + 10);
    ctx.lineTo(cx + 0.5, cy - 6);
    ctx.moveTo(cx + 0.5, cy + 6);
    ctx.lineTo(cx + 0.5, cy + r - 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = MONO;
    ctx.fillStyle = p.ink3;
    const read = `x ${Math.round(cx + sx)}  y ${Math.round(cy + sy)}  ·  ${f.fps} fps`;
    const rw = ctx.measureText(read).width;
    ctx.fillStyle = p.paper;
    ctx.fillRect(cx - rw / 2 - 6, cy + r + 9, rw + 12, 16);
    ctx.fillStyle = p.ink3;
    ctx.fillText(read, cx - rw / 2, cy + r + 20);
  }
}

/* ------------------------------------------------------------------ component */

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
const isInteractive = (t: EventTarget | null) =>
  t instanceof Element && !!t.closest("a,button,input,textarea,select,label,summary,[role=button]");

export function Loupe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = useStore(inspect, "off");
  const [hud, setHud] = useState({ fps: 0, nodes: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    const lensRadius = () => Math.round(Math.min(190, Math.max(120, Math.min(innerWidth, innerHeight) * 0.2)));

    let dpr = Math.min(devicePixelRatio || 1, 2);
    // clientWidth excludes the scrollbar, so labels never tuck under it
    let W = document.documentElement.clientWidth;
    let H = innerHeight;
    readMono();
    let palette = readPalette();
    let pattern: CanvasPattern | null = null;
    let model: Model = EMPTY;
    let stale = true;
    let current: InspectMode = inspect.get();

    const px = new Spring(W / 2, springs.glass);
    const py = new Spring(H / 2, springs.glass);
    const radius = new Spring(0, springs.aperture);
    const scan = new Spring(0, springs.flood);

    let pointer = { x: W / 2, y: H / 2, seen: false };
    let raf = 0;
    let last = 0;
    let frameAvg = 16.7;
    let slowFrames = 0;
    let dirty = true;

    const resize = () => {
      W = document.documentElement.clientWidth;
      H = innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pattern = hatch(ctx, palette.mark, dpr);
      stale = true;
      kick();
    };

    const remeasure = () => {
      model = measure(ctx);
      stale = false;
      setHud((h) => ({ ...h, nodes: model.boxes.length + model.types.length + model.lines.length }));
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? (now - last) / 1000 : 1 / 60;
      last = now;
      frameAvg += (dt * 1000 - frameAvg) * 0.1;

      // adaptive quality: sustained slow frames drop resolution and hatching
      if (frameAvg > 24 && dpr > 1) {
        if (++slowFrames > 40) {
          dpr = 1;
          slowFrames = 0;
          resize();
        }
      } else slowFrames = 0;

      if (stale) remeasure();

      const snap = reduced.matches;
      let moving = false;
      for (const s of [px, py, radius, scan]) {
        if (snap) s.snap(s.target);
        else moving = s.step(dt) || moving;
      }

      draw({
        ctx,
        W,
        H,
        cx: px.value,
        cy: py.value,
        r: radius.value,
        reveal: scan.value,
        scan: coarse.matches,
        p: palette,
        hatch: frameAvg < 20 ? pattern : null,
        model,
        fps: Math.round(1000 / frameAvg),
      });
      dirty = false;

      if (current === "off" && radius.value < 0.5 && scan.value <= 0.001) {
        setVisible(false);
        last = 0;
        return;
      }
      if (moving || dirty) kick();
      else last = 0;
    };

    function kick() {
      dirty = true;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    const apply = (m: InspectMode) => {
      const prev = current;
      current = m;
      const full = Math.hypot(W, H) + 40;
      if (m !== "off") {
        setVisible(true);
        // everything waiting to be revealed is revealed, so the drawing matches the page
        document.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-in", ""));
        stale = true;
      }
      if (coarse.matches) {
        scan.target = m === "off" ? 0 : 1;
      } else if (m === "lens") {
        if (prev === "off") {
          const at = pointer.seen ? pointer : { x: W * 0.62, y: H * 0.5 };
          px.snap(at.x);
          py.snap(at.y);
        }
        radius.config = prev === "full" ? springs.flood : springs.aperture;
        radius.target = lensRadius();
      } else if (m === "full") {
        radius.config = springs.flood;
        radius.target = full;
      } else {
        radius.config = springs.aperture;
        radius.target = 0;
      }
      kick();
    };

    /* ---- the one-time demonstration ----
       On a first visit, once the name has inked and the visitor is still, the
       glass crosses the surname by itself. Moving the mouse hands it over;
       scrolling or a key closes it. Never on touch or with reduced motion. */
    let demo: { from: { x: number; y: number }; timers: number[] } | null = null;
    const endDemo = (close: boolean) => {
      if (!demo) return;
      demo.timers.forEach(clearTimeout);
      demo = null;
      if (close && current === "lens") inspect.set("off");
    };
    const demoTimer = window.setTimeout(() => {
      if (!matchMedia("(pointer: fine)").matches || reduced.matches || current !== "off" || window.scrollY > 40) return;
      try {
        if (sessionStorage.getItem("glass-demo")) return;
        sessionStorage.setItem("glass-demo", "1");
      } catch {
        return;
      }
      const word = document.querySelector<HTMLElement>("#intro-title .mask-line:nth-child(2) > span")?.firstChild;
      if (!word) return;
      const r = document.createRange();
      r.selectNodeContents(word);
      const b = r.getBoundingClientRect();
      if (b.width < 50 || b.bottom < 0 || b.top > H) return;
      const y = b.top + b.height * 0.55;
      const at = (f: number) => b.left + b.width * f;
      demo = { from: { ...pointer }, timers: [] };
      pointer = { x: at(0.12), y, seen: true };
      inspect.set("lens");
      const step = (ms: number, f: number) =>
        demo?.timers.push(
          window.setTimeout(() => {
            if (!demo) return;
            px.target = at(f);
            py.target = y;
            kick();
          }, ms),
        );
      step(500, 0.42);
      step(1300, 0.72);
      step(2100, 0.9);
      demo.timers.push(window.setTimeout(() => endDemo(true), 3300));
    }, 3600);

    const onMove = (e: PointerEvent) => {
      if (demo) {
        // a deliberate move takes the glass over; a nudge doesn't
        if (Math.hypot(e.clientX - demo.from.x, e.clientY - demo.from.y) < 24) return;
        endDemo(false);
      }
      pointer = { x: e.clientX, y: e.clientY, seen: true };
      if (current === "lens") {
        px.target = e.clientX;
        py.target = e.clientY;
        kick();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (demo) endDemo(e.key.toLowerCase() !== "l" && e.key !== "Escape");
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" && current !== "off") inspect.set("off");
      else if (e.key.toLowerCase() === "l") inspect.set(current === "off" ? "lens" : "off");
    };

    const onClick = (e: MouseEvent) => {
      if (coarse.matches || isInteractive(e.target)) return;
      if (current === "lens") {
        px.target = e.clientX;
        py.target = e.clientY;
        inspect.set("full");
      } else if (current === "full") {
        px.snap(e.clientX);
        py.snap(e.clientY);
        inspect.set("lens");
      }
    };

    // keyboard users: the glass travels to whatever has focus
    const onFocus = (e: FocusEvent) => {
      if (current === "off" || !(e.target instanceof Element)) return;
      if (current === "lens") {
        const r = e.target.getBoundingClientRect();
        px.target = r.left + r.width / 2;
        py.target = r.top + r.height / 2;
      }
      kick(); // repaint the focus ring
    };

    const onScroll = () => {
      if (demo) endDemo(true);
      if (current !== "off") kick();
    };
    const onSettle = () => {
      if (current === "off") return;
      stale = true;
      kick();
    };
    const onTheme = new MutationObserver(() => {
      palette = readPalette();
      pattern = hatch(ctx, palette.mark, dpr);
      kick();
    });
    onTheme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const ro = new ResizeObserver(onSettle);
    ro.observe(document.body);
    document.fonts?.ready.then(onSettle);

    resize();
    const unsub = inspect.subscribe(() => apply(inspect.get()));
    if (current !== "off") apply(current);

    addEventListener("resize", resize);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("keydown", onKey);
    addEventListener("click", onClick);
    addEventListener("focusin", onFocus);
    document.addEventListener("transitionend", onSettle);
    document.addEventListener("animationend", onSettle);

    const hudTimer = setInterval(() => setHud((h) => ({ ...h, fps: Math.round(1000 / frameAvg) })), 500);

    return () => {
      clearTimeout(demoTimer);
      endDemo(false);
      unsub();
      cancelAnimationFrame(raf);
      clearInterval(hudTimer);
      ro.disconnect();
      onTheme.disconnect();
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      removeEventListener("keydown", onKey);
      removeEventListener("click", onClick);
      removeEventListener("focusin", onFocus);
      document.removeEventListener("transitionend", onSettle);
      document.removeEventListener("animationend", onSettle);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-loupe-skip
        className="pointer-events-none fixed inset-0 z-40"
        style={{ visibility: visible ? "visible" : "hidden" }}
      />
      {mode === "full" || (mode === "lens" && visible) ? (
        <div
          data-loupe-skip
          aria-hidden="true"
          className="t-meta pointer-events-none fixed bottom-4 left-(--gutter) z-50 flex gap-4 text-ink-3 fade-in"
          style={{ ["--i" as string]: 0 }}
        >
          <span className="text-mark">{mode === "full" ? "Blueprint" : "Glass"}</span>
          <span className="hidden sm:inline">{hud.nodes} measured nodes</span>
          <span>{hud.fps} fps</span>
          <span className="hidden sm:inline">{mode === "lens" ? "Click empty space to flood · Esc to close" : "Click to return · Esc to close"}</span>
        </div>
      ) : null}
    </>
  );
}

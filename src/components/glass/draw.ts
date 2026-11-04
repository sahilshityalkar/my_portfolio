/**
 * The glass's drawing: the page's engineering drawing from a measured Model
 * (see model.ts), onto a 2D canvas, plus the lens rim and the cached-scene
 * blit used in lens mode. Pure functions of their inputs and the scroll.
 */
import type { Box, Media, Model, Prim, Word } from "./model";

export type Palette = { paper: string; ink: string; ink3: string; mark: string; rule: string };

export function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return { paper: v("--paper"), ink: v("--ink"), ink3: v("--ink-3"), mark: v("--mark"), rule: v("--rule-strong") };
}

/* ------------------------------------------------------------------ drawing */

export function hatch(ctx: CanvasRenderingContext2D, color: string, dpr: number): CanvasPattern | null {
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
export const readMono = () => {
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

function drawPrims(ctx: CanvasRenderingContext2D, m: Media, sx: number, sy: number, p: Palette) {
  const prims = m.prims ?? [];
  ctx.save();
  ctx.beginPath();
  ctx.rect(m.x - sx, m.y - sy, m.w, m.h);
  ctx.clip();

  // lines: the drawing's field, ticks and edges, quieter than its shapes
  ctx.strokeStyle = p.ink3;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  for (const l of prims) {
    if (l.tag !== "line") continue;
    const x0 = l.x - sx;
    const y0 = l.y - sy;
    if (l.dir > 0) {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + l.w, y0 + l.h);
    } else {
      ctx.moveTo(x0, y0 + l.h);
      ctx.lineTo(x0 + l.w, y0);
    }
  }
  ctx.stroke();

  // svg text as line boxes, like every other run of text under the glass
  ctx.fillStyle = p.ink;
  for (const t of prims) {
    if (t.tag !== "text") continue;
    ctx.globalAlpha = 0.1;
    ctx.fillRect(t.x - sx, t.y - sy, t.w, t.h);
    ctx.globalAlpha = 0.55;
    ctx.fillRect(t.x - sx, t.y - sy + t.h * 0.78, t.w, 1);
  }

  // shapes: dashed redline outlines
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = p.mark;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  for (const s of prims) {
    const x0 = s.x - sx;
    const y0 = s.y - sy;
    if (s.tag === "rect") {
      ctx.rect(Math.round(x0) + 0.5, Math.round(y0) + 0.5, Math.max(1, Math.round(s.w) - 1), Math.max(1, Math.round(s.h) - 1));
    } else if (s.tag === "circle") {
      const rr = Math.max(0.5, s.w / 2 - 0.5);
      ctx.moveTo(x0 + s.w / 2 + rr, y0 + s.h / 2);
      ctx.arc(x0 + s.w / 2, y0 + s.h / 2, rr, 0, Math.PI * 2);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // the five largest rects carry their measured size; a pattern (a size that
  // repeats more than three times, like heatmap cells) is labelled once
  const size = (s: Prim) => `${Math.round(s.w)} × ${Math.round(s.h)}`;
  const rects = prims.filter((s) => s.tag === "rect" && s.w >= 24 && s.h >= 24);
  const count = new Map<string, number>();
  for (const s of rects) count.set(size(s), (count.get(size(s)) ?? 0) + 1);
  const labelled = new Set<string>();
  const big = rects
    .sort((a, b) => b.w * b.h - a.w * a.h)
    .filter((s) => {
      const k = size(s);
      if ((count.get(k) ?? 0) > 3 && labelled.has(k)) return false;
      labelled.add(k);
      return true;
    })
    .slice(0, 5);
  for (const s of big) tag(ctx, `rect ${size(s)}`, Math.round(s.x - sx), Math.round(s.y - sy), p);
  ctx.restore();
}

export type Frame = {
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

export function draw(f: Frame) {
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

  // Only what the glass can show is drawn: in lens mode that is the lens's
  // bounding box, not the viewport. On a slow CPU this is most of the frame.
  const lens = !f.scan && r < Math.max(W, H) * 0.45;
  const X0 = lens ? cx - r - 2 : 0;
  const X1 = lens ? cx + r + 2 : W;
  const Y0 = lens ? cy - r - 2 : 0;
  const Y1 = lens ? cy + r + 2 : H;
  const out = (x: number, y: number, w: number, h: number) => x > X1 || x + w < X0 || y > Y1 || y + h < Y0;
  // the first line of a regular field at or before `from`
  const first = (start: number, step: number, from: number) => from - ((((from - start) % step) + step) % step);

  // vellum
  ctx.globalAlpha = 0.975;
  ctx.fillStyle = p.paper;
  ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  ctx.globalAlpha = 1;

  // millimetre paper: an 8px field, emphasised every 64px, locked to the document
  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 1;
  const oy = -(sy % 64);
  ctx.globalAlpha = 0.09;
  ctx.beginPath();
  for (let y = first(oy, 8, Y0); y < Y1; y += 8) {
    ctx.moveTo(X0, Math.round(y) + 0.5);
    ctx.lineTo(X1, Math.round(y) + 0.5);
  }
  for (let x = first(0, 8, X0); x < X1; x += 8) {
    ctx.moveTo(x + 0.5, Y0);
    ctx.lineTo(x + 0.5, Y1);
  }
  ctx.stroke();
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  for (let y = first(oy, 64, Y0); y < Y1; y += 64) {
    ctx.moveTo(X0, Math.round(y) + 0.5);
    ctx.lineTo(X1, Math.round(y) + 0.5);
  }
  for (let x = first(0, 64, X0); x < X1; x += 64) {
    ctx.moveTo(x + 0.5, Y0);
    ctx.lineTo(x + 0.5, Y1);
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
    if (out(x, y, l.w, l.h)) continue;
    ctx.globalAlpha = 0.1;
    ctx.fillRect(x, y, l.w, l.h);
    ctx.globalAlpha = 0.55;
    ctx.fillRect(x, y + l.h * 0.78, l.w, 1);
  }
  ctx.globalAlpha = 1;

  // media: frame and size; a picture gets the architect's cross, a drawing is
  // redrawn from its measured primitives
  for (const m of model.media) {
    const x = m.x - sx;
    const y = m.y - sy;
    if (out(x, y, m.w, m.h)) continue;
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(m.w) - 1, Math.round(m.h) - 1);
    if (m.prims) {
      ctx.globalAlpha = 1;
      drawPrims(ctx, m, sx, sy, p);
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + m.w, y + m.h);
      ctx.moveTo(x + m.w, y);
      ctx.lineTo(x, y + m.h);
      ctx.globalAlpha = 0.18;
      ctx.stroke();
    }
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
    // the tag above the type block reaches about 20px higher than its box
    if (out(t.x - sx, ty - 20, t.w, t.h + 20)) continue;
    ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = Math.max(0.75, t.size / 160);
    const rows = new Map<number, Word[]>();
    for (const w of t.words) {
      const key = Math.round(w.y);
      rows.set(key, [...(rows.get(key) ?? []), w]);
      if (out(w.x - sx, w.y - sy, w.w, w.h)) continue;
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
        // at small sizes x-height and cap height sit closer than a label is
        // tall: keep the cap height label, drop the x-height one
        const crowded = label.startsWith("x-height") && cap - xh < 14;
        if ((first || t.size > 60) && !crowded) {
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
  const placed: [number, number, number, number][] = [];
  const free = (x: number, y: number, w: number, h: number) => {
    if (placed.some(([px, py, pw, ph]) => x < px + pw && x + w > px && y < py + ph && y + h > py)) return false;
    placed.push([x, y, w, h]);
    return true;
  };
  const byGroup = new Map<Element, Box[]>();
  for (const b of model.boxes) {
    const x = b.x - (b.fixed ? 0 : sx);
    const y = b.y - (b.fixed ? 0 : sy);
    if (b.group) byGroup.set(b.group, [...(byGroup.get(b.group) ?? []), b]);
    if (out(x, y, b.w, b.h + 20)) continue;
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
    // keep the tag readable below the fixed header while its box scrolls past;
    // tags pinned there (or any two labels) never print over one another
    const headerH = b.fixed ? 15 : 78;
    const ty = Math.min(Math.max(Math.round(y), headerH), Math.round(y + b.h));
    ctx.font = MONO;
    if (free(Math.round(x), ty - 15, ctx.measureText(b.label).width + 10, 15)) tag(ctx, b.label, Math.round(x), ty, p);
    ctx.font = MONO;
    const dims = `${Math.round(b.w)} × ${Math.round(b.h)}`;
    // just under the box's bottom-right corner: inside it, the label sat on
    // the last line box of short components
    const dw = ctx.measureText(dims).width;
    const dx = Math.min(x + b.w - dw, W - dw - 6);
    if (free(dx, y + b.h + 2, dw, 12)) {
      ctx.fillStyle = p.mark;
      ctx.fillText(dims, dx, y + b.h + 12);
    }
  }
  for (const group of byGroup.values()) {
    const sorted = group.filter((b) => !b.fixed).sort((a, b) => a.y - b.y);
    for (let i = 1; i < sorted.length; i++) {
      const a = sorted[i - 1]!;
      const b = sorted[i]!;
      const gap0 = a.y + a.h - sy;
      const gap1 = b.y - sy;
      if (gap1 < 0 || gap0 > H) continue;
      // centred over the overlap of the two boxes: at the left edge it
      // landed on the next box's name tag
      const l = Math.max(a.x, b.x);
      const r = Math.min(a.x + a.w, b.x + b.w);
      dimension(ctx, (r > l + 48 ? (l + r) / 2 : l + 24) - sx, gap0, gap1, p);
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

  rim(f);
}

/** The lens's rim: a hairline bezel with degree ticks, crosshair and live readout. */
function rim(f: Frame) {
  const { ctx, W, H, cx, cy, r, p } = f;
  const sx = window.scrollX;
  const sy = window.scrollY;
  if (r > 4 && r < Math.hypot(W, H) * 0.9) {
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

/**
 * The lens, from a cache: the scene only changes when the page scrolls,
 * resizes, is remeasured or re-themed, never when the pointer moves, so it
 * is rendered once into `scene` (viewport-sized) and each frame blits just
 * the circle under the lens, then draws the rim.
 */
export function drawLens(f: Frame, scene: HTMLCanvasElement) {
  const { ctx, W, H, cx, cy, r } = f;
  ctx.clearRect(0, 0, W, H);
  if (r < 0.5) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(r, 0), 0, Math.PI * 2);
  ctx.clip();
  const x0 = Math.max(0, Math.floor(cx - r - 1));
  const y0 = Math.max(0, Math.floor(cy - r - 1));
  const x1 = Math.min(W, Math.ceil(cx + r + 1));
  const y1 = Math.min(H, Math.ceil(cy + r + 1));
  if (x1 > x0 && y1 > y0) {
    const k = scene.width / W; // the scene's device pixels per CSS px
    ctx.drawImage(scene, x0 * k, y0 * k, (x1 - x0) * k, (y1 - y0) * k, x0, y0, x1 - x0, y1 - y0);
  }
  ctx.restore();
  rim(f);
}

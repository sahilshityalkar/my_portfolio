/**
 * The glass's model of the page: what it measures from the live DOM (spec'd
 * component boxes, display type with its metrics, every text line box, the
 * column grid, media and svg primitives), in document coordinates. Pure DOM
 * reads; nothing here draws or holds state.
 */
export type Box = {
  label: string;
  x: number; y: number; w: number; h: number; // document coordinates
  pad: [number, number, number, number]; // t r b l
  fixed: boolean;
  group: Element | null;
};
/** Each word keeps its own font, so a roman line and an italic line both redraw truthfully. */
export type Word = { text: string; x: number; y: number; w: number; h: number; font: string; spacing: string; ascent: number };
export type TypeSpec = {
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
export type Line = { x: number; y: number; w: number; h: number; fixed: boolean };
export type Grid = { cols: [number, number][] } | null;
/** A measured svg primitive: rect, circle, line or text, in document coordinates. */
export type Prim = { tag: "rect" | "circle" | "line" | "text"; x: number; y: number; w: number; h: number; dir: 1 | -1 };
export type Media = { x: number; y: number; w: number; h: number; label: string; prims: Prim[] | null };
export type Model = { boxes: Box[]; types: TypeSpec[]; lines: Line[]; grid: Grid; media: Media[] };

export const EMPTY: Model = { boxes: [], types: [], lines: [], grid: null, media: [] };

function isFixed(el: Element): boolean {
  for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
    if (getComputedStyle(n).position === "fixed") return true;
  }
  return false;
}

export function measure(ctx: CanvasRenderingContext2D): Model {
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
    // callouts inside a heading (the hero's CAP) are annotations, not letterforms
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement?.closest("[data-loupe-skip]") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
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
    const own = (q: string) => [...el.querySelectorAll(q)].find((n) => !n.closest("[data-loupe-skip]"));
    const svg = el.tagName === "FIGURE" ? own("svg") : undefined;
    const kind = el.tagName === "FIGURE" ? (svg ? "svg" : own("img") ? "img" : "figure") : el.tagName.toLowerCase();
    media.push({
      x: r.left + sx,
      y: r.top + sy,
      w: r.width,
      h: r.height,
      label: `${kind} ${Math.round(r.width)} × ${Math.round(r.height)}`,
      prims: svg ? primitives(svg, sx, sy) : null,
    });
  });

  return { boxes, types, lines, grid, media };
}

/**
 * A drawing's own construction: its rects, circles and text first (they carry
 * the meaning), then its lines, up to 160 in all. Measured like everything
 * else, so the glass over a plate shows what the plate is made of.
 */
function primitives(svg: Element, sx: number, sy: number): Prim[] {
  const out: Prim[] = [];
  const take = (q: string) => {
    for (const el of svg.querySelectorAll<SVGGraphicsElement>(q)) {
      if (out.length >= 160) return;
      if (el.closest("[data-loupe-skip]")) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 && r.height < 0.5) continue;
      let dir: 1 | -1 = 1;
      if (el instanceof SVGLineElement) {
        const dx = el.x2.baseVal.value - el.x1.baseVal.value;
        const dy = el.y2.baseVal.value - el.y1.baseVal.value;
        dir = dx * dy < 0 ? -1 : 1;
      }
      out.push({ tag: el.tagName.toLowerCase() as Prim["tag"], x: r.left + sx, y: r.top + sy, w: r.width, h: r.height, dir });
    }
  };
  take("rect, circle, text");
  take("line");
  return out;
}

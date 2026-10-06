import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.role} at ${profile.company}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f5f2ec";
const INK = "#1c1b19";
const INK3 = "#6e685f";
const MARK = "#a8402a";

// Name block geometry, shared by the real type and its copy under the glass.
const NAME = { left: 64, top: 128, size: 168, indent: 190 };
const LINE = NAME.size * 0.9;
const GLASS = { x: 668, y: 330, r: 148 };

/** The share card: the hero, with the glass resting over the surname. */
export default async function OG() {
  const dir = join(process.cwd(), "src/assets/og");
  const [serif, italic, mono] = await Promise.all([
    readFile(join(dir, "newsreader-400.woff")),
    readFile(join(dir, "newsreader-400-italic.woff")),
    readFile(join(dir, "plex-mono-500.woff")),
  ]);
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.join(" ");

  const name = (color: string, dx: number, dy: number) => (
    <div
      style={{
        position: "absolute",
        left: NAME.left - dx,
        top: NAME.top - dy,
        display: "flex",
        flexDirection: "column",
        fontSize: NAME.size,
        lineHeight: 0.9,
        letterSpacing: -6,
        color,
        width: 1100,
      }}
    >
      <span style={{ fontFamily: "Newsreader", height: LINE }}>{first}</span>
      <span style={{ fontFamily: "NewsreaderItalic", paddingLeft: NAME.indent, height: LINE }}>{last}</span>
    </div>
  );

  const gx = GLASS.x - GLASS.r;
  const gy = GLASS.y - GLASS.r;
  const d = GLASS.r * 2;
  // baselines of each line inside the glass, in glass coordinates
  const base2 = NAME.top + LINE + NAME.size * 0.72 - gy;
  const xh2 = base2 - NAME.size * 0.36;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, color: INK, position: "relative" }}>
        <div style={{ position: "absolute", left: 64, right: 64, top: 52, display: "flex", justifyContent: "space-between", fontFamily: "Plex", fontSize: 18, letterSpacing: 1.5, color: INK3, textTransform: "uppercase" }}>
          <span style={{ display: "flex", gap: 14 }}>
            <span style={{ color: MARK }}>01</span> Index
          </span>
          <span>Portfolio</span>
        </div>

        {name(INK, 0, 0)}

        {/* the glass: the same type, redrawn as a drawing on millimetre paper */}
        <div style={{ position: "absolute", left: gx, top: gy, width: d, height: d, borderRadius: d, overflow: "hidden", display: "flex", background: PAPER, border: `1.5px solid ${INK}` }}>
          {Array.from({ length: 22 }, (_, i) => (
            <div key={`h${i}`} style={{ position: "absolute", left: 0, top: i * 16, width: d, height: 1, background: MARK, opacity: i % 4 === 0 ? 0.22 : 0.08 }} />
          ))}
          {Array.from({ length: 22 }, (_, i) => (
            <div key={`v${i}`} style={{ position: "absolute", top: 0, left: i * 16, height: d, width: 1, background: MARK, opacity: i % 4 === 0 ? 0.22 : 0.08 }} />
          ))}
          {name(MARK, gx, gy)}
          <div style={{ position: "absolute", left: 0, top: base2, width: d, height: 1.5, background: MARK }} />
          <div style={{ position: "absolute", left: 0, top: xh2, width: d, borderTop: `1.5px dashed ${MARK}` }} />
          <div style={{ position: "absolute", left: GLASS.r, top: 0, width: 1, height: d, background: INK, opacity: 0.3 }} />
          <div style={{ position: "absolute", top: GLASS.r, left: 0, height: 1, width: d, background: INK, opacity: 0.3 }} />
        </div>
        <div style={{ position: "absolute", left: GLASS.x - 200, top: GLASS.y + GLASS.r + 12, width: 400, display: "flex", justifyContent: "center", fontFamily: "Plex", fontSize: 15, color: INK3, letterSpacing: 1 }}>
          baseline · x-height 0.50em
        </div>

        <div style={{ position: "absolute", left: 64, right: 64, bottom: 52, display: "flex", justifyContent: "space-between", paddingTop: 22, borderTop: "1px solid rgba(28,27,25,0.18)", fontFamily: "Plex", fontSize: 20, letterSpacing: 1.2, textTransform: "uppercase" }}>
          <span>
            {profile.role} — {profile.company}
          </span>
          <span style={{ color: MARK }}>Press L to look under the glass</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: serif, style: "normal", weight: 400 },
        { name: "NewsreaderItalic", data: italic, style: "italic", weight: 400 },
        { name: "Plex", data: mono, style: "normal", weight: 500 },
      ],
    },
  );
}

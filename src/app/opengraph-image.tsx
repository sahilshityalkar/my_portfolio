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

/** The share card: the hero, with the glass resting over the surname. */
export default async function OG() {
  const dir = join(process.cwd(), "src/assets/og");
  const [serif, italic, mono] = await Promise.all([
    readFile(join(dir, "newsreader-400.woff")),
    readFile(join(dir, "newsreader-400-italic.woff")),
    readFile(join(dir, "plex-mono-500.woff")),
  ]);
  const [first, ...rest] = profile.name.split(" ");

  const grid = (step: number, alpha: number) =>
    `repeating-linear-gradient(0deg, rgba(168,64,42,${alpha}) 0 1px, transparent 1px ${step}px), repeating-linear-gradient(90deg, rgba(168,64,42,${alpha}) 0 1px, transparent 1px ${step}px)`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAPER, color: INK, padding: "56px 64px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Plex", fontSize: 18, letterSpacing: 1.5, color: INK3, textTransform: "uppercase" }}>
          <span style={{ display: "flex", gap: 14 }}>
            <span style={{ color: MARK }}>01</span> Index
          </span>
          <span>Portfolio</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", fontFamily: "Newsreader", fontSize: 168, lineHeight: 0.9, letterSpacing: -6 }}>
          <span>{first}</span>
          <span style={{ fontFamily: "NewsreaderItalic", paddingLeft: 180 }}>{rest.join(" ")}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 22, borderTop: "1px solid rgba(28,27,25,0.18)", fontFamily: "Plex", fontSize: 20, letterSpacing: 1.2, textTransform: "uppercase" }}>
          <span>
            {profile.role} — {profile.company}
          </span>
          <span style={{ color: MARK }}>Press L to look under the glass</span>
        </div>

        {/* the glass */}
        <div
          style={{
            position: "absolute",
            left: 640,
            top: 150,
            width: 300,
            height: 300,
            borderRadius: 300,
            border: `1.5px solid ${INK}`,
            backgroundColor: "rgba(245,242,236,0.6)",
            backgroundImage: `${grid(64, 0.35)}, ${grid(8, 0.12)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, height: 1, background: "rgba(28,27,25,0.35)" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 150, width: 1, background: "rgba(28,27,25,0.35)" }} />
        </div>
        <div style={{ position: "absolute", left: 694, top: 470, fontFamily: "Plex", fontSize: 15, color: INK3, letterSpacing: 1 }}>x 790 · y 300 · 120 fps</div>
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

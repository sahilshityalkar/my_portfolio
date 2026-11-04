import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { formatDate, getPost, posts } from "@/content/writing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A note on frontend engineering by Sahil Shityalkar";

const PAPER = "#f5f2ec";
const INK = "#1c1b19";
const INK2 = "#45413b";
const INK3 = "#6e685f";
const MARK = "#a8402a";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

/** A note's share card: its date, title and dek, set like the page. */
export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const dir = join(process.cwd(), "src/assets/og");
  const [serif, mono] = await Promise.all([
    readFile(join(dir, "newsreader-400.woff")),
    readFile(join(dir, "plex-mono-500.woff")),
  ]);
  const title = post?.title ?? profile.name;
  const kicker = post?.dek ?? "";
  const year = post ? formatDate(post.date) : "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: PAPER, color: INK, padding: "52px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Plex", fontSize: 18, letterSpacing: 1.5, color: INK3, textTransform: "uppercase" }}>
          <span style={{ display: "flex", gap: 14 }}>
            <span style={{ color: MARK }}>Note</span>
            {year}
          </span>
          <span>{profile.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 64, flexGrow: 1 }}>
          <div style={{ fontFamily: "Newsreader", fontSize: title.length > 40 ? 72 : title.length > 24 ? 88 : 110, lineHeight: 0.95, letterSpacing: -4 }}>{title}</div>
          {kicker ? (
            <div style={{ fontFamily: "Newsreader", fontSize: 30, lineHeight: 1.3, color: INK2, marginTop: 30, maxWidth: 960 }}>{kicker}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 22, borderTop: "1px solid rgba(28,27,25,0.18)", fontFamily: "Plex", fontSize: 20, letterSpacing: 1.2, textTransform: "uppercase" }}>
          <span>
            {profile.name} · {profile.role}
          </span>
          <span style={{ color: INK3, textTransform: "none", letterSpacing: 0 }}>
            {profile.siteUrl.replace(/^https?:\/\//, "")}/writing
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: serif, style: "normal", weight: 400 },
        { name: "Plex", data: mono, style: "normal", weight: 500 },
      ],
    },
  );
}

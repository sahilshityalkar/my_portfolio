import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The home-screen icon: the same glass as icon.svg, on Day paper. iOS rounds
 * the corners itself, so the square is filled edge to edge.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f5f2ec" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <circle cx="14.5" cy="14.5" r="8" fill="none" stroke="#1c1b19" strokeWidth="1.75" />
          <path d="M20.5 20.5 26 26" stroke="#1c1b19" strokeWidth="2" strokeLinecap="round" />
          <circle cx="14.5" cy="14.5" r="2.25" fill="#a8402a" />
        </svg>
      </div>
    ),
    size,
  );
}

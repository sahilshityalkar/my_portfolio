"use client";

import dynamic from "next/dynamic";

/** The WebGL code is split out and only fetched when this experiment is opened. */
const GlassCanvas = dynamic(() => import("./GlassCanvas"), {
  ssr: false,
  loading: () => (
    <div className="wrap">
      <div className="t-meta grid aspect-[4/5] place-items-center bg-paper-2 text-ink-3 sm:aspect-[16/9]">
        Grinding the lens…
      </div>
    </div>
  ),
});

export default function Glass() {
  return <GlassCanvas />;
}

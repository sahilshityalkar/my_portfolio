import type { Experiment } from "@/content/types";

/**
 * Still sketches of each lab experiment, drawn in the site's drafting
 * vocabulary. They react to the card's hover (`group`) and are computed at
 * render time, so the server ships plain SVG and no media.
 */
const INK = "var(--ink)";
const MARK = "var(--mark)";
const RULE = "var(--rule-strong)";
const MONO = { fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.06em" } as const;

const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/** A grid seen through a lens: r → r·(1 + ½(1 − r²)), 1.5× at the centre, seamless at the rim. */
function Glass() {
  const C = { x: 150, y: 112 };
  const R = 70;
  const bend = (x: number, y: number): [number, number] => {
    const dx = (x - C.x) / R;
    const dy = (y - C.y) / R;
    const r2 = dx * dx + dy * dy;
    if (r2 >= 1) return [x, y];
    const s = 1 + 0.5 * (1 - r2);
    return [C.x + (x - C.x) * s, C.y + (y - C.y) * s];
  };
  const xs = Array.from({ length: 16 }, (_, i) => i * 20);
  const ys = Array.from({ length: 12 }, (_, i) => i * 20);
  const fine = Array.from({ length: 121 }, (_, i) => i * 2.5);
  return (
    <g>
      <g stroke={RULE} fill="none" strokeWidth="0.75" opacity="0.6">
        {xs.map((x) => <path key={`v${x}`} d={path(fine.slice(0, 91).map((y) => bend(x, y)))} />)}
        {ys.map((y) => <path key={`h${y}`} d={path(fine.map((x) => bend(x, y)))} />)}
      </g>
      <g className="origin-center transition-transform duration-1000 ease-(--ease-out) [transform-box:fill-box] group-hover:scale-110">
        <circle cx={C.x} cy={C.y} r={R} fill="none" stroke={INK} />
        <circle cx={C.x - 26} cy={C.y - 28} r="4" fill={MARK} opacity="0.85" />
      </g>
    </g>
  );
}

/** One damped spring, plotted over time: x(t) = e^(−ζωt)·cos(ωd·t). */
function Spring() {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 240; i++) {
    const t = i / 240;
    const v = Math.exp(-4.2 * t) * Math.cos(t * 16);
    pts.push([30 + t * 250, 112 - v * 72]);
  }
  return (
    <g>
      <g stroke={RULE} strokeWidth="0.75">
        <line x1="30" y1="112" x2="285" y2="112" />
        <line x1="30" y1="30" x2="30" y2="195" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={30 + i * 25} y1="112" x2={30 + i * 25} y2={i % 5 ? 116 : 120} />
        ))}
      </g>
      <path d={path(pts)} fill="none" stroke={INK} strokeWidth="1.25" pathLength={1} className="lab-draw" />
      <g style={MONO}>
        <text x="36" y="34" fill={MARK}>k 170 · c 19</text>
        <text x="285" y="128" textAnchor="end" fill={INK} opacity="0.6">t →</text>
        <text x="285" y="190" textAnchor="end" fill={INK} opacity="0.6">60 · 120 · 144 Hz</text>
      </g>
    </g>
  );
}

/** A page's construction drawing: boxes, a dimension, and type on its metrics. */
function Blueprint() {
  return (
    <g>
      <g stroke={MARK} fill="none" strokeDasharray="4 3">
        <rect x="34" y="34" width="232" height="72" />
        <rect x="34" y="122" width="108" height="70" />
        <rect x="158" y="122" width="108" height="70" />
      </g>
      <g stroke={MARK} strokeWidth="0.75" opacity="0.8">
        <line x1="34" y1="57" x2="266" y2="57" strokeDasharray="3 3" />
        <line x1="34" y1="92" x2="266" y2="92" />
      </g>
      <text x="44" y="92" fill="none" stroke={INK} strokeWidth="0.9" style={{ fontFamily: "var(--serif)", fontSize: 50, fontStyle: "italic" }}>
        Aa
      </text>
      <g fill={INK} opacity="0.2">
        {[134, 144, 154, 164].map((y, i) => (
          <rect key={y} x="44" y={y} width={i === 3 ? 48 : 86} height="3" rx="1.5" />
        ))}
        {[134, 144, 154].map((y, i) => (
          <rect key={y} x="168" y={y} width={i === 2 ? 52 : 86} height="3" rx="1.5" />
        ))}
      </g>
      {/* the gap between boxes, redlined; it extends on hover */}
      <g stroke={MARK} className="origin-center transition-transform duration-700 ease-(--ease-out) [transform-box:fill-box] group-hover:scale-y-125">
        <line x1="150" y1="107" x2="150" y2="121" />
        <line x1="146" y1="107" x2="154" y2="107" />
        <line x1="146" y1="121" x2="154" y2="121" />
      </g>
      <g style={MONO} fill={MARK}>
        <text x="158" y="118">16</text>
        <text x="266" y="30" textAnchor="end">232 × 72</text>
        <text x="200" y="89">baseline</text>
      </g>
    </g>
  );
}

export function LabPreview({ kind }: { kind: Experiment["preview"] }) {
  return (
    <svg viewBox="0 0 300 225" className="block size-full" aria-hidden="true">
      {kind === "glass" ? <Glass /> : kind === "spring" ? <Spring /> : <Blueprint />}
    </svg>
  );
}

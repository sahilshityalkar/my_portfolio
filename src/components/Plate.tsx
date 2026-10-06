/**
 * Drafting plates: technical drawings of each project, in the same vocabulary
 * as the Loupe (hairlines, dimension marks, mono labels, one accent). They are
 * schematic on purpose — a drawing of the idea, not a fake screenshot — and are
 * deterministic, so server and client render the same SVG.
 */
export type PlateKind = "replies" | "mastery" | "heatmap" | "arcs";

function rand(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const INK = "var(--ink)";
const MARK = "var(--mark)";
const RULE = "var(--rule-strong)";
const MONO = { fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em" } as const;

function Field() {
  return (
    <g stroke={RULE} strokeWidth="1" opacity="0.3">
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="450" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 60} x2="600" y2={i * 60} />
      ))}
    </g>
  );
}

function Bars({ x, y, w, rows, gap = 9, seed = 1 }: { x: number; y: number; w: number; rows: number; gap?: number; seed?: number }) {
  const r = rand(seed);
  return (
    <g fill={INK} opacity="0.22">
      {Array.from({ length: rows }, (_, i) => (
        <rect key={i} x={x} y={y + i * gap} width={i === rows - 1 ? w * (0.35 + r() * 0.3) : w * (0.82 + r() * 0.18)} height="3" rx="1.5" />
      ))}
    </g>
  );
}

/** One complaint in, three ready-to-send replies out. */
function Replies() {
  const cards = [0, 1, 2];
  return (
    <g>
      <g className="transition-transform duration-[1.4s] ease-(--ease-out) group-hover/plate:-translate-x-1.5">
        <rect x="56" y="150" width="170" height="118" rx="10" fill="var(--paper)" stroke={INK} />
        <text x="72" y="174" fill={INK} style={MONO}>COMPLAINT</text>
        <Bars x={72} y={188} w={136} rows={6} seed={2} />
      </g>
      <g fill="none" stroke={MARK} strokeWidth="1">
        {cards.map((i) => (
          <path key={i} d={`M226 209 C 280 209, 290 ${110 + i * 112}, 344 ${110 + i * 112}`} strokeDasharray="3 4" />
        ))}
      </g>
      {cards.map((i) => (
        <g
          key={i}
          className="transition-transform duration-[1.4s] ease-(--ease-out) group-hover/plate:translate-x-2"
          style={{ transitionDelay: `${i * 80}ms` }}
        >
          <rect x="344" y={62 + i * 112} width="200" height="96" rx="10" fill="var(--paper)" stroke={INK} />
          <text x="360" y={84 + i * 112} fill={i === 0 ? MARK : INK} style={MONO}>
            {`REPLY ${i + 1}`}
          </text>
          <Bars x={360} y={98 + i * 112} w={164} rows={4} seed={5 + i} />
        </g>
      ))}
      {/* dimension: the product's promise, from its README */}
      <g stroke={MARK} strokeWidth="1">
        <line x1="226" y1="416" x2="344" y2="416" />
        <line x1="226" y1="410" x2="226" y2="422" />
        <line x1="344" y1="410" x2="344" y2="422" />
      </g>
      <text x="285" y="406" textAnchor="middle" fill={MARK} style={MONO}>{"< 5 s"}</text>
    </g>
  );
}

/** Concepts as a graph: mastered (solid), gaps (dashed), and the next step. */
function Mastery() {
  const nodes: [number, number, "m" | "g" | "n"][] = [
    [110, 120, "m"], [210, 80, "m"], [190, 200, "m"], [300, 150, "m"], [290, 270, "g"],
    [400, 100, "m"], [410, 220, "n"], [510, 160, "g"], [500, 300, "g"], [380, 340, "g"], [150, 320, "m"],
  ];
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [3, 6], [5, 7], [6, 7], [6, 8], [4, 9], [9, 8], [2, 10], [10, 4]];
  return (
    <g>
      <g stroke={INK} strokeWidth="1" opacity="0.55">
        {edges.map(([a, b]) => {
          const [x1, y1] = nodes[a!]!;
          const [x2, y2] = nodes[b!]!;
          return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      {nodes.map(([x, y, k], i) =>
        k === "n" ? (
          <g key={i}>
            <circle cx={x} cy={y} r="26" fill="none" stroke={MARK} className="origin-center transition-transform duration-[1.4s] ease-(--ease-out) [transform-box:fill-box] group-hover/plate:scale-125" />
            <circle cx={x} cy={y} r="12" fill={MARK} />
          </g>
        ) : (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="12"
            fill={k === "m" ? INK : "var(--paper)"}
            stroke={INK}
            strokeDasharray={k === "g" ? "3 3" : undefined}
          />
        ),
      )}
      <g style={MONO}>
        <text x="436" y="216" fill={MARK}>NEXT</text>
        <text x="48" y="408" fill={INK} opacity="0.7">● MASTERED</text>
        <text x="160" y="408" fill={INK} opacity="0.7">◌ GAP</text>
      </g>
    </g>
  );
}

/** A cohort at a glance: concepts × students, one row called out. */
function Heatmap() {
  const r = rand(11);
  const cols = 12;
  const rows = 8;
  const slipping = 5;
  return (
    <g>
      <g>
        {Array.from({ length: rows }, (_, y) =>
          Array.from({ length: cols }, (_, x) => {
            const v = y === slipping ? 0.12 + r() * 0.18 : 0.25 + r() * 0.75;
            return <rect key={`${x}-${y}`} x={64 + x * 30} y={70 + y * 30} width="26" height="26" rx="3" fill={INK} opacity={v * 0.85} />;
          }),
        )}
      </g>
      <rect
        x="58"
        y={64 + slipping * 30}
        width={cols * 30 + 8}
        height="38"
        rx="5"
        fill="none"
        stroke={MARK}
        strokeWidth="1.5"
        className="transition-[stroke-width] duration-700 group-hover/plate:[stroke-width:2.5]"
      />
      <g stroke={MARK} fill="none">
        <path d={`M${64 + cols * 30 + 2} ${83 + slipping * 30} H 470 V 330`} strokeDasharray="3 4" />
      </g>
      <g className="transition-transform duration-[1.4s] ease-(--ease-out) group-hover/plate:-translate-y-1.5">
        <rect x="438" y="330" width="120" height="74" rx="8" fill="var(--paper)" stroke={INK} />
        <text x="452" y="352" fill={MARK} style={MONO}>NEEDS HELP</text>
        <Bars x={452} y={364} w={92} rows={3} seed={9} />
      </g>
      <g style={MONO} fill={INK} opacity="0.7">
        <text x="64" y="56">CONCEPTS →</text>
        <text x="40" y="320" transform="rotate(-90 40 320)">STUDENTS →</text>
      </g>
    </g>
  );
}

function Arcs({ seed }: { seed: number }) {
  const r = rand(seed);
  const cx = Math.round(180 + r() * 240);
  const cy = Math.round(120 + r() * 160);
  const arcs = Array.from({ length: 5 }, (_, i) => Math.round(40 + i * (26 + r() * 14)));
  return (
    <g fill="none" stroke={INK}>
      {arcs.map((a, i) => (
        <circle key={a} cx={cx} cy={cy} r={a} strokeDasharray={i % 2 ? "2 5" : undefined} opacity={1 - i * 0.14} />
      ))}
      <line x1="0" y1={cy} x2="600" y2={cy} stroke={MARK} opacity="0.6" />
      <line x1={cx} y1="0" x2={cx} y2="450" stroke={MARK} opacity="0.6" />
    </g>
  );
}

export function Plate({ seed, numeral, caption, kind = "arcs" }: { seed: number; numeral: string; caption: string; kind?: PlateKind }) {
  return (
    <figure className="group/plate relative aspect-[4/3] overflow-hidden bg-paper-2">
      <svg viewBox="0 0 600 450" className="absolute inset-0 size-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <Field />
        {kind === "replies" ? <Replies /> : kind === "mastery" ? <Mastery /> : kind === "heatmap" ? <Heatmap /> : <Arcs seed={seed} />}
        <g stroke={MARK} strokeWidth="1" opacity="0.8">
          {Array.from({ length: 41 }, (_, i) => (
            <line key={i} x1={i * 15} y1="450" x2={i * 15} y2={i % 4 ? 445 : 438} />
          ))}
        </g>
        <text
          x="572"
          y="70"
          textAnchor="end"
          fill={INK}
          opacity="0.9"
          className="font-serif italic"
          style={{ fontSize: 56, fontWeight: 300, letterSpacing: "-0.03em" }}
        >
          {numeral}
        </text>
      </svg>
      <figcaption className="t-meta absolute left-3 top-3 text-ink-3">{caption}</figcaption>
    </figure>
  );
}

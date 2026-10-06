/**
 * A still drawing of Lab 001: a grid seen through a lens. The bent lines are
 * computed with the same idea as the shader (points pulled outward by a
 * spherical cap), so the thumbnail is a true sketch of the experiment.
 */
const R = 34;
const C = 60;

/** r → r·(1 + ½(1 − r²)): magnifies 1.5× at the centre, meets the page at the rim. */
function bend(x: number, y: number): [number, number] {
  const dx = (x - C) / R;
  const dy = (y - C) / R;
  const r2 = dx * dx + dy * dy;
  if (r2 >= 1) return [x, y];
  const s = 1 + 0.5 * (1 - r2);
  return [C + (x - C) * s, C + (y - C) * s];
}

function line(points: [number, number][]) {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

export function GlassMark() {
  const ticks = Array.from({ length: 13 }, (_, i) => 6 + i * 9);
  const samples = Array.from({ length: 49 }, (_, i) => 6 + i * 2.25);
  return (
    <svg viewBox="0 0 120 120" className="size-24 shrink-0 sm:size-28" aria-hidden="true">
      <g stroke="var(--rule-strong)" fill="none" strokeWidth="0.75">
        {ticks.map((t) => (
          <g key={t}>
            <path d={line(samples.map((s) => bend(t, s)))} />
            <path d={line(samples.map((s) => bend(s, t)))} />
          </g>
        ))}
      </g>
      <g className="origin-center transition-transform duration-700 ease-(--ease-out) [transform-box:fill-box] group-hover:scale-110">
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--ink)" strokeWidth="1" />
        <circle cx={C - 12} cy={C - 13} r="3" fill="var(--mark)" opacity="0.8" />
      </g>
    </svg>
  );
}

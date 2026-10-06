/**
 * A drafting plate: the stand-in image for a case study. Deterministic per
 * seed, drawn in the same vocabulary as the Loupe (rules, arcs, ticks, a
 * numeral), so an unfinished case study reads as a deliberate plate in a
 * folio rather than a missing screenshot. Replace with real imagery later.
 */
function rand(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function Plate({ seed, numeral, caption }: { seed: number; numeral: string; caption: string }) {
  const r = rand(seed);
  const cx = Math.round(180 + r() * 240);
  const cy = Math.round(120 + r() * 160);
  const arcs = Array.from({ length: 5 }, (_, i) => Math.round(40 + i * (26 + r() * 14)));
  const angle = (Math.round(r() * 60 - 30) * Math.PI) / 180;

  return (
    <figure className="group/plate relative aspect-[4/3] overflow-hidden bg-paper-2">
      <svg viewBox="0 0 600 450" className="absolute inset-0 size-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
        <g stroke="var(--rule-strong)" strokeWidth="1" fill="none" opacity="0.35">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="450" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 60} x2="600" y2={i * 60} />
          ))}
        </g>
        <g
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1"
          className="transition-transform duration-[1.6s] ease-(--ease-out) group-hover/plate:rotate-[8deg]"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {arcs.map((a, i) => (
            <circle key={a} cx={cx} cy={cy} r={a} strokeDasharray={i % 2 ? "2 5" : undefined} opacity={1 - i * 0.14} />
          ))}
          <line x1={cx} y1={cy} x2={Math.round(cx + Math.cos(angle) * 260)} y2={Math.round(cy + Math.sin(angle) * 260)} />
        </g>
        <g stroke="var(--mark)" strokeWidth="1">
          <line x1="0" y1={cy} x2="600" y2={cy} opacity="0.6" />
          <line x1={cx} y1="0" x2={cx} y2="450" opacity="0.6" />
          {Array.from({ length: 40 }, (_, i) => (
            <line key={i} x1={i * 15} y1="450" x2={i * 15} y2={i % 4 ? 444 : 436} />
          ))}
        </g>
        <text
          x="560"
          y="410"
          textAnchor="end"
          fill="var(--ink)"
          className="font-serif italic transition-transform duration-[1.6s] ease-(--ease-out) group-hover/plate:-translate-y-2"
          style={{ fontSize: 210, fontWeight: 300, letterSpacing: "-0.04em" }}
        >
          {numeral}
        </text>
      </svg>
      <figcaption className="t-meta absolute left-3 top-3 text-ink-3">{caption}</figcaption>
    </figure>
  );
}

/**
 * One heading system for every section: a printed rule, the sheet number in
 * the corner under it, and the title. Work is the page's primary section and
 * keeps the large title; every other section uses the compact size, so the
 * hierarchy reads at a glance and no two big serif lines stack up.
 *
 * The rule and number are printed, not revealed: they are on the page from
 * the first frame, so the next section's rule can peek above the fold. Work's
 * title is printed too (it sits on the first screen at desktop sizes); the
 * other titles and the asides rise in.
 */
export function SectionHead({
  n,
  title,
  id,
  aside,
  size = "compact",
}: {
  n: string;
  title: string;
  id: string;
  aside?: React.ReactNode;
  size?: "primary" | "compact";
}) {
  return (
    <div data-section-head className={`grid-12 gap-y-3 border-t border-(--rule-strong) pt-4 ${size === "primary" ? "items-end gap-y-4" : "items-baseline"}`}>
      {/* the sheet number sits in the corner under the rule, like a drawing's */}
      <p className="t-meta col-span-2 self-start text-mark md:col-span-3">{n}</p>
      <h2
        id={id}
        className={`t-title col-span-10 md:col-span-6 ${size === "compact" ? "text-[clamp(1.8rem,3vw,2.6rem)]" : ""}`}
        data-spec-type="Newsreader"
        {...(size === "primary" ? {} : { "data-reveal": "" })}
      >
        {title}
      </h2>
      {aside ? (
        <div className="t-meta col-span-12 text-balance text-ink-3 md:col-span-3 md:text-right" data-reveal style={{ ["--i" as string]: 1 }}>
          {aside}
        </div>
      ) : null}
    </div>
  );
}

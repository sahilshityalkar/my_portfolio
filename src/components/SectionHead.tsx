/**
 * The sheet's rule and number are printed, not revealed: they are on the page
 * from the first frame, so the next section's rule can peek above the fold.
 * Only the title and the aside rise in.
 */
export function SectionHead({ n, title, id, aside }: { n: string; title: string; id: string; aside?: React.ReactNode }) {
  return (
    <div className="grid-12 items-end gap-y-4 border-t border-(--rule-strong) pt-4">
      {/* the sheet number sits in the corner under the rule, like a drawing's */}
      <p className="t-meta col-span-2 self-start text-mark md:col-span-3">{n}</p>
      <h2 id={id} className="t-title col-span-10 md:col-span-6" data-spec-type="Newsreader" data-reveal>
        {title}
      </h2>
      {aside ? (
        <div className="t-meta col-span-12 text-ink-3 md:col-span-3 md:text-right" data-reveal style={{ ["--i" as string]: 1 }}>
          {aside}
        </div>
      ) : null}
    </div>
  );
}

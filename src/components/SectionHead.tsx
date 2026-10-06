export function SectionHead({ n, title, id, aside }: { n: string; title: string; id: string; aside?: React.ReactNode }) {
  return (
    <div className="grid-12 items-end gap-y-4 border-t border-(--rule-strong) pt-4" data-reveal>
      <p className="t-meta col-span-2 text-mark md:col-span-3">{n}</p>
      <h2 id={id} className="t-title col-span-10 md:col-span-6">
        {title}
      </h2>
      {aside ? <div className="t-meta col-span-12 text-ink-3 md:col-span-3 md:text-right">{aside}</div> : null}
    </div>
  );
}

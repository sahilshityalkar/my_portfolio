import { lab, labHref, labLive, labUrl } from "@/content/lab";
import type { Experiment } from "@/content/types";
import { LabPreview } from "@/components/LabPreview";

const host = labUrl.replace(/^https?:\/\//, "");

/**
 * Three featured experiments. The lab itself is a separate site; until it is
 * deployed (`labLive`), the entries are a plain list, not links.
 */
export function Lab() {
  const featured = lab.slice(0, 3);
  return (
    <section id="lab" aria-labelledby="lab-title" data-spec="Lab" className="wrap py-16 sm:py-24">
      {/* a compact band, not another big heading: rule, number, a modest title */}
      <div className="grid-12 items-baseline gap-y-3 border-t border-(--rule-strong) pt-4" data-reveal>
        <p className="t-meta col-span-2 text-mark md:col-span-3">05</p>
        <h2
          id="lab-title"
          className="t-title col-span-10 text-[clamp(1.8rem,3vw,2.6rem)] md:col-span-5"
          data-spec-type="Newsreader"
        >
          Lab
        </h2>
        <div className="t-meta col-span-12 text-ink-3 md:col-span-4 md:text-right">
          {labLive ? (
            <a href={labUrl} target="_blank" rel="noreferrer" className="link-draw">
              {host} ↗
            </a>
          ) : (
            "Separate site, in progress"
          )}
        </div>
      </div>

      <div className="grid-12 mt-8 gap-y-8 sm:mt-10">
        <p className="col-span-12 max-w-[46ch] text-ink-2 lg:col-span-3" data-reveal>
          Small experiments in motion, rendering and layout, each about a single idea. They live on their own site, so
          they can be as heavy as they need to be without slowing this one down.
        </p>

        <ol className="col-span-12 grid gap-x-[clamp(0.75rem,1.6vw,1.5rem)] gap-y-10 md:grid-cols-3 lg:col-span-9">
          {featured.map((e, i) => (
            <li key={e.slug} data-reveal data-spec={`Experiment ${e.index}`} style={{ ["--i" as string]: i }}>
              {labLive ? (
                <a
                  href={labHref(e.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                  aria-label={`${e.title}: ${e.summary} Opens on ${host}.`}
                >
                  <Entry e={e} live />
                </a>
              ) : (
                <Entry e={e} />
              )}
            </li>
          ))}
        </ol>
      </div>

      {labLive ? (
        <a
          href={labUrl}
          target="_blank"
          rel="noreferrer"
          className="group mt-16 flex flex-col gap-3 border-y border-(--rule-strong) py-6 sm:mt-24 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          data-reveal
        >
          <span className="t-meta text-ink-3">All experiments</span>
          <span className="t-title text-[clamp(1.1rem,5.2vw,2.75rem)] [overflow-wrap:anywhere] transition-transform duration-700 ease-(--ease-out) group-hover:-translate-x-2">
            {host} <span className="text-mark">↗</span>
          </span>
        </a>
      ) : null}
    </section>
  );
}

/** Below md a thumbnail beside the text, so the list stays short on a phone. */
function Entry({ e, live = false }: { e: Experiment; live?: boolean }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-x-4 md:block">
      <figure
        className={`relative aspect-[4/3] overflow-hidden border border-rule bg-paper-2 md:aspect-auto md:h-40 ${
          live ? "transition-colors duration-500 group-hover:border-(--rule-strong)" : ""
        }`}
      >
        <LabPreview kind={e.preview} />
        <figcaption className="t-meta absolute left-1.5 top-1.5 bg-paper-2 px-1 text-mark md:left-3 md:top-3">
          {e.index}
        </figcaption>
      </figure>
      <div>
        <div className="flex items-baseline justify-between gap-4 md:mt-4">
          <h3
            className={`t-title text-[clamp(1.5rem,2vw,1.85rem)] ${
              live ? "transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-1.5" : ""
            }`}
          >
            {e.title}
          </h3>
          {live ? (
            <span aria-hidden="true" className="t-meta text-ink-3 transition-colors group-hover:text-ink">
              Open ↗
            </span>
          ) : null}
        </div>
        <p className="mt-2 max-w-[40ch] text-ink-2">{e.summary}</p>
        <p className="t-meta mt-3 text-ink-3">{e.tech}</p>
      </div>
    </div>
  );
}

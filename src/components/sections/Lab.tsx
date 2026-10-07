import { lab, labHref, labUrl } from "@/content/lab";
import { SectionHead } from "@/components/SectionHead";
import { LabPreview } from "@/components/LabPreview";

const host = labUrl.replace(/^https?:\/\//, "");

/** Three featured experiments. The lab itself is a separate site. */
export function Lab() {
  const featured = lab.slice(0, 3);
  return (
    <section id="lab" aria-labelledby="lab-title" data-spec="Lab" className="wrap py-24 sm:py-36">
      <SectionHead
        n="04"
        id="lab-title"
        title="Lab"
        aside={
          <a href={labUrl} target="_blank" rel="noreferrer" className="link-draw">
            {host} ↗
          </a>
        }
      />

      <p className="mt-12 max-w-[46ch] text-ink-2 sm:mt-16" data-reveal>
        Small experiments in motion, rendering and layout, each about a single idea. They live on their own site, so
        they can be as heavy as they need to be without slowing this one down.
      </p>

      <ol className="mt-10 grid gap-x-[clamp(0.75rem,1.6vw,1.5rem)] gap-y-12 sm:mt-14 md:grid-cols-3">
        {featured.map((e, i) => (
          <li key={e.slug} data-reveal style={{ ["--i" as string]: i }}>
            <a
              href={labHref(e.slug)}
              target="_blank"
              rel="noreferrer"
              data-spec={`Experiment ${e.index}`}
              className="group block"
              aria-label={`${e.title}: ${e.summary} Opens on ${host}.`}
            >
              <figure className="relative aspect-[4/3] overflow-hidden border border-rule bg-paper-2 transition-colors duration-500 group-hover:border-(--rule-strong)">
                <LabPreview kind={e.preview} />
                <figcaption className="t-meta absolute left-3 top-3 bg-paper-2 px-1 text-mark">{e.index}</figcaption>
              </figure>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="t-title text-[clamp(1.6rem,2.4vw,2.1rem)] transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-1.5">
                  {e.title}
                </h3>
                <span aria-hidden="true" className="t-meta text-ink-3 transition-colors group-hover:text-ink">
                  Open ↗
                </span>
              </div>
              <p className="mt-3 max-w-[40ch] text-ink-2">{e.summary}</p>
              <p className="t-meta mt-4 text-ink-3">{e.tech}</p>
            </a>
          </li>
        ))}
      </ol>

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
    </section>
  );
}

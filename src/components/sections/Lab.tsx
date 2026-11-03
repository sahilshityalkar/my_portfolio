import { lab, labHref, labLive, labUrl } from "@/content/lab";
import type { Experiment } from "@/content/types";
import { LabPreview } from "@/components/LabPreview";
import { SectionHead } from "@/components/SectionHead";
import { InspectButton } from "@/components/InspectButton";

const host = labUrl.replace(/^https?:\/\//, "");

/**
 * Three featured experiments as one compact list. The lab itself is a
 * separate site; until it is deployed (`labLive`) nothing links there, and
 * each entry says plainly where it stands. The one experiment that already
 * runs on this page (the glass) can be tried right here.
 */
export function Lab() {
  const featured = lab.slice(0, 3);
  return (
    <section id="lab" aria-labelledby="lab-title" data-spec="Lab" className="wrap py-12 sm:py-20">
      <SectionHead
        n="05"
        id="lab-title"
        title="Lab"
        aside={
          labLive ? (
            <a href={labUrl} target="_blank" rel="noreferrer" className="link-draw">
              {host} ↗
            </a>
          ) : (
            `Coming to ${host}`
          )
        }
      />

      <div className="grid-12 mt-6 gap-y-6 sm:mt-10">
        <p className="col-span-12 max-w-[46ch] text-ink-2 lg:col-span-3" data-reveal>
          Small experiments in motion, rendering and layout, each about a single idea. They live on their own site, so
          they can be as heavy as they need to be without slowing this one down.
        </p>

        <ol className="col-span-12 border-t border-rule lg:col-span-9">
          {featured.map((e, i) => (
            <li
              key={e.slug}
              data-reveal
              data-spec={`Experiment ${e.index}`}
              className="border-b border-rule py-4"
              style={{ ["--i" as string]: i }}
            >
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
    </section>
  );
}

/** One row: a small still of the experiment, what it is, and where it stands. */
function Entry({ e, live = false }: { e: Experiment; live?: boolean }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-x-4 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:gap-x-6">
      <figure
        className={`relative aspect-[4/3] overflow-hidden border border-rule bg-paper-2 ${
          live ? "transition-colors duration-500 group-hover:border-(--rule-strong)" : ""
        }`}
      >
        <LabPreview kind={e.preview} />
        <figcaption className="t-meta absolute left-1 top-1 bg-paper-2 px-1 text-[10px] text-mark">{e.index}</figcaption>
      </figure>
      <div>
        <h3 className="font-serif text-[1.45rem] leading-tight tracking-[-0.015em] text-ink">{e.title}</h3>
        <p className="mt-1 max-w-[52ch] text-ink-2">{e.summary}</p>
        <p className="t-meta mt-2 text-ink-3">{e.tech}</p>
      </div>
      <div className="t-meta col-start-2 mt-3 sm:col-start-3 sm:mt-1.5 sm:text-right">
        {live ? (
          <span aria-hidden="true" className="text-ink-3 transition-colors group-hover:text-ink">
            Open ↗
          </span>
        ) : e.onThisPage ? (
          <InspectButton className="link-draw uppercase text-ink">
            <span className="hidden [@media(pointer:fine)]:inline">
              Try it here: press <kbd className="font-[inherit] text-mark">L</kbd>
            </span>
            <span className="[@media(pointer:fine)]:hidden">Try it here</span>
          </InspectButton>
        ) : (
          <span className="text-ink-3">In progress</span>
        )}
      </div>
    </div>
  );
}

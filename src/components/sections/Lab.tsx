import Link from "next/link";
import { lab } from "@/content/lab";
import { SectionHead } from "@/components/SectionHead";

export function Lab() {
  return (
    <section id="lab" aria-labelledby="lab-title" data-spec="Lab" className="wrap py-24 sm:py-36">
      <SectionHead n="04" id="lab-title" title="Lab" aside={<Link href="/lab" className="link-draw">Full index →</Link>} />
      <div className="grid-12 mt-12 gap-y-10 sm:mt-20">
        <p className="col-span-12 max-w-[40ch] text-ink-2 md:col-span-4" data-reveal>
          Experiments that grow out of building this site. Small, finished, and each one about a single idea.
        </p>
        <ol className="col-span-12 md:col-span-8">
          {lab.map((e) => (
            <li key={e.slug} data-reveal>
              <Link
                href={`/lab/${e.slug}`}
                data-spec={`Experiment ${e.index}`}
                className="group grid grid-cols-[4rem_1fr] gap-x-4 border-t border-rule py-6 sm:grid-cols-[6rem_1fr_auto]"
              >
                <span className="t-meta pt-2 text-mark">{e.index}</span>
                <span>
                  <span className="t-title block transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-2">
                    {e.title}
                  </span>
                  <span className="mt-3 block max-w-[52ch] text-ink-2">{e.summary}</span>
                  <span className="t-meta mt-4 block text-ink-3">{e.tech}</span>
                </span>
                <span className="t-meta col-start-2 mt-4 self-start text-ink sm:col-start-3 sm:mt-2">
                  <span className="link-draw">Open</span> →
                </span>
              </Link>
            </li>
          ))}
          <li className="t-meta grid grid-cols-[4rem_1fr] gap-x-4 border-y border-dashed border-(--rule-strong) py-6 text-ink-3 sm:grid-cols-[6rem_1fr]" data-reveal>
            <span>{String(lab.length + 1).padStart(3, "0")}</span>
            <span>Next experiment — on the bench.</span>
          </li>
        </ol>
      </div>
    </section>
  );
}

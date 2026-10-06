import Link from "next/link";
import { work } from "@/content/work";
import { T, plain } from "@/components/Draftable";
import { CaseVisual } from "@/components/CaseVisual";
import { SectionHead } from "@/components/SectionHead";

export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" data-spec="Work" className="wrap py-24 sm:py-36">
      <SectionHead n="02" id="work-title" title="Selected work" aside={`${work.length} case studies`} />
      <ol className="mt-12 space-y-16 sm:mt-20 sm:space-y-28">
        {work.map((c, i) => (
          <li key={c.slug} data-reveal>
            <Link
              href={`/work/${c.slug}`}
              data-spec={`Case ${c.index}`}
              className="grid-12 group items-end gap-y-6"
              aria-label={`Case study ${c.index}: ${plain(c.title, "in preparation")}`}
            >
              <div className={`col-span-12 md:col-span-7 ${i % 2 ? "md:order-2 md:col-start-6" : ""}`}>
                <CaseVisual c={c} seed={i + 3} />
              </div>
              <div className={`col-span-12 md:col-span-4 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-9"}`}>
                <p className="t-meta flex gap-3 text-ink-3">
                  <span className="text-mark">{c.index}</span>
                  <T v={c.year} />
                </p>
                <h3 className="t-title mt-3 transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-2" data-spec-type="Newsreader">
                  <T v={c.title} />
                </h3>
                <T as="p" v={c.kicker} className="mt-4 max-w-[38ch] text-ink-2" />
                <dl className="t-meta mt-6 grid grid-cols-[6rem_1fr] gap-y-1.5 border-t border-rule pt-4">
                  <dt className="text-ink-3">Role</dt>
                  <T as="dd" v={c.role} />
                  <dt className="text-ink-3">Stack</dt>
                  <T as="dd" v={c.stack} />
                </dl>
                <p className="t-meta mt-6 text-ink">
                  <span className="link-draw">Read the case study</span> →
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

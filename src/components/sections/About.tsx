import Link from "next/link";
import { about } from "@/content/about";
import { T } from "@/components/Draftable";
import { SectionHead } from "@/components/SectionHead";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" data-spec="About" className="wrap py-24 sm:py-36">
      <SectionHead n="05" id="about-title" title="About" />

      <div className="grid-12 mt-12 gap-y-16 sm:mt-20">
        <div className="col-span-12 md:col-span-6 lg:col-span-5" data-reveal>
          <div className="space-y-6 md:sticky md:top-[calc(var(--header-h)+2rem)]">
            {about.paragraphs.map((p, i) => (
              <T key={i} as="p" v={p} className={i === 0 ? "t-lede text-balance" : "text-ink-2"} />
            ))}
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-7" data-reveal>
          <h3 className="t-meta text-ink-3">What I bring</h3>
          <ol className="mt-4 border-t border-rule">
            {about.capabilities.map((c, i) => (
              <li key={c.title} data-spec="Capability" className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-rule py-5">
                <span className="t-meta pt-1.5 text-mark">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h4 className="text-[1.2rem] leading-snug text-ink">{c.title}</h4>
                  <T as="p" v={c.body} className="mt-1.5 text-ink-2" />
                  <p className="t-meta mt-3 text-ink-3">
                    <span className="text-mark">Proof</span>&ensp;
                    {c.href ? (
                      <Link href={c.href} className="link-draw text-ink">
                        {c.proof}
                      </Link>
                    ) : (
                      c.proof
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="col-span-12 border-t border-(--rule-strong) pt-5" data-reveal>
          <h3 className="t-meta text-ink-3">Toolkit</h3>
          <dl className="mt-6 grid gap-x-[clamp(0.75rem,1.6vw,1.5rem)] gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {about.toolkit.map((g) => (
              <div key={g.group}>
                <dt className="t-meta text-mark">{g.group}</dt>
                <dd className="mt-2 text-ink-2">{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

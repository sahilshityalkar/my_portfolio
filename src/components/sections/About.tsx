import Link from "next/link";
import { about } from "@/content/about";
import { T } from "@/components/Draftable";

/**
 * No big title here: the first paragraph is the heading's job. A rule and a
 * small label, then the lede, then what I bring as one row of three.
 */
export function About() {
  const [lede, ...rest] = about.paragraphs;
  return (
    <section id="about" aria-labelledby="about-title" data-spec="About" className="wrap py-16 sm:py-24">
      {/* the rule and label are printed; the paragraphs rise in under them */}
      <div className="grid-12 gap-y-6 border-t border-(--rule-strong) pt-4">
        <h2 id="about-title" className="t-meta col-span-12 flex gap-3 text-ink-3">
          <span className="text-mark">04</span>
          About
        </h2>
        {lede ? (
          <div className="col-span-12 md:col-span-8" data-reveal>
            <T as="p" v={lede} className="t-lede text-pretty" />
          </div>
        ) : null}
        {rest.map((p, i) => (
          <div key={i} className="col-span-12 md:col-span-4 md:self-end" data-reveal style={{ ["--i" as string]: i + 1 }}>
            <T as="p" v={p} className="max-w-[46ch] text-ink-2" />
          </div>
        ))}
      </div>

      <div className="mt-12 sm:mt-16" data-reveal>
        <h3 className="t-meta text-ink-3">What I bring</h3>
        <ul className="mt-4 grid gap-x-[clamp(0.75rem,1.6vw,1.5rem)] lg:grid-cols-3">
          {about.capabilities.map((c) => (
            <li key={c.title} data-spec="Capability" className="flex flex-col border-t border-rule pb-6 pt-4 lg:pb-0">
              <h4 className="text-[1.2rem] leading-snug text-ink">{c.title}</h4>
              <T as="p" v={c.body} className="mt-1.5 max-w-[44ch] text-ink-2" />
              <p className="t-meta mt-3 text-ink-3 lg:mt-auto lg:pt-4">
                <span className="text-mark">Proof</span>&ensp;
                {c.href?.startsWith("#") ? (
                  <a href={c.href} className="link-draw text-ink">
                    {c.proof}
                  </a>
                ) : c.href ? (
                  <Link href={c.href} className="link-draw text-ink">
                    {c.proof}
                  </Link>
                ) : (
                  c.proof
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 border-t border-(--rule-strong) pt-5 sm:mt-16" data-reveal>
        <h3 className="t-meta text-ink-3">Toolkit</h3>
        <dl className="mt-6 grid gap-x-[clamp(0.75rem,1.6vw,1.5rem)] gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {about.toolkit.map((g) => (
            <div key={g.group}>
              <dt className="t-meta text-mark">{g.group}</dt>
              <dd className="mt-2 text-ink-2">{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

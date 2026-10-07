import { about } from "@/content/about";
import { T } from "@/components/Draftable";
import { SectionHead } from "@/components/SectionHead";

/** Facts about this site itself: the only claims here that need no placeholder. */
const colophon = [
  ["Type", "Newsreader (variable, optical sizes) and IBM Plex Mono, self-hosted"],
  ["Framework", "Next.js App Router, React Server Components, TypeScript"],
  ["Motion", "One hand-written spring integrator, time-based for any refresh rate"],
  ["Glass", "A 2D canvas that measures this page’s DOM and draws its blueprint"],
  ["Lab", "A separate site, lab.sahilshityalkar.com, so experiments never weigh on this one"],
  ["Libraries", "None for animation, 3D or state"],
] as const;

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" data-spec="About" className="wrap py-24 sm:py-36">
      <SectionHead n="05" id="about-title" title="About" />
      <div className="grid-12 mt-12 gap-y-16 sm:mt-20">
        <div className="col-span-12 space-y-6 md:col-span-7 lg:col-span-6" data-reveal>
          {about.paragraphs.map((p, i) => (
            <T key={i} as="p" v={p} className={i === 0 ? "t-lede text-balance" : "text-ink-2"} />
          ))}
          <dl className="mt-12 grid gap-8 border-t border-rule pt-8 sm:grid-cols-3">
            {about.principles.map((p) => (
              <div key={p.title}>
                <dt className="t-meta text-mark">{p.title}</dt>
                <T as="dd" v={p.body} className="mt-2 text-ink-2" />
              </div>
            ))}
          </dl>
        </div>

        <aside
          aria-labelledby="colophon-title"
          data-spec="Colophon"
          className="col-span-12 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9"
          data-reveal
        >
          <h3 id="colophon-title" className="t-meta text-ink-3">
            Colophon: how this site is made
          </h3>
          <dl className="mt-4 border-t border-rule">
            {colophon.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-x-3 border-b border-rule py-3 text-[0.95rem]">
                <dt className="t-meta pt-1 text-ink-3">{k}</dt>
                <dd className="text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}

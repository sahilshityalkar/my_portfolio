import { experience } from "@/content/experience";
import { T } from "@/components/Draftable";
import { SectionHead } from "@/components/SectionHead";

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" data-spec="Experience" className="wrap py-24 sm:py-36">
      <SectionHead n="03" id="experience-title" title="Experience" aside="Currently" />
      <ol className="mt-12 sm:mt-20">
        {experience.map((r) => (
          <li key={r.company} className="grid-12 gap-y-8" data-reveal>
            <div className="col-span-12 md:col-span-5 lg:col-span-4">
              <div className="md:sticky md:top-[calc(var(--header-h)+2rem)]">
                <p className="font-serif text-[clamp(3rem,8vw,6.5rem)] italic leading-[0.9] tracking-[-0.035em]">{r.company}</p>
                <p className="t-meta mt-5 text-[var(--ink-2)]">{r.title}</p>
                <p className="t-meta mt-1.5 text-[var(--ink-3)]">
                  <T v={r.start} /> — <T v={r.end} />
                </p>
              </div>
            </div>
            <div className="col-span-12 md:col-span-7 lg:col-span-6 lg:col-start-7">
              <T as="p" v={r.summary} className="t-lede text-balance" />
              <ol className="mt-10 border-t border-[var(--rule)]">
                {r.notes.map((n, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[3rem_1fr] border-b border-[var(--rule)] py-5"
                    data-reveal
                    style={{ ["--i" as string]: i }}
                  >
                    <span className="t-meta pt-1.5 text-[var(--mark)]">{String(i + 1).padStart(2, "0")}</span>
                    <T v={n} className="text-[var(--ink-2)]" />
                  </li>
                ))}
              </ol>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

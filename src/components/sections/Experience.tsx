import { education, experience } from "@/content/experience";
import { profile } from "@/content/profile";
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
                <p className="t-meta mt-5 text-ink-2">{r.title}</p>
                {r.company === profile.company && profile.companyUrl ? (
                  <a href={profile.companyUrl} target="_blank" rel="noreferrer" className="t-meta link-draw mt-1.5 inline-block text-ink-3">
                    {profile.companyUrl.replace(/^https?:\/\//, "")} ↗
                  </a>
                ) : null}
                <p className="t-meta mt-1.5 text-ink-3">
                  <T v={r.start} /> to <T v={r.end} />
                </p>
              </div>
            </div>
            <div className="col-span-12 md:col-span-7 lg:col-span-6 lg:col-start-7">
              <T as="p" v={r.summary} className="t-lede text-balance" />
              <ol className="mt-10 border-t border-rule">
                {r.notes.map((n, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[3rem_1fr] border-b border-rule py-5"
                    data-reveal
                    style={{ ["--i" as string]: i }}
                  >
                    <span className="t-meta pt-1.5 text-mark">{String(i + 1).padStart(2, "0")}</span>
                    <T v={n} className="text-ink-2" />
                  </li>
                ))}
              </ol>
            </div>
          </li>
        ))}
      </ol>
      <div className="grid-12 mt-24 gap-y-4 border-t border-rule pt-5" data-reveal>
        <h3 className="t-meta col-span-12 text-ink-3 md:col-span-4">Education</h3>
        <ul className="col-span-12 md:col-span-8 lg:col-start-7 lg:col-span-6">
          {education.map((e) => (
            <li key={e.school} className="grid gap-x-6 gap-y-1 sm:grid-cols-[1fr_auto]">
              <span>
                {e.degree}
                <span className="block text-ink-2">{e.school}</span>
              </span>
              <span className="t-meta pt-1 text-ink-3">{e.years}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { links, profile } from "@/content/profile";
import { T } from "@/components/Draftable";
import { draft } from "@/content/types";
import { CopyEmail } from "@/components/CopyEmail";
import { TitleBlock } from "@/components/TitleBlock";
import { SectionHead } from "@/components/SectionHead";
import { sheet } from "@/content/sections";
import { PrintButton } from "@/components/PrintButton";

export function Contact() {
  const rows = [
    { label: "Résumé", value: links.resume ? "Download PDF" : null, href: links.resume },
    { label: "LinkedIn", value: links.linkedin?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), href: links.linkedin },
    { label: "GitHub", value: links.github?.replace(/^https?:\/\//, ""), href: links.github },
    { label: "X", value: links.x?.replace(/^https?:\/\/(www\.)?/, ""), href: links.x },
  ].filter((r) => r.label !== "Résumé" || r.href);

  return (
    <section id="contact" aria-labelledby="contact-title" data-spec="Contact" className="wrap pb-8 pt-12 sm:pb-12 sm:pt-16">
      <SectionHead n={sheet("contact")} id="contact-title" title="Contact" />
      <div className="grid-12 mt-6 gap-y-10 sm:mt-10 sm:gap-y-12">
        <div className="col-span-12" data-reveal>
          {links.email ? (
            <>
              {/* the address is the headline: nothing to decode, nothing to click through */}
              <a
                href={`mailto:${links.email}`}
                className="link-draw font-(family-name:--serif-display) text-[clamp(2rem,6.2vw,5.5rem)] leading-[1.02] tracking-[-0.03em] [overflow-wrap:anywhere]"
                data-spec-type="Newsreader"
              >
                {/* break after the @ on narrow screens, never mid-word unless it must */}
                {links.email.split("@")[0]}@<wbr />
                {links.email.split("@").slice(1).join("@")}
              </a>
              {/* the bordered copy button, then plain text actions: wrapped onto a
                  new line on a phone they still start at the column's edge */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <CopyEmail email={links.email} />
                <a
                  href={`mailto:${links.email}`}
                  className="t-meta link-draw inline-flex items-center text-ink-2 hover:text-ink"
                >
                  Open mail app ↗
                </a>
                {links.resume ? null : (
                  <PrintButton className="t-meta link-draw inline-flex items-center text-ink-2 hover:text-ink">
                    Save the résumé as PDF ↓
                  </PrintButton>
                )}
              </div>
            </>
          ) : (
            <T as="p" v={draft("your@email.com")} className="t-title" />
          )}
        </div>
        <p className="t-meta col-span-12 max-w-[46ch] text-ink-3 md:col-span-5" data-reveal>
          <T v={profile.availability} />
        </p>
        <ul className="col-span-12 md:col-span-6 md:col-start-7" data-reveal>
          {rows.map((r) => (
            <li key={r.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] border-t border-rule py-3 last:border-b sm:grid-cols-[7rem_minmax(0,1fr)]">
              <span className="t-meta pt-1 text-ink-3">{r.label}</span>
              {r.href && r.value ? (
                <a
                  href={r.href}
                  className="link-draw justify-self-start [overflow-wrap:anywhere]"
                  {...(r.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {/* long handles break at a slash, never mid-word */}
                  {r.value.split("/").map((part, k) => (
                    <span key={k}>
                      {k ? (
                        <>
                          /<wbr />
                        </>
                      ) : null}
                      {part}
                    </span>
                  ))}
                </a>
              ) : (
                <T v={draft(`Add your ${r.label} link`)} className="justify-self-start" />
              )}
            </li>
          ))}
        </ul>
      </div>

      <footer className="t-meta mt-12 grid sm:mt-16 gap-5 border-t border-rule pt-5 text-ink-3">
        <p>
          © {new Date().getFullYear()} {profile.name} · <T v={profile.location} />
        </p>
        <TitleBlock />
        {/* paper only: where this came from, and what the screen has that paper can't */}
        <p className="print-note hidden">
          Printed from sahilshityalkar.com. On screen the page measures itself: press L to look under the glass.
        </p>
      </footer>
    </section>
  );
}

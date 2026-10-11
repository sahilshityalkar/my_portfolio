import { links, profile } from "@/content/profile";
import { T } from "@/components/Draftable";
import { draft } from "@/content/types";
import { CopyEmail } from "@/components/CopyEmail";
import { TitleBlock } from "@/components/TitleBlock";

export function Contact() {
  const rows = [
    { label: "Résumé", value: links.resume ? "Download PDF" : null, href: links.resume },
    { label: "LinkedIn", value: links.linkedin?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), href: links.linkedin },
    { label: "GitHub", value: links.github?.replace(/^https?:\/\//, ""), href: links.github },
    { label: "X", value: links.x?.replace(/^https?:\/\/(www\.)?/, ""), href: links.x },
  ].filter((r) => r.label !== "Résumé" || r.href);

  return (
    <section id="contact" aria-labelledby="contact-title" data-spec="Contact" className="wrap pb-10 pt-24 sm:pt-36">
      <div className="grid-12 gap-y-12 border-t border-(--rule-strong) pt-4">
        <div className="col-span-12" data-reveal>
          <h2 id="contact-title" className="t-meta mb-6 text-ink-3">
            Contact
          </h2>
          {links.email ? (
            <>
              {/* the address is the headline: nothing to decode, nothing to click through */}
              <a
                href={`mailto:${links.email}`}
                className="t-title link-draw [overflow-wrap:anywhere]"
                data-spec-type="Newsreader"
              >
                {/* break after the @ on narrow screens, never mid-word unless it must */}
                {links.email.split("@")[0]}@<wbr />
                {links.email.split("@").slice(1).join("@")}
              </a>
              <div className="mt-6 flex flex-wrap gap-2">
                <CopyEmail email={links.email} />
                <a
                  href={`mailto:${links.email}`}
                  className="t-meta inline-flex h-9 items-center rounded-full px-4 text-ink-2 transition-colors hover:text-ink"
                >
                  Open mail app ↗
                </a>
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
                  {r.value}
                </a>
              ) : (
                <T v={draft(`Add your ${r.label} link`)} className="justify-self-start" />
              )}
            </li>
          ))}
        </ul>
      </div>

      <footer className="t-meta mt-28 grid gap-5 border-t border-rule pt-5 text-ink-3">
        <p>
          © {new Date().getFullYear()} {profile.name} · <T v={profile.location} />
        </p>
        <TitleBlock />
      </footer>
    </section>
  );
}

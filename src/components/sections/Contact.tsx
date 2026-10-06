import { links, profile } from "@/content/profile";
import { T } from "@/components/Draftable";
import { draft } from "@/content/types";

export function Contact() {
  const rows = [
    { label: "Résumé", value: links.resume ? "Download PDF" : null, href: links.resume },
    { label: "LinkedIn", value: links.linkedin?.replace(/^https?:\/\/(www\.)?/, ""), href: links.linkedin },
    { label: "GitHub", value: links.github?.replace(/^https?:\/\//, ""), href: links.github },
    { label: "X", value: links.x?.replace(/^https?:\/\/(www\.)?/, ""), href: links.x },
  ].filter((r) => r.label !== "Résumé" || r.href);

  return (
    <section id="contact" aria-labelledby="contact-title" data-spec="Contact" className="wrap pb-10 pt-24 sm:pt-36">
      <div className="grid-12 gap-y-12 border-t border-(--rule-strong) pt-4">
        <p className="t-meta col-span-12 text-mark" data-reveal>
          06
        </p>
        <h2 id="contact-title" className="t-display col-span-12" data-reveal data-spec-type="Newsreader">
          Let’s <span className="italic">talk.</span>
        </h2>
        <div className="col-span-12 md:col-span-5" data-reveal>
          {links.email ? (
            <a href={`mailto:${links.email}`} className="t-lede link-draw break-all">
              {links.email}
            </a>
          ) : (
            <T as="p" v={draft("your@email.com")} className="t-lede" />
          )}
          <p className="t-meta mt-4 text-ink-3">
            <T v={profile.availability} />
          </p>
        </div>
        <ul className="col-span-12 md:col-span-6 md:col-start-7" data-reveal>
          {rows.map((r) => (
            <li key={r.label} className="grid grid-cols-[7rem_1fr] border-t border-rule py-3 last:border-b">
              <span className="t-meta pt-1 text-ink-3">{r.label}</span>
              {r.href && r.value ? (
                <a
                  href={r.href}
                  className="link-draw justify-self-start"
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

      <footer className="t-meta mt-28 flex flex-col justify-between gap-3 border-t border-rule pt-5 text-ink-3 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>
          <T v={profile.location} />
        </span>
        <span>Built by hand. Press L to see how.</span>
      </footer>
    </section>
  );
}

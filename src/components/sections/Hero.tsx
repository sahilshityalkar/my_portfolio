import { profile, links } from "@/content/profile";
import { T } from "@/components/Draftable";
import { draft } from "@/content/types";
import { InspectHint } from "@/components/InspectHint";

export function Hero() {
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.join(" ");
  const contact = [
    { label: "Email", href: links.email ? `mailto:${links.email}` : null },
    { label: "Résumé", href: links.resume },
    { label: "LinkedIn", href: links.linkedin },
    { label: "GitHub", href: links.github },
    { label: "X", href: links.x },
  ];

  return (
    <section
      id="intro"
      aria-labelledby="intro-title"
      data-spec="Hero"
      className="relative flex min-h-[100svh] flex-col justify-end pb-8 pt-[calc(var(--header-h)+2rem)] sm:pb-10"
    >
      <div className="wrap grid-12 gap-y-10" data-spec-grid>
        <p className="t-meta col-span-12 flex justify-between text-[var(--ink-3)] fade-in" style={{ ["--i" as string]: 0 }}>
          <span>
            <span className="text-[var(--mark)]">01</span>&ensp;Index
          </span>
          <span>Portfolio — {new Date().getFullYear()}</span>
        </p>

        <h1 id="intro-title" className="t-display col-span-12" data-spec-type="Newsreader">
          <span className="mask-line" style={{ ["--i" as string]: 0 }}>
            <span>{first}</span>
          </span>
          {last ? (
            <span className="mask-line pl-[12%] italic sm:pl-[16.66%]" style={{ ["--i" as string]: 1 }}>
              <span>{last}</span>
            </span>
          ) : null}
        </h1>

        <div className="col-span-12 grid grid-cols-subgrid gap-y-8 border-t border-[var(--rule)] pt-6">
          <p
            className="t-meta col-span-12 text-[var(--ink-2)] md:col-span-4 lg:col-span-3 fade-in"
            style={{ ["--i" as string]: 1 }}
          >
            {profile.role}
            <br />
            <span className="text-[var(--ink-3)]">at</span> {profile.company}
            <br />
            <span className="text-[var(--ink-3)]">{profile.experience} in industry</span>
          </p>

          <p
            data-spec="Statement"
            className="t-lede col-span-12 max-w-[34ch] text-balance md:col-span-8 lg:col-span-5 fade-in"
            style={{ ["--i" as string]: 2 }}
          >
            {profile.statement}
          </p>

          <ul
            data-spec="Contact"
            aria-label="Contact and links"
            className="t-meta col-span-12 flex flex-wrap gap-x-5 gap-y-2 lg:col-span-4 lg:flex-col lg:items-end lg:gap-y-1.5 fade-in"
            style={{ ["--i" as string]: 3 }}
          >
            {contact.map((c) =>
              c.href ? (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="link-draw text-[var(--ink)]"
                    {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {c.label}
                    <span aria-hidden="true" className="ml-1 text-[var(--ink-3)]">
                      ↗
                    </span>
                  </a>
                </li>
              ) : (
                <li key={c.label}>
                  <T v={draft(c.label)} />
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="col-span-12 flex items-end justify-between gap-6 fade-in" style={{ ["--i" as string]: 5 }}>
          <InspectHint />
          <a href="#work" className="t-meta hidden shrink-0 text-[var(--ink-3)] hover:text-[var(--ink)] sm:block">
            02 Selected work ↓
          </a>
        </div>
      </div>
    </section>
  );
}

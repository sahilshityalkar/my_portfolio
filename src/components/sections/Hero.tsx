import { profile, links } from "@/content/profile";
import { T } from "@/components/Draftable";
import { draft } from "@/content/types";
import { InspectHint } from "@/components/InspectHint";
import { CopyEmail } from "@/components/CopyEmail";
import { CapCallout, MeasureCallout, SheetCallout } from "@/components/HeroCallouts";

export function Hero() {
  const [first, ...rest] = profile.name.split(" ");
  const last = rest.join(" ");
  const contact = [
    { label: "Résumé", href: links.resume },
    { label: "LinkedIn", href: links.linkedin },
    { label: "GitHub", href: links.github },
    { label: "X", href: links.x },
  ].filter((c) => c.label !== "Résumé" || c.href);

  return (
    <section
      id="intro"
      aria-labelledby="intro-title"
      data-spec="Hero"
      className="relative flex flex-col pb-6 pt-[calc(var(--header-h)+2.5rem)] md:pb-10 lg:min-h-[calc(100svh-12rem)] lg:justify-end lg:pb-8 lg:pt-[calc(var(--header-h)+2rem)]"
    >
      <div className="wrap grid-12 gap-y-6 sm:gap-y-10 lg:gap-y-[clamp(1.75rem,4.2svh,2.5rem)]" data-spec-grid>
        <p className="t-meta col-span-12 text-ink-3 fade-in" style={{ ["--i" as string]: 0 }}>
          Portfolio · updated {profile.updated}
        </p>

        {/* on short, wide screens the name gives up a little size so the Work
            section's rule still peeks above the fold */}
        <div className="relative col-span-12">
          <h1
            id="intro-title"
            className="t-display lg:text-[clamp(3.4rem,min(12.2vw,19.5svh),12.5rem)]"
            data-spec-type="Newsreader"
          >
            <span className="mask-line" style={{ ["--i" as string]: 0 }}>
              <span className="ink">
                <span className="relative inline-block">
                  {first}
                  <CapCallout />
                </span>
              </span>
            </span>
            {last ? (
              <span className="mask-line pl-[12%] italic sm:pl-[16.66%] lg:pl-0 lg:pr-[0.093em] lg:text-right" style={{ ["--i" as string]: 1 }}>
                <span className="ink">{last}</span>
              </span>
            ) : null}
          </h1>
          {/* Wide screens: the field left of the surname is where a drawing
              keeps its notes, so the invitation and the sheet size live there */}
          <div
            data-measure-yield
            className="absolute bottom-[0.4rem] left-0 hidden max-w-[min(23rem,34%)] flex-col items-start gap-5 lg:flex fade-in"
            style={{ ["--i" as string]: 4 }}
          >
            <InspectHint />
            <SheetCallout className="pl-11" />
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-subgrid gap-y-4 border-t border-rule pt-5 sm:gap-y-8 sm:pt-6">
          <div
            data-spec="Role"
            className="col-span-12 md:col-span-4 lg:col-span-3 fade-in"
            style={{ ["--i" as string]: 1 }}
          >
            {/* the recruiter line: who, at which company, since when, in reading
                size and full ink; the details stay in the drafting hand below */}
            <p className="font-(family-name:--serif-lede) text-[1.125rem] leading-snug text-ink sm:text-[1.1875rem]">
              {profile.role}{" "}
              <span className="text-ink-2">at</span>{" "}
              {profile.companyUrl ? (
                <a href={profile.companyUrl} target="_blank" rel="noreferrer" className="link-draw">
                  {profile.company}
                </a>
              ) : (
                profile.company
              )}
            </p>
            <p className="t-meta mt-2 text-ink-2">
              Since {profile.since} · <T v={profile.location} />
            </p>
            <T as="p" v={profile.focus} className="t-meta mt-1 text-balance text-ink-3" />
            <T as="p" v={profile.availabilityShort} className="t-meta mt-3 text-balance text-mark" />
          </div>

          <p
            data-spec="Statement"
            className="t-lede relative col-span-12 max-w-[18.7em] self-start text-balance md:col-span-8 lg:col-span-5"
          >
            {profile.statement}
            <MeasureCallout />
          </p>

          <ul
            data-spec="Contact"
            data-measure-yield
            aria-label="Contact and links"
            className="t-meta col-span-12 flex flex-wrap gap-x-5 gap-y-2 lg:col-span-4 lg:flex-col lg:items-end lg:gap-y-1.5 fade-in"
            style={{ ["--i" as string]: 3 }}
          >
            {links.email ? (
              <li className="flex basis-full flex-wrap items-center gap-x-1 normal-case tracking-normal lg:basis-auto lg:justify-end">
                <a href={`mailto:${links.email}`} className="link-draw text-ink [overflow-wrap:anywhere]">
                  {links.email.split("@")[0]}@<wbr />
                  {links.email.split("@").slice(1).join("@")}
                </a>
                <CopyEmail email={links.email} compact />
              </li>
            ) : (
              <li>
                <T v={draft("Email")} />
              </li>
            )}
            {contact.map((c) =>
              c.href ? (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="link-draw text-ink"
                    {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {c.label}
                    <span aria-hidden="true" className="ml-1 text-ink-3">
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

        <div data-measure-yield className="col-span-12 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 fade-in lg:hidden" style={{ ["--i" as string]: 5 }}>
          <div className="lg:hidden">
            <InspectHint />
          </div>
          <SheetCallout className="hidden pb-[0.6875rem] sm:mr-auto sm:inline lg:hidden" />
          <a href="#work" className="t-meta shrink-0 text-ink-3 hover:text-ink lg:ml-auto">
            Selected work ↓
          </a>
        </div>
      </div>
    </section>
  );
}

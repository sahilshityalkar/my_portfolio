import Link from "next/link";
import { work } from "@/content/work";
import { T, plain } from "@/components/Draftable";
import { CaseVisual } from "@/components/CaseVisual";
import { SectionHead } from "@/components/SectionHead";
import { sheet } from "@/content/sections";
import { ProofLine } from "@/components/ProofLine";

/** "1 independent · 2 at Clyra", counted from work.ts. */
function Tally() {
  const counts = new Map<string, number>();
  for (const c of work) counts.set(c.at ?? "", (counts.get(c.at ?? "") ?? 0) + 1);
  const parts = [...counts].map(([at, n]) => (at ? `${n} at ${at}` : `${n} independent`));
  return (
    <>
      {/* a separator stays with the part before it, never starting a line */}
      {parts.map((part, k) => (
        <span key={part}>
          {k ? " " : null}
          <span className="whitespace-nowrap">
            {part}
            {k < parts.length - 1 ? " ·" : null}
          </span>
        </span>
      ))}
    </>
  );
}

/**
 * No interactive element nests inside another: the plate is covered by a
 * pointer-only link (hidden from the accessibility tree and the tab order),
 * the title is the accessible link, and the AS BUILT toggle sits above both.
 *
 * A case with a shipped product gets the full plate and leads. A case without
 * one is a compact row: its drawing at index-card size (large screens only),
 * the story on the left, the facts on the right. The children keep one order,
 * so the print layout (globals.css) treats both the same.
 */
export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" data-spec="Work" data-measure-yield className="wrap pb-12 pt-10 sm:pb-16 sm:pt-12 lg:pt-8">
      <SectionHead n={sheet("work")} id="work-title" title="Selected work" aside={<Tally />} size="primary" />
      <ol className="mt-8 sm:mt-12">
        {work.map((c, i) => {
          const href = `/work/${c.slug}`;
          const external = c.image ? c.links.filter((l): l is { label: string; href: string } => !!l.href) : [];
          const compact = !c.image;
          // a full case before it needs the larger gap; compact rows sit close
          const afterFull = !!work[i - 1]?.image;
          const printPoints = c.image ? c.sections.find((x) => x.points?.length)?.points : undefined;
          // a compact row sits on the page grid: its facts start on the same
          // column line as case I's (9), its story fills the columns before
          const story = compact ? "md:col-span-7 md:col-start-1 lg:col-span-5" : "";
          const facts = compact ? "md:col-span-4 md:col-start-9 lg:col-start-6" : "";
          return (
            <li
              key={c.slug}
              data-reveal
              data-spec={`Case ${c.index}`}
              className={`grid-12 group items-start ${
                compact
                  ? `gap-y-4 border-t border-rule pt-6 ${afterFull ? "mt-12 sm:mt-20" : "mt-8 sm:mt-10"}`
                  : `gap-y-6 ${i ? "mt-12 sm:mt-20" : ""}`
              }`}
            >
              <div
                data-plate-col
                className={
                  compact ? "hidden lg:col-span-3 lg:block [&_figcaption]:hidden" /* at card size the numeral names it */ : `col-span-12 md:col-span-7 ${i % 2 ? "md:order-2 md:col-start-6" : ""}`
                }
              >
                <div className="relative">
                  <CaseVisual c={c} seed={i + 3} asBuilt={c.image} />
                  <Link href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />
                </div>
                {c.image ? (
                  <p className="t-meta mt-3 grid text-ink-3">
                    {/* the caption names what is showing (AsBuilt sets
                        data-asbuilt); both versions share one grid cell, so
                        the swap never changes its height */}
                    <span className="col-start-1 row-start-1 [[data-asbuilt]_&]:invisible">
                      Plate {c.index}: the drawing.
                      {/* the toggle needs JS, so the instruction does too; same
                          pointer swap as the inspect hint */}
                      <span className="hidden [.js_&]:inline">
                        {" "}
                        <span className="hidden [@media(pointer:fine)]:inline">
                          Hover it, or press As built, to see the shipped product.
                        </span>
                        <span className="[@media(pointer:fine)]:hidden">Tap As built to see the shipped product.</span>
                      </span>
                    </span>
                    <span className="invisible col-start-1 row-start-1 [[data-asbuilt]_&]:visible">
                      Plate {c.index}, as built: the shipped product.
                    </span>
                  </p>
                ) : null}
              </div>
              <div
                className={
                  compact
                    ? "col-span-12 md:grid md:grid-cols-subgrid lg:col-span-9 lg:col-start-4"
                    : `col-span-12 md:col-span-4 md:pt-2 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-9"}`
                }
              >
                <p className={`t-meta flex gap-3 text-ink-3 ${story}`}>
                  <span className="text-mark">{c.index}</span>
                  <T v={c.year} />
                </p>
                <h3
                  className={`t-title mt-3 text-balance transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-2 ${story} ${
                    compact ? "text-[clamp(1.85rem,3.2vw,2.75rem)]" : ""
                  }`}
                  data-spec-type="Newsreader"
                >
                  <Link href={href} aria-label={`Case study ${c.index}: ${plain(c.title, "in preparation")}`}>
                    <T v={c.title} />
                  </Link>
                </h3>
                <T as="p" v={c.kicker} className={`mt-4 max-w-[38ch] text-pretty text-ink-2 ${story}`} />
                {c.proof ? <ProofLine proof={c.proof} className={`mt-4 ${story}`} /> : null}
                {/* on paper only: the résumé is forwarded to people who never
                    open the site, so the shipped case carries its decisions */}
                {printPoints?.length ? (
                  <ul className="hidden print:block">
                    {printPoints.map((pt) => (
                      <li key={pt.lead}>
                        <span className="t-meta text-mark">{pt.lead}:</span> {pt.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <dl
                  className={`t-meta mt-6 grid grid-cols-[6rem_1fr] gap-y-1.5 border-t border-rule pt-4 ${
                    compact ? `${facts} md:row-span-2 md:row-start-1 md:mt-1 md:content-start` : ""
                  }`}
                >
                  <dt className="text-ink-3">Role</dt>
                  <T as="dd" v={c.role} />
                  <dt className="text-ink-3">Stack</dt>
                  <T as="dd" v={c.stackShort ?? c.stack} />
                </dl>
                <p className={`t-meta mt-6 flex flex-wrap gap-x-5 gap-y-2 text-ink ${compact ? `${facts} md:row-start-3 md:mt-4` : ""}`}>
                  <span>
                    <Link href={href} className="link-draw">
                      Read the case study
                    </Link>{" "}
                    <span aria-hidden="true">→</span>
                  </span>
                  {external.map((l) => (
                    <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="link-draw text-ink-2 hover:text-ink">
                      {l.label}
                      <span aria-hidden="true" className="ml-1 text-ink-3">
                        ↗
                      </span>
                    </a>
                  ))}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

import Link from "next/link";
import { work } from "@/content/work";
import { T, plain } from "@/components/Draftable";
import { CaseVisual } from "@/components/CaseVisual";
import { SectionHead } from "@/components/SectionHead";

/**
 * No interactive element nests inside another: the plate is covered by a
 * pointer-only link (hidden from the accessibility tree and the tab order),
 * the title is the accessible link, and the AS BUILT toggle sits above both.
 */
export function Work() {
  return (
    <section id="work" aria-labelledby="work-title" data-spec="Work" className="wrap pb-16 pt-10 sm:pb-24 sm:pt-12 lg:pt-8">
      <SectionHead n="02" id="work-title" title="Selected work" aside="1 independent · 2 at Clyra" />
      <ol className="mt-8 space-y-14 sm:mt-12 sm:space-y-20">
        {work.map((c, i) => {
          const href = `/work/${c.slug}`;
          const external = c.image ? c.links.filter((l): l is { label: string; href: string } => !!l.href) : [];
          return (
            <li key={c.slug} data-reveal data-spec={`Case ${c.index}`} className="grid-12 group items-start gap-y-6">
              <div className={`col-span-12 md:col-span-7 ${i % 2 ? "md:order-2 md:col-start-6" : ""}`}>
                <div className="relative">
                  <CaseVisual c={c} seed={i + 3} asBuilt={c.image} />
                  <Link href={href} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10" />
                </div>
                {c.image ? (
                  <p className="t-meta mt-3 text-ink-3">
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
                  </p>
                ) : null}
              </div>
              <div className={`col-span-12 md:col-span-4 md:pt-2 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-9"}`}>
                <p className="t-meta flex gap-3 text-ink-3">
                  <span className="text-mark">{c.index}</span>
                  <T v={c.year} />
                </p>
                <h3 className="t-title mt-3 transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-2" data-spec-type="Newsreader">
                  <Link href={href} aria-label={`Case study ${c.index}: ${plain(c.title, "in preparation")}`}>
                    <T v={c.title} />
                  </Link>
                </h3>
                <T as="p" v={c.kicker} className="mt-4 max-w-[38ch] text-ink-2" />
                {c.proof ? (
                  <p data-spec="Proof" className="t-meta mt-4 text-mark">
                    {/* a line may break between claims, never inside one, and
                        the separator travels with the claim it introduces */}
                    {c.proof.split(" · ").map((part, k) => (
                      <span key={k}>
                        {k ? " " : null}
                        <span className="whitespace-nowrap">{k ? `· ${part}` : part}</span>
                      </span>
                    ))}
                  </p>
                ) : null}
                <dl className="t-meta mt-6 grid grid-cols-[6rem_1fr] gap-y-1.5 border-t border-rule pt-4">
                  <dt className="text-ink-3">Role</dt>
                  <T as="dd" v={c.role} />
                  <dt className="text-ink-3">Stack</dt>
                  <T as="dd" v={c.stackShort ?? c.stack} />
                </dl>
                <p className="t-meta mt-6 flex flex-wrap gap-x-5 gap-y-2 text-ink">
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

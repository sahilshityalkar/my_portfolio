import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase, work } from "@/content/work";
import { T, plain } from "@/components/Draftable";
import { CaseScreenshot, CaseVisual } from "@/components/CaseVisual";

export const dynamicParams = false;

export function generateStaticParams() {
  return work.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return {};
  const title = plain(c.title, `Case study ${c.index}`);
  return {
    title,
    description: plain(c.summary, `Case study ${c.index}`),
    alternates: { canonical: `/work/${c.slug}` },
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();
  const i = work.indexOf(c);
  const next = work[(i + 1) % work.length]!;

  return (
    <article data-spec="CaseStudy" className="pt-[calc(var(--header-h)+3rem)]">
      <header className="wrap grid-12 gap-y-8" data-spec-grid>
        <nav aria-label="Breadcrumb" className="t-meta col-span-12 flex gap-3 text-ink-3 fade-in">
          <Link href="/#work" className="link-draw hover:text-ink">
            ← Selected work
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-mark">Case {c.index}</span>
        </nav>
        <h1 className="t-display col-span-12 lg:col-span-10" data-spec-type="Newsreader">
          <span className="mask-line">
            <span>
              <T v={c.title} />
            </span>
          </span>
        </h1>
        <T as="p" v={c.kicker} className="t-lede col-span-12 max-w-[40ch] md:col-span-7 fade-in" />
        <dl
          data-spec="Facts"
          className="t-meta col-span-12 grid grid-cols-3 gap-4 border-t border-rule pt-4 md:col-span-5 md:col-start-8 fade-in"
        >
          {(
            [
              ["Year", c.year],
              ["Role", c.role],
              ["Stack", c.stack],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="text-ink-3">{k}</dt>
              <T as="dd" v={v} className="mt-1" />
            </div>
          ))}
        </dl>
      </header>

      <div className="wrap mt-16 fade-in" style={{ ["--i" as string]: 3 }}>
        <CaseVisual c={c} seed={i + 3} />
      </div>

      <div className="wrap grid-12 mt-20 gap-y-16 sm:mt-28">
        <T as="p" v={c.summary} className="t-lede col-span-12 md:col-span-8 md:col-start-4" />
        {c.sections.map((s, n) => (
          <Fragment key={s.heading}>
            <section className="col-span-12 grid grid-cols-subgrid gap-y-4 border-t border-rule pt-5" data-reveal>
              <h2 className="t-meta col-span-12 flex gap-3 md:col-span-3">
                <span className="text-mark">{String(n + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              <T as="p" v={s.body} className="col-span-12 max-w-[62ch] text-[1.15rem] text-ink-2 md:col-span-8 md:col-start-4" />
            </section>
            {/* the product itself, right after the decisions that shaped it */}
            {s.heading === "Decisions" && c.image ? (
              <div className="col-span-12" data-reveal>
                <CaseScreenshot c={c} />
              </div>
            ) : null}
          </Fragment>
        ))}
        {c.links.length ? (
          <ul className="t-meta col-span-12 flex gap-6 md:col-span-9 md:col-start-4">
            {c.links.map((l) =>
              l.href ? (
                <li key={l.label}>
                  <a href={l.href} className="link-draw" target="_blank" rel="noreferrer">
                    {l.label} ↗
                  </a>
                </li>
              ) : null,
            )}
          </ul>
        ) : null}
      </div>

      <footer className="wrap mt-32 pb-16">
        <Link href={`/work/${next.slug}`} className="group block border-t border-(--rule-strong) pt-5">
          <span className="t-meta text-ink-3">Next — Case {next.index}</span>
          <span className="t-title mt-3 block transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-2">
            <T v={next.title} /> →
          </span>
        </Link>
      </footer>
    </article>
  );
}

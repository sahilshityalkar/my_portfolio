import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase, work } from "@/content/work";
import { T, plain } from "@/components/Draftable";
import { isDraft } from "@/content/types";
import { profile } from "@/content/profile";
import { JsonLd, personId } from "@/lib/jsonld";
import { getPost } from "@/content/writing";
import { CaseScreenshot, CaseVisual } from "@/components/CaseVisual";
import { ProofLine } from "@/components/ProofLine";

export const dynamicParams = false;

export function generateStaticParams() {
  return work.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return {};
  const title = plain(c.title, `Case study ${c.index}`);
  const description = plain(c.summary, `Case study ${c.index}`);
  // metadata merges shallowly: without these the case pages would share
  // the home page's social card
  return {
    title,
    description,
    alternates: { canonical: `/work/${c.slug}`, types: { "application/rss+xml": "/feed.xml" } },
    openGraph: {
      type: "article",
      url: `/work/${c.slug}`,
      siteName: profile.name,
      title: `${title} · ${profile.name}`,
      description,
      locale: "en_IN",
    },
    twitter: { card: "summary_large_image", title: `${title} · ${profile.name}`, description, creator: "@SK_sahil05" },
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();
  const i = work.indexOf(c);
  const next = work[(i + 1) % work.length]!;
  // a section not written yet is left out, not shown as a placeholder; it
  // appears (and the numbering follows) once its text is in work.ts
  const sections = c.sections.filter((s) => !isDraft(s.body));
  const external = c.links.filter((l): l is { label: string; href: string } => !!l.href);

  return (
    <article data-spec="CaseStudy" className="pt-[calc(var(--header-h)+3rem)]">
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "CreativeWork",
              name: plain(c.title, `Case study ${c.index}`),
              url: `${profile.siteUrl}/work/${c.slug}`,
              author: { "@id": personId },
              // a shipped product (one with a live site) is what the case is about
              ...(c.image && external[0]
                ? { about: { "@type": "SoftwareApplication", name: plain(c.title, ""), url: external[0].href } }
                : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Selected work", item: `${profile.siteUrl}/#work` },
                { "@type": "ListItem", position: 2, name: plain(c.title, `Case study ${c.index}`) },
              ],
            },
          ],
        }}
      />
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
        <div className="col-span-12 md:col-span-7 fade-in">
          <T as="p" v={c.kicker} className="t-lede max-w-[40ch]" />
          {c.proof ? <ProofLine proof={c.proof} className="mt-5" /> : null}
          {external.length ? (
            <p className="t-meta mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {external.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="link-draw text-ink">
                  {l.label}
                  <span aria-hidden="true" className="ml-1 text-ink-3">
                    ↗
                  </span>
                </a>
              ))}
            </p>
          ) : null}
        </div>
        <dl
          data-spec="Facts"
          className="t-meta col-span-12 grid grid-cols-1 gap-4 border-t border-rule pt-4 min-[400px]:grid-cols-3 md:col-span-5 md:col-start-8 fade-in"
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
              <T as="dd" v={v} className="mt-1 [overflow-wrap:anywhere]" />
            </div>
          ))}
        </dl>
      </header>

      {/* A shipped product opens with the product itself; its drawing follows
          the decisions. Without one, the drawing opens, at a size that leaves
          the text within reach. */}
      {c.image ? (
        <div className="wrap mt-16" data-reveal>
          <CaseScreenshot c={c} />
        </div>
      ) : (
        <div className="wrap grid-12 mt-16" data-reveal>
          <div className="col-span-12 lg:col-span-8 lg:col-start-3">
            <CaseVisual c={c} seed={i + 3} />
          </div>
        </div>
      )}

      <div className="wrap grid-12 mt-20 gap-y-16 sm:mt-28">
        <T as="p" v={c.summary} className="t-lede col-span-12 md:col-span-8 md:col-start-4" />
        {sections.map((s, n) => (
          <Fragment key={s.heading}>
            <section className="col-span-12 grid grid-cols-subgrid gap-y-4 border-t border-rule pt-5" data-reveal>
              <h2 className="t-meta col-span-12 flex gap-3 md:col-span-3">
                <span className="text-mark">{String(n + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              <T as="p" v={s.body} className="col-span-12 max-w-[62ch] text-[1.15rem] text-ink-2 md:col-span-8 md:col-start-4" />
              {s.points?.length ? (
                <dl className="col-span-12 max-w-[62ch] border-t border-rule text-[1.15rem] md:col-span-8 md:col-start-4">
                  {s.points.map((pt) => (
                    <div key={pt.lead} className="grid gap-x-6 gap-y-1 border-b border-rule py-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
                      <dt className="t-meta pt-1 text-mark">{pt.lead}</dt>
                      <dd className="text-pretty text-ink-2">{pt.text}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
            {/* the drawing of the idea, right after the decisions that shaped it */}
            {s.heading === "Decisions" && c.image ? (
              <div className="col-span-12 lg:col-span-8 lg:col-start-3" data-reveal>
                <CaseVisual c={c} seed={i + 3} />
              </div>
            ) : null}
          </Fragment>
        ))}
        {/* the longer story, where there is one */}
        {c.notes?.length ? (
          <div className="col-span-12 border-t border-rule pt-5 md:col-span-8 md:col-start-4">
            <p className="t-meta text-ink-3">Read the note</p>
            {c.notes.map((slug) => {
              const post = getPost(slug);
              return post ? (
                <Link key={slug} href={`/writing/${slug}`} className="group mt-2 block">
                  <span className="font-serif text-[1.5rem] leading-snug transition-colors group-hover:text-mark">{post.title} →</span>
                  <span className="mt-1 block max-w-[60ch] text-ink-2">{post.dek}</span>
                </Link>
              ) : null;
            })}
          </div>
        ) : null}
        {external.length ? (
          <ul className="t-meta col-span-12 flex flex-wrap gap-x-6 gap-y-2 md:col-span-9 md:col-start-4">
            {external.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="link-draw" target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <footer className="wrap mt-32 pb-16">
        <Link href={`/work/${next.slug}`} className="group block border-t border-(--rule-strong) pt-5">
          <span className="t-meta text-ink-3">Next · Case {next.index}</span>
          <span className="t-title mt-3 block transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-2">
            <T v={next.title} /> →
          </span>
        </Link>
      </footer>
    </article>
  );
}

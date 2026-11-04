import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, minutes, posts } from "@/content/writing";
import { links, profile } from "@/content/profile";
import { Prose } from "@/components/Prose";
import { JsonLd, personId } from "@/lib/jsonld";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.dek,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/writing/${post.slug}`,
      siteName: profile.name,
      title: post.title,
      description: post.dek,
      locale: "en_IN",
      publishedTime: post.date,
      authors: [profile.name],
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.dek, creator: "@SK_sahil05" },
  };
}

export default async function PostPage({ params }: PageProps<"/writing/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const i = posts.indexOf(post);
  const next = posts[(i + 1) % posts.length]!;
  const url = `${profile.siteUrl}/writing/${post.slug}`;

  return (
    <article data-spec="Post" className="pb-16 pt-[calc(var(--header-h)+3rem)]">
      <JsonLd
        data={{
          "@type": "BlogPosting",
          headline: post.title,
          description: post.dek,
          datePublished: post.date,
          url,
          mainEntityOfPage: url,
          image: `${url}/opengraph-image`,
          keywords: post.tags.join(", "),
          author: { "@id": personId, "@type": "Person", name: profile.name, url: profile.siteUrl },
        }}
      />
      <header className="wrap grid-12 gap-y-6" data-spec-grid>
        <nav aria-label="Breadcrumb" className="t-meta col-span-12 flex gap-3 text-ink-3 fade-in">
          <Link href="/writing" className="link-draw hover:text-ink">
            ← Writing
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-mark">Note {String(posts.length - i).padStart(2, "0")}</span>
        </nav>
        <h1
          className="col-span-12 text-balance font-serif text-[clamp(2.3rem,5.2vw,4.6rem)] leading-[1.02] tracking-[-0.03em] lg:col-span-10"
          data-spec-type="Newsreader"
        >
          {post.title}
        </h1>
        <p className="t-lede col-span-12 max-w-[44ch] text-pretty text-ink-2 md:col-span-8">{post.dek}</p>
        <dl data-spec="Facts" className="t-meta col-span-12 flex flex-wrap gap-x-8 gap-y-2 border-t border-rule pt-4 text-ink-2">
          <div className="flex gap-2">
            <dt className="text-ink-3">Published</dt>
            <dd>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-3">Reading</dt>
            <dd>{minutes(post)} min</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-3">Topics</dt>
            <dd>{post.tags.join(" · ")}</dd>
          </div>
        </dl>
      </header>

      <div className="wrap grid-12 mt-12 sm:mt-16">
        <div className="col-span-12 lg:col-span-8 lg:col-start-3">
          <Prose body={post.body} />

          {post.links?.length ? (
            <p className="t-meta mt-12 flex flex-wrap gap-x-6 gap-y-1 border-t border-rule pt-5">
              {post.links.map((l) =>
                l.href.startsWith("/") ? (
                  <Link key={l.href} href={l.href} className="link-draw inline-flex min-h-6 items-center text-ink">
                    {l.label} →
                  </Link>
                ) : (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="link-draw inline-flex min-h-6 items-center text-ink">
                    {l.label} ↗
                  </a>
                ),
              )}
            </p>
          ) : null}

          {/* who wrote it, and how to reach them: a reader who got here from a
              search should not have to find the home page first */}
          <aside data-spec="Author" className="mt-12 border-t border-(--rule-strong) pt-5">
            <p className="t-meta text-ink-3">Written by</p>
            <p className="mt-2 font-serif text-[1.35rem] leading-snug">
              {profile.name}, {profile.role} at {profile.company}
            </p>
            <p className="t-meta mt-3 flex flex-wrap gap-x-5 gap-y-1">
              <Link href="/" className="link-draw inline-flex min-h-6 items-center text-ink">
                Portfolio →
              </Link>
              {links.email ? (
                <a href={`mailto:${links.email}`} className="link-draw inline-flex min-h-6 items-center text-ink normal-case tracking-normal">
                  {links.email}
                </a>
              ) : null}
              {links.linkedin ? (
                <a href={links.linkedin} target="_blank" rel="noreferrer" className="link-draw inline-flex min-h-6 items-center text-ink">
                  LinkedIn ↗
                </a>
              ) : null}
              {links.github ? (
                <a href={links.github} target="_blank" rel="noreferrer" className="link-draw inline-flex min-h-6 items-center text-ink">
                  GitHub ↗
                </a>
              ) : null}
            </p>
          </aside>
        </div>
      </div>

      {next.slug !== post.slug ? (
        <footer className="wrap mt-24">
          <Link href={`/writing/${next.slug}`} className="group block border-t border-(--rule-strong) pt-5">
            <span className="t-meta text-ink-3">Next note</span>
            <span className="mt-3 block text-balance font-serif text-[clamp(1.6rem,3.4vw,2.8rem)] leading-tight tracking-[-0.02em] transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-2">
              {next.title} →
            </span>
          </Link>
        </footer>
      ) : null}
    </article>
  );
}

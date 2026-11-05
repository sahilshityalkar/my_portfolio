import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/content/writing";
import { profile } from "@/content/profile";
import { PostList } from "@/components/PostList";
import { JsonLd, personId } from "@/lib/jsonld";
import { lede } from "./lede";

const description = `Notes on frontend engineering by ${profile.name}: performance, layout, typography and shipping products that work.`;
const shareTitle = `Writing · ${profile.name}`;

// openGraph and twitter replace the root's whole objects (metadata merges
// shallowly), so without these the index would share as the home page
export const metadata: Metadata = {
  title: "Writing",
  description,
  alternates: { canonical: "/writing", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: {
    type: "website",
    url: "/writing",
    siteName: profile.name,
    title: shareTitle,
    description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: shareTitle, description, creator: "@SK_sahil05" },
};

// the Person node itself is on the home page; here it is named in full, so
// the reference resolves for a crawler that reads only this page
const author = { "@type": "Person", "@id": personId, name: profile.name, url: profile.siteUrl };

export default function WritingIndex() {
  return (
    <div className="wrap pb-20 pt-[calc(var(--header-h)+3rem)]">
      <JsonLd
        data={{
          "@type": "Blog",
          name: `Writing · ${profile.name}`,
          description: lede,
          url: `${profile.siteUrl}/writing`,
          author,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${profile.siteUrl}/writing/${p.slug}`,
            datePublished: p.date,
            author,
          })),
        }}
      />
      <nav aria-label="Breadcrumb" className="t-meta flex gap-3 text-ink-3">
        <Link href="/#writing" className="link-draw hover:text-ink">
          ← Index
        </Link>
      </nav>
      <h1 className="t-display mt-6 hyphens-manual" data-spec-type="Newsreader">
        Writing
      </h1>
      <p className="t-lede mt-6 max-w-[40ch] text-ink-2">
        {lede}
      </p>
      <p className="t-meta mt-4 text-ink-3">
        <a href="/feed.xml" className="link-draw hover:text-ink">
          RSS feed
        </a>
      </p>
      <div className="mt-12">
        <PostList posts={posts} headingLevel="h2" reveal={false} />
      </div>
    </div>
  );
}

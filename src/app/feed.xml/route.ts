import { posts } from "@/content/writing";
import { profile } from "@/content/profile";

// rendered once at build: a static file, like the sitemap
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS 2.0: the notes, newest first. */
export function GET() {
  const site = profile.siteUrl;
  const items = posts
    .map((p) => {
      const url = `${site}/writing/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.dek)}</description>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(profile.name)} · Writing</title>
    <link>${site}/writing</link>
    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on frontend engineering by ${esc(profile.name)}.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

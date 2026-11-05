import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { work } from "@/content/work";
import { posts } from "@/content/writing";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => new URL(p, profile.siteUrl).toString();
  // a date only where the content has one: a build time would change on every
  // deploy whether anything changed or not
  const latest = posts[0] ? new Date(`${posts[0].date}T00:00:00Z`) : undefined;
  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    ...work.map((c) => ({ url: url(`/work/${c.slug}`), changeFrequency: "yearly" as const, priority: 0.8 })),
    { url: url("/writing"), lastModified: latest, changeFrequency: "monthly", priority: 0.7 },
    ...posts.map((p) => ({ url: url(`/writing/${p.slug}`), lastModified: new Date(`${p.date}T00:00:00Z`), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}

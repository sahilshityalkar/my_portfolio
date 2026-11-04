import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { work } from "@/content/work";
import { posts } from "@/content/writing";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => new URL(p, profile.siteUrl).toString();
  const lastModified = new Date(); // the build: content only changes with a deploy
  return [
    { url: url("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    ...work.map((c) => ({ url: url(`/work/${c.slug}`), lastModified, changeFrequency: "yearly" as const, priority: 0.8 })),
    { url: url("/writing"), lastModified, changeFrequency: "monthly", priority: 0.7 },
    ...posts.map((p) => ({ url: url(`/writing/${p.slug}`), lastModified: new Date(`${p.date}T00:00:00Z`), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}

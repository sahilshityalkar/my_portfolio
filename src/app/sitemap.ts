import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { work } from "@/content/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => new URL(p, profile.siteUrl).toString();
  const lastModified = new Date(); // the build: content only changes with a deploy
  return [
    { url: url("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    ...work.map((c) => ({ url: url(`/work/${c.slug}`), lastModified, changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}

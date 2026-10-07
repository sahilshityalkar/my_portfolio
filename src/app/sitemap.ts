import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { work } from "@/content/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => new URL(p, profile.siteUrl).toString();
  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    ...work.map((c) => ({ url: url(`/work/${c.slug}`), changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}

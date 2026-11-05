/**
 * Writing: technical notes about real, verifiable work (this site's own
 * engineering, ReplyAI). Each post is typed content, not markdown, so it
 * needs no parser dependency and every block renders in the site's own
 * typography (components/Prose.tsx).
 *
 * Inline text supports `code`, *emphasis* and [links](https://...) only.
 * House rules for every post: first person, plain and specific; numbers
 * only when they were measured (say how); no em or en dashes.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; code: string; lang?: "ts" | "tsx" | "css" | "js" | "sql" | "text"; caption?: string }
  | { type: "quote"; text: string }
  | { type: "note"; text: string }
  | { type: "figure"; src: string; alt: string; caption?: string; width: number; height: number };

export type Post = {
  slug: string;
  title: string;
  /** One sentence under the title: what the reader will get. */
  dek: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  tags: string[];
  body: Block[];
  /** Where to see or read the thing the post is about. */
  links?: { label: string; href: string }[];
};

import { measure } from "./posts/measure";
import { fallbacks } from "./posts/fallbacks";
import { loupe } from "./posts/loupe";
import { titleBlock } from "./posts/title-block";
import { greenBuild } from "./posts/green-build";

/** Newest first. */
export const posts: Post[] = [titleBlock, greenBuild, measure, fallbacks, loupe].sort((a, b) => b.date.localeCompare(a.date));

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export { formatDate } from "@/lib/reading";
import { minutes as bodyMinutes } from "@/lib/reading";

/** A post's reading time in minutes. */
export const minutes = (post: Post) => bodyMinutes(post.body);

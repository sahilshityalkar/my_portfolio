import Link from "next/link";
import { formatDate, minutes, type Post } from "@/content/writing";

/**
 * Posts as a ruled list: date (or, for a curated pick, the topic), title, dek,
 * reading time.
 */
export function PostList({
  posts,
  headingLevel = "h3",
  lead = "date",
  reveal = true,
}: {
  posts: Post[];
  headingLevel?: "h2" | "h3";
  lead?: "date" | "topic";
  /** Off where the list is the first screen (/writing): its first row is the largest paint. */
  reveal?: boolean;
}) {
  const H = headingLevel;
  return (
    <ol className="border-t border-rule">
      {posts.map((p, i) => (
        <li key={p.slug} className="border-b border-rule" data-reveal={reveal || undefined} style={{ ["--i" as string]: i }}>
          <Link href={`/writing/${p.slug}`} className="group grid gap-x-6 gap-y-2 py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto]">
            <span className="t-meta pt-1.5 text-ink-3">
              {lead === "date" ? <time dateTime={p.date}>{formatDate(p.date)}</time> : p.tags.slice(0, 2).join(" · ")}
            </span>
            <span>
              <H className="text-balance font-serif text-[clamp(1.35rem,2.2vw,1.75rem)] leading-tight tracking-[-0.015em] text-ink transition-transform duration-700 ease-(--ease-out) group-hover:translate-x-1.5">
                {p.title}
              </H>
              <span className="mt-1.5 block max-w-[62ch] text-ink-2">{p.dek}</span>
            </span>
            <span className="t-meta pt-1.5 text-ink-3 sm:text-right">{minutes(p)} min read</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

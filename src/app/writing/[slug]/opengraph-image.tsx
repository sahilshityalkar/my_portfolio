import { profile } from "@/content/profile";
import { formatDate, getPost, posts } from "@/content/writing";
import { cardSize, noteCard } from "@/lib/note-card";

export const size = cardSize;
export const contentType = "image/png";
export const alt = `A note on frontend engineering by ${profile.name}`;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

/** A note's share card: its date, title and dek, set like the page. */
export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  return noteCard({
    label: "Note",
    meta: post ? formatDate(post.date) : "",
    title: post?.title ?? profile.name,
    kicker: post?.dek ?? "",
  });
}

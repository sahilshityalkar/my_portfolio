import Link from "next/link";
import { posts } from "@/content/writing";
import { SectionHead } from "@/components/SectionHead";
import { PostList } from "@/components/PostList";
import { sheet } from "@/content/sections";

/** The latest notes, as a ruled list; the archive is /writing. */
export function Writing() {
  return (
    <section id="writing" aria-labelledby="writing-title" data-spec="Writing" className="wrap py-12 sm:py-16">
      <SectionHead
        n={sheet("writing")}
        id="writing-title"
        title="Writing"
        aside={
          <Link href="/writing" className="link-draw">
            All notes →
          </Link>
        }
      />
      <div className="grid-12 mt-6 gap-y-6 sm:mt-10">
        <p className="col-span-12 max-w-[46ch] text-ink-2 lg:col-span-3" data-reveal>
          Notes on the engineering behind the work above: what broke, what I measured, and what I changed.
        </p>
        <div className="col-span-12 lg:col-span-9">
          <PostList posts={posts.slice(0, 4)} />
        </div>
      </div>
    </section>
  );
}

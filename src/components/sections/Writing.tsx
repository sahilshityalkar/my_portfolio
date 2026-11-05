import Link from "next/link";
import { featured } from "@/content/writing";
import { SectionHead } from "@/components/SectionHead";
import { PostList } from "@/components/PostList";
import { sheet } from "@/content/sections";

/** A pick of the notes, as a ruled list; the archive, by date, is /writing. */
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
          <PostList posts={featured} lead="topic" />
        </div>
      </div>
    </section>
  );
}

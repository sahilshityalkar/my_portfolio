import type { Metadata } from "next";
import Link from "next/link";
import { lab } from "@/content/lab";

export const metadata: Metadata = {
  title: "Lab",
  description: "Experiments that grow out of building this site.",
  alternates: { canonical: "/lab" },
};

export default function LabIndex() {
  return (
    <div className="wrap pb-24 pt-[calc(var(--header-h)+3rem)]">
      <div className="grid-12 gap-y-8" data-spec-grid>
        <p className="t-meta col-span-12 text-[var(--ink-3)] fade-in">
          <Link href="/" className="link-draw hover:text-[var(--ink)]">
            ← Index
          </Link>
        </p>
        <h1 className="t-display col-span-12" data-spec-type="Newsreader">
          <span className="mask-line">
            <span>Lab</span>
          </span>
        </h1>
        <p className="t-lede col-span-12 max-w-[36ch] text-[var(--ink-2)] md:col-span-6 fade-in">
          Experiments that grow out of building this site. Each one is about a single idea, and each one is finished.
        </p>
      </div>
      <ol className="mt-20">
        {lab.map((e) => (
          <li key={e.slug} data-reveal>
            <Link
              href={`/lab/${e.slug}`}
              data-spec={`Experiment ${e.index}`}
              className="grid-12 group gap-y-3 border-t border-[var(--rule)] py-8"
            >
              <span className="t-meta col-span-2 pt-3 text-[var(--mark)]">{e.index}</span>
              <span className="t-title col-span-10 transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-2 md:col-span-4">
                {e.title}
              </span>
              <span className="col-span-10 col-start-3 text-[var(--ink-2)] md:col-span-4 md:col-start-auto">{e.summary}</span>
              <span className="t-meta col-span-10 col-start-3 text-[var(--ink-3)] md:col-span-2 md:col-start-auto md:text-right">
                {e.status === "live" ? "Live" : "Draft"} · {e.tech}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

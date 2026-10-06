import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExperiment, lab } from "@/content/lab";
import { experiments } from "@/lab/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return lab.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/lab/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = getExperiment(slug);
  if (!e) return {};
  return { title: `${e.title} — Lab ${e.index}`, description: e.summary, alternates: { canonical: `/lab/${e.slug}` } };
}

export default async function ExperimentPage({ params }: PageProps<"/lab/[slug]">) {
  const { slug } = await params;
  const e = getExperiment(slug);
  const Experiment = experiments[slug];
  if (!e || !Experiment) notFound();

  return (
    <div className="pt-[calc(var(--header-h)+2rem)]">
      <div className="wrap grid-12 items-end gap-y-6 pb-8" data-spec-grid>
        <p className="t-meta col-span-12 flex gap-3 text-[var(--ink-3)] fade-in">
          <Link href="/lab" className="link-draw hover:text-[var(--ink)]">
            ← Lab
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--mark)]">{e.index}</span>
        </p>
        <h1 className="t-title col-span-12 md:col-span-4">{e.title}</h1>
        <p className="col-span-12 max-w-[56ch] text-[var(--ink-2)] md:col-span-6">{e.summary}</p>
        <p className="t-meta col-span-12 text-[var(--ink-3)] md:col-span-2 md:text-right">{e.tech}</p>
      </div>
      <Experiment />
    </div>
  );
}

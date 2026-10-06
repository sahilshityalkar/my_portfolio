import Image from "next/image";
import type { CaseStudy } from "@/content/types";
import { Plate } from "@/components/Plate";

/** The project's technical drawing — the same on the index and the case page. */
export function CaseVisual({ c, seed }: { c: CaseStudy; seed: number }) {
  return <Plate seed={seed} numeral={c.index} caption={`Plate ${c.index}`} kind={c.plate} />;
}

/** The shipped product, framed like a specimen: hairline border and its address. */
export function CaseScreenshot({ c }: { c: CaseStudy }) {
  if (!c.image) return null;
  return (
    <figure className="border border-(--rule-strong) bg-paper-2">
      <figcaption className="t-meta flex justify-between gap-4 border-b border-(--rule-strong) px-4 py-2.5 text-ink-3">
        <span>The shipped product</span>
        {c.image.url ? <span className="truncate">{c.image.url}</span> : null}
      </figcaption>
      <div className="relative aspect-[1780/1080]">
        <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 1440px) 1344px, 100vw" className="object-cover object-top" />
      </div>
    </figure>
  );
}

import Image from "next/image";
import type { CaseStudy } from "@/content/types";
import { Plate } from "@/components/Plate";

/**
 * The project's technical drawing, the same on the index and the case page.
 * On the index, `asBuilt` (the case's real screenshot) puts the AS BUILT lens
 * over the drawing; case pages call it without, so their plates stay drawings.
 */
export function CaseVisual({ c, seed, asBuilt }: { c: CaseStudy; seed: number; asBuilt?: CaseStudy["image"] }) {
  return <Plate seed={seed} numeral={c.index} caption={`Plate ${c.index}`} kind={c.plate} asBuilt={asBuilt} />;
}

/** The shipped product, framed like a specimen: hairline border and its address. */
export function CaseScreenshot({ c }: { c: CaseStudy }) {
  if (!c.image) return null;
  return (
    <figure className="border border-(--rule-strong) bg-paper-2">
      <figcaption className="t-meta flex justify-between gap-4 border-b border-(--rule-strong) px-4 py-2.5 text-ink-2">
        <span>The shipped product</span>
        {c.image.url ? <span className="truncate">{c.image.url}</span> : null}
      </figcaption>
      <div className="relative aspect-[1780/1080]">
        <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 1440px) 1344px, 100vw" className="object-cover object-top" />
      </div>
    </figure>
  );
}

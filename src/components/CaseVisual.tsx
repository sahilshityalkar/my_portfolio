import Image from "next/image";
import type { CaseStudy } from "@/content/types";
import { Plate } from "@/components/Plate";

/** Real project imagery when it exists, otherwise a drafting plate. */
export function CaseVisual({ c, seed, priority = false }: { c: CaseStudy; seed: number; priority?: boolean }) {
  if (!c.image) return <Plate seed={seed} numeral={c.index} caption={`Plate ${c.index}`} kind={c.plate} />;
  return (
    <figure className="group/plate relative aspect-[4/3] overflow-hidden bg-paper-2">
      <Image
        src={c.image.src}
        alt={c.image.alt}
        fill
        priority={priority}
        sizes="(min-width: 768px) 58vw, 100vw"
        className="object-cover object-top transition-transform duration-[1.6s] ease-(--ease-out) group-hover/plate:scale-[1.025]"
      />
      <figcaption className="t-meta absolute left-3 top-3 bg-paper px-1.5 py-0.5 text-ink-3">
        Plate {c.index}
      </figcaption>
    </figure>
  );
}

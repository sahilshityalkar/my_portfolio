import type { Experiment } from "./types";

/**
 * The lab is an append-only index of experiments. Add an entry here and a
 * matching component in src/lab/<slug>.tsx; the route is generated for you.
 */
export const lab: Experiment[] = [
  {
    slug: "glass",
    index: "001",
    title: "Glass",
    summary:
      "The inspection loupe from the home page, rebuilt as real optics: a WebGL refraction shader with dispersion, bending live type through a lens you can drag.",
    status: "live",
    tech: "WebGL2 · GLSL · no libraries",
  },
];

export const getExperiment = (slug: string) => lab.find((e) => e.slug === slug);

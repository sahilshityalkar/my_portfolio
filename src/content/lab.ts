import { demo, type Experiment } from "./types";

/**
 * The lab is a separate application at lab.sahilshityalkar.com: its own repo,
 * its own deploy, any stack per experiment. This site only features a few
 * entries and links out. When the lab publishes an experiments.json feed, this
 * list can be read from it at build time instead of written by hand.
 */
export const labUrl = "https://lab.sahilshityalkar.com";

export const lab: Experiment[] = [
  {
    slug: "glass",
    index: "001",
    title: "Glass",
    summary: demo("A lens you can drag over live type, with real refraction and dispersion, written as one WebGL shader."),
    tech: "WebGL2 · GLSL",
    preview: "glass",
  },
  {
    slug: "springs",
    index: "002",
    title: "Springs",
    summary: demo("The motion engine behind this site, opened up: tune stiffness and damping and watch one spring behave the same at 60, 120 and 144Hz."),
    tech: "TypeScript · Canvas",
    preview: "spring",
  },
  {
    slug: "blueprint",
    index: "003",
    title: "Blueprint",
    summary: demo("Point it at any layout and it draws the page’s own construction drawing: boxes, spacing, line boxes and type metrics, measured live."),
    tech: "DOM geometry · Canvas 2D",
    preview: "blueprint",
  },
];

export const labHref = (slug: string) => `${labUrl}/${slug}`;

# Portfolio — Under the Glass

Personal portfolio of Sahil Shityalkar, Frontend Lead Engineer at Clyra.

A calm, editorial site with one secret: press **L** (or tap **Inspect**) and a
glass slides over the page, showing its live engineering drawing, measured
from the DOM. The concept and every trade-off are in
[docs/DECISIONS.md](docs/DECISIONS.md).

## Run

Requires Node 20.9+ (developed on Node 22).

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build and check

```bash
npm run build      # static production build
npm run start      # serve the build on :3000
npm run lint
npm run typecheck
```

Performance audit, run against the production build:

```bash
npm run build && npm run start
npx lighthouse http://localhost:3000 --preset=desktop --view
npx lighthouse http://localhost:3000 --form-factor=mobile --throttling-method=simulate --view
```

## Deploy

The site is fully static-renderable. The easiest host is **Vercel**:

1. Import the GitHub repo at vercel.com/new (framework is detected).
2. Add the environment variable `NEXT_PUBLIC_SITE_URL` with your final domain,
   e.g. `https://sahil.dev`. Canonical URLs, the sitemap, robots and the
   Open Graph image all derive from it.
3. Deploy. Every push to `main` redeploys.

Any Node host works too (`npm run build && npm run start`), as do Netlify and
Cloudflare via their Next.js adapters.

## Edit content

Everything the site says lives in `src/content/`. You shouldn't need to touch
a component.

| File | What it holds |
| --- | --- |
| `profile.ts` | Name, role, statement, location, links (email, résumé, LinkedIn, GitHub, X) |
| `experience.ts` | Roles: company, title, dates, summary, notes |
| `work.ts` | Case studies: the home-page cards and each `/work/[slug]` page |
| `lab.ts` | Lab experiment index |
| `about.ts` | About paragraphs and principles |

**Demo content.** Copy written to complete the design while real details are
pending is wrapped in `demo("…")`; it renders like normal text. Every instance
is listed in [PLACEHOLDERS.md](PLACEHOLDERS.md), along with the source of
every verified fact. To find what's left:

```bash
grep -rn "demo(" src/content
```

Values that are simply unknown can use `draft("hint")`. These render as
quiet, dotted-underlined italic notes, so the site never looks broken.

**Images.** Each case study is drawn as a technical plate (`plate:
"replies" | "mastery" | "heatmap"`). Add `image: { src, alt, url }` to also
show a real screenshot of the shipped product on its case page.

**Résumé.** Drop the PDF into `public/` (e.g. `public/resume.pdf`) and set
`links.resume = "/resume.pdf"`. A Résumé button appears in the header.

## Make the glass see something new

Add attributes to any element and the loupe picks it up automatically:

| Attribute | Drawn as |
| --- | --- |
| `data-spec="Name"` | Component box, padding hatch, size, and gaps to sibling specs |
| `data-spec-type` | Letterforms as outlines, with baseline, x-height and cap height |
| `data-spec-grid` | This element's grid columns, drawn across the viewport |
| `data-loupe-skip` | Excluded from the drawing |

All other visible text gets its line boxes drawn automatically.

## Adding a lab experiment

1. Add an entry to `src/content/lab.ts`.
2. Create `src/lab/<slug>/index.tsx` (client component; lazy-load anything heavy
   with `next/dynamic`, like `src/lab/glass` does).
3. Register it in `src/lab/registry.ts`.

The `/lab/<slug>` route, its metadata and its sitemap entry are generated.

## Structure

```
src/
  app/            routes, layout, global CSS, metadata routes (OG, sitemap, robots)
  components/     Header, Loupe, sections, Plate (drafting plates)
  content/        all copy and facts, typed
  lab/            experiments and their registry
  lib/            spring integrator, global store, theme
docs/             DECISIONS.md and the rejected concept prototypes
```

# Portfolio — Under the Glass

Personal portfolio of Sahil Shityalkar, Frontend Lead Engineer at Clyra.

A calm, editorial site with one secret: press **L** (or tap **Inspect**) and a
glass slides over the page, showing its live engineering drawing, measured
from the DOM. The concept and every trade-off are in
[docs/DECISIONS.md](docs/DECISIONS.md), and a recording of the signature flow
is in [docs/demo.webm](docs/demo.webm).

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
| `lab.ts` | The three featured lab experiments and the lab URL |
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

## The lab

Experiments live in a separate application at **lab.sahilshityalkar.com**,
with its own repo and deploy. This site only features three of them. To
change which ones, edit `src/content/lab.ts`: each entry has a title, a
one-line summary, tech tags, a `slug` (opens `lab.sahilshityalkar.com/<slug>`)
and a `preview` drawing (`glass`, `spring` or `blueprint`).

Later, the lab can publish an `experiments.json` feed and this list can be
read from it at build time.

## Structure

```
src/
  app/            routes, layout, global CSS, metadata routes (OG, sitemap, robots)
  components/     Header, Loupe, sections, Plate (drafting plates)
  content/        all copy and facts, typed
  lib/            spring integrator, global store, theme
docs/             DECISIONS.md and the rejected concept prototypes
```

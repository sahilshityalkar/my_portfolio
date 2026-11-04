import type { Post } from "../writing";

/**
 * Every claim here is from the site's own code (the @media print block at
 * the end of src/app/globals.css, the reveal rules in the same file,
 * src/components/PrintButton.tsx, SectionHead.tsx, Header.tsx, Hero.tsx,
 * Contact.tsx), docs/DECISIONS.md (fifth pass) and the commit log: faf6440
 * (the print stylesheet), 7278646 (one-line section heads), c2976c0 (figures
 * on case pages) and 42ddd15 (the "Résumé (PDF)" label). The Playwright and
 * pdftoppm check is from the work sessions, as the author recorded it.
 */
export const print: Post = {
  slug: "a-portfolio-that-prints-as-a-resume",
  title: "A portfolio page that prints as a two-page résumé",
  dek: "Printing my home page gave six mostly blank pages. One print stylesheet now sets the same DOM as a two-page A4 summary, with no second template.",
  date: "2026-11-03",
  tags: ["css", "print", "frontend"],
  links: [{ label: "Print the home page", href: "/" }],
  body: [
    {
      type: "p",
      text: "Recruiters forward PDFs. Someone reads a page, saves it, and sends it to a hiring manager who may never open the link. There is no résumé file on my site yet, so the thing most likely to be forwarded was whatever the browser produced from my home page.",
    },
    { type: "p", text: "I tried it. Printing the page gave six mostly blank pages." },

    { type: "h", text: "Why it printed blank" },
    {
      type: "p",
      text: "Two parts of the screen design worked against paper. First, sections rise in as they are scrolled into view. With JavaScript running, anything marked `data-reveal` starts transparent and slightly lowered, and an `IntersectionObserver` sets `data-in` when it enters the viewport. Printing does not scroll, so every section I had not reached stayed invisible while still taking up its space.",
    },
    {
      type: "p",
      text: "Second, the header is fixed, and a fixed element repeats on every printed page. So each blank sheet still had my navigation across the top.",
    },

    { type: "h", text: "One DOM, two pages" },
    {
      type: "p",
      text: "I did not want a second résumé template. Two copies of the same facts drift apart, and the page is already where I keep them accurate. So the goal was a print stylesheet and nothing else: the same DOM, set as a two-page A4 summary.",
    },
    {
      type: "p",
      text: "Page one holds my name, role, contact details with the addresses written out, the statement and the three case studies as compact rows. Page two holds experience, education, what I bring and the toolkit. Everything that only makes sense on a screen steps out: the glass, the drawn plates beside each case, the measure in the hero, the lab, the writing and the colophon.",
    },

    { type: "h", text: "Override the tokens, not the rules" },
    {
      type: "p",
      text: "The site's colours are custom properties, so print overrides the tokens rather than individual rules. It matches `:root[data-theme]`, which has the same specificity as the Night theme's selector and comes later in the file, so Night prints exactly like Day: black on white.",
    },
    {
      type: "code",
      lang: "css",
      caption: "globals.css: the page box and the paper tokens",
      code: `@page {
  size: A4;
  margin: 14mm 16mm 16mm;
}
@media print {
  :root,
  :root[data-theme] {
    --paper: #fff;
    /* ... */
    --ink: #111;
    /* ... */
    --ink-3: #555;
    --mark: #a8321c;
    /* ... */
    color-scheme: light;
    font-size: 11.5px;
  }
  /* ... */`,
    },
    {
      type: "p",
      text: "Body text is set in rem, so dropping the root size to 11.5px scales it down. The name, the titles and the lede get explicit point sizes, and the name is set on one line, with the surname still in italic.",
    },

    { type: "h", text: "Nothing waits for a reveal" },
    {
      type: "code",
      lang: "css",
      caption: "globals.css: reveal states forced visible",
      code: `/* nothing waits for a reveal on paper */
[data-reveal],
.fade-in,
.mask-line > span {
  opacity: 1 !important;
  transform: none !important;
  animation: none !important;
  transition: none !important;
  color: var(--ink);
  -webkit-text-stroke-width: 0 !important;
}`,
    },
    {
      type: "p",
      text: "The `!important` flags are deliberate. The screen rule `.js [data-reveal]` is more specific than anything I wanted to write for print, and the name's entrance is an animation that starts as an outline and inks in. On paper none of that means anything, so print overrides it outright.",
    },
    {
      type: "p",
      text: "Hiding is one `display: none` list: the header, the page ruler, the glass's canvas and status strip, every button inside `main` (the print controls included), the plates, the hero's measure, the lab, the writing, and everything in Contact except one print-only note.",
    },

    { type: "h", text: "Links that still work on paper" },
    {
      type: "p",
      text: "A link on paper is only useful if the reader can see where it goes. External links print their address after the text in small mono. Links to case studies print the site's domain in front of the path, since a relative path means nothing on a sheet.",
    },
    {
      type: "code",
      lang: "css",
      caption: "globals.css: addresses after links, and where they are suppressed",
      code: `main a[href^="http"]::after {
  content: " " attr(href);
  /* ... */
}
main a[href^="/work/"]::after {
  content: " sahilshityalkar.com" attr(href);
  /* ... */
}
/* no address after a title: the case study line carries it */
#work h3 a::after,
#intro [data-spec="Role"] a::after {
  content: none !important;
}`,
    },
    {
      type: "p",
      text: "Printing every address made some rows repeat themselves. A case title links to its case study, and the line under it already carries the same address, so titles print none. I turned it off for the company link in the role line too. The email link needs no rule: its text is the address.",
    },

    { type: "h", text: "Cases as rows" },
    {
      type: "p",
      text: "On screen each case is a large entry beside a drawing. On paper I wanted a row: what it is on the left, the facts on the right. In print, each case's text column becomes a two-column CSS grid. Everything defaults to the left column; the facts list (role and stack) and the last paragraph (the links) go in the right one, with explicit `grid-row` spans so both columns start at the top. Each row has `break-inside: avoid`, so a case never splits across pages.",
    },

    { type: "h", text: "Breaks, and a head marked for print" },
    {
      type: "p",
      text: "Page two starts with Experience (`break-before: page`). A section head never ends a page (`break-after: avoid`), list items in Experience and About do not split, and on case pages a figure never splits across two sheets.",
    },
    {
      type: "p",
      text: "Section heads on screen sit on a 12-column grid: sheet number, title, and an aside that wraps under them on narrow widths. On paper the aside wrapped onto a second line, so print turns the head into a single flex row.",
    },
    {
      type: "p",
      text: "Describing the head by its structure would not have worked: the hero's first child is the same 12-column grid, so a selector like `main section > div:first-child` matches it too. Instead `SectionHead` renders a `data-section-head` attribute, and print targets only that.",
    },
    {
      type: "code",
      lang: "css",
      caption: "globals.css: a section head on paper",
      code: `/* a section head on paper: number, title, and its aside on one line */
[data-section-head] {
  display: flex !important;
  align-items: baseline;
  gap: 6mm;
}
[data-section-head] > h2 {
  flex: 1;
}
[data-section-head] > div {
  white-space: nowrap;
}`,
    },

    { type: "h", text: "A print-only note, and a button that prints" },
    {
      type: "p",
      text: "The only print-only content is a line at the foot of page two: \"Printed from sahilshityalkar.com. On screen the page measures itself: press L to look under the glass.\" It is hidden on screen and shown in print.",
    },
    {
      type: "p",
      text: "The control is a button that calls `window.print()`. It is hidden without JavaScript, since it cannot work without it. It sits in the header on wide screens, where recruiters look for a résumé, in the hero's links on smaller ones, and in Contact as \"Save the résumé as PDF\". All of them disappear once `links.resume` points at a real file.",
    },
    {
      type: "p",
      text: "It was first labelled \"PDF summary\". A review from a recruiter's point of view suggested \"Résumé (PDF)\", because that is the word people scan a header for. I took the label and kept the framing honest: the button's title says it is this page as a two-page résumé, and it gives way to a real résumé file once one exists.",
    },

    { type: "h", text: "Check the PDF, not the preview" },
    {
      type: "p",
      text: "Print preview is a poor test harness, so I check the output the way a recipient sees it. Playwright's `page.pdf()` renders the page with print media to an A4 PDF, and `pdftoppm` turns each page into an image I can look at. That is how I check that the summary is two pages and that each one reads well. It covers Chromium only. Other engines paginate differently, and I have not checked them.",
    },

    { type: "h", text: "Trade-offs" },
    {
      type: "p",
      text: "The stylesheet is coupled to markup. Rules like `#work ol > li > div > dl` depend on the exact nesting of a component, and a harmless change to a case entry could quietly break the printed row. Even the break rule above, `main section > div:first-child`, also matches the hero; it is harmless there, but by luck rather than intent. If I did it again, I would mark every print role with an attribute from the start, as I did for section heads, and add an automated check that the PDF has exactly two pages.",
    },
    {
      type: "p",
      text: "It is also a summary, not a résumé. It says nothing the page does not, which is the point of having one source of truth. But a recruiter comparing candidates may expect a conventional document, and the right answer to that is a real résumé file. That is why every print control steps aside once one exists.",
    },

    { type: "h", text: "What I'd take away" },
    {
      type: "list",
      items: [
        "Print the page you ship before someone else does. Reveal-on-scroll states and fixed headers look fine on screen and fail on paper.",
        "Override design tokens for print, not individual colours, and match the theme selector so Night prints like Day.",
        "Mark structure for print explicitly. A selector that describes layout will match more than you meant.",
        "Verify the PDF as images, not in print preview.",
      ],
    },
  ],
};

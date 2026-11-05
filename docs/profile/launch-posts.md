# Launch posts

Short, plain, specific. Post the portfolio first, then one note a week.
Attach the link; the share cards are designed for these previews.

## The portfolio (LinkedIn)

> I rebuilt my portfolio as a working sample rather than a gallery.
>
> It measures itself: the footer prints this visit's real LCP and CLS, and
> pressing L slides a glass over the page that draws its own layout, measured
> live from the DOM. Layout shift stays at zero, even while you drag the
> hero's line length around.
>
> If you hire frontend engineers, the "Résumé (PDF)" button prints the page as
> a two-page summary.
>
> sahilshityalkar.com

## "A green build is not a working product"

> 22 of 22 tests passed and the build was green, yet my side project had not
> saved a single reply to its database. A missing migration, and an insert
> error the code quietly threw away.
>
> What found it, the two-line fix, and the check that now fails a deploy
> instead: [link]

## "Drag the measure without moving the page"

> Reflowing text while the user drags counts as layout shift, because a drag
> is not a discrete input. So my portfolio re-sets the paragraph on a canvas
> with the same line-breaking rules as CSS, and hands back to the DOM without
> moving a pixel. CLS stays at 0.000. [link]

## "One fallback was not enough for optical sizes"

> One size-adjust cannot match a font whose width changes with its size.
> How three fallback tiers took font-swap layout shift on my portfolio to
> zero, and the debugging detour that cost me an hour. [link]

## "A canvas loupe at 4x CPU: 50 ms to 16.8 ms at p95"

> My portfolio's loupe spent its frames repainting pixels that had not
> changed. A profile, an offscreen canvas and a lens-sized window took it
> from 21.8 ms to 17.6 ms a frame on a 4x slowed CPU. [link]

## X (one line each)

- Built my portfolio to measure itself. Press L. sahilshityalkar.com
- A green build is not a working product: [link]
- Drag the measure without moving the page: [link]

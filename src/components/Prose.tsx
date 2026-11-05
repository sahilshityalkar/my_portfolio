import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import type { Block } from "@/content/writing";
import { tokenize } from "@/lib/inline";
import { anchor } from "@/lib/reading";

/**
 * Inline text (see lib/inline.ts): internal links (starting with /) use the
 * router; external ones open in a new tab.
 */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {tokenize(text).map((t, k) =>
        t.kind === "code" ? (
          <code key={k}>{t.text}</code>
        ) : t.kind === "em" ? (
          <em key={k}>{t.text}</em>
        ) : t.kind === "link" ? (
          t.href.startsWith("/") ? (
            <Link key={k} href={t.href} className="link-draw prose-link">
              {t.text}
            </Link>
          ) : (
            <a key={k} href={t.href} target="_blank" rel="noreferrer" className="link-draw prose-link">
              {t.text}
            </a>
          )
        ) : (
          <Fragment key={k}>{t.text}</Fragment>
        ),
      )}
    </>
  );
}

/** The body of a post, in the site's own typography. */
export function Prose({ body }: { body: Block[] }) {
  return (
    <div className="prose" data-spec="Prose">
      {body.map((b, i) => (
        <Fragment key={i}>
          {b.type === "p" ? (
            <p>
              <Inline text={b.text} />
            </p>
          ) : b.type === "h" ? (
            <h2 id={anchor(b.text)}>
              <Inline text={b.text} />
            </h2>
          ) : b.type === "list" ? (
            b.ordered ? (
              <ol>
                {b.items.map((t, j) => (
                  <li key={j}>
                    <Inline text={t} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul>
                {b.items.map((t, j) => (
                  <li key={j}>
                    <Inline text={t} />
                  </li>
                ))}
              </ul>
            )
          ) : b.type === "code" ? (
            <figure className="prose-code">
              {b.caption ? <figcaption className="t-meta">{b.caption}</figcaption> : null}
              {/* a long line scrolls inside the block, never the page */}
              <pre tabIndex={0} aria-label={b.caption ? `Code: ${b.caption}` : "Code"}>
                <code data-lang={b.lang}>{b.code}</code>
              </pre>
            </figure>
          ) : b.type === "quote" ? (
            <blockquote>
              <Inline text={b.text} />
            </blockquote>
          ) : b.type === "note" ? (
            <aside className="prose-note">
              <Inline text={b.text} />
            </aside>
          ) : (
            <figure className="prose-figure">
              <Image src={b.src} alt={b.alt} width={b.width} height={b.height} sizes="(min-width: 768px) 42rem, 100vw" />
              {b.caption ? <figcaption className="t-meta">{b.caption}</figcaption> : null}
            </figure>
          )}
        </Fragment>
      ))}
    </div>
  );
}

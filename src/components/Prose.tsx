import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import type { Block } from "@/content/writing";

/**
 * Inline text: `code`, *emphasis* and [links](https://...), nothing else.
 * Internal links (starting with /) use the router; external ones open in a
 * new tab.
 */
export function Inline({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  const re = /`([^`]+)`|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let k = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<code key={k++}>{m[1]}</code>);
    else if (m[2] !== undefined) out.push(<em key={k++}>{m[2]}</em>);
    else if (m[3] !== undefined && m[4] !== undefined) {
      const href = m[4];
      out.push(
        href.startsWith("/") ? (
          <Link key={k++} href={href} className="link-draw prose-link">
            {m[3]}
          </Link>
        ) : (
          <a key={k++} href={href} target="_blank" rel="noreferrer" className="link-draw prose-link">
            {m[3]}
          </a>
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** A heading's anchor: lower case, words joined by hyphens. */
export const anchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");

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

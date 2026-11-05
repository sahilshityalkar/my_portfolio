/**
 * The inline grammar of a post's text: `code`, *emphasis* and
 * [links](url), nothing else. Pure, so it is unit-tested
 * (tests/inline.test.ts); components/Prose.tsx renders the tokens.
 */
export type Token =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "em"; text: string }
  | { kind: "link"; text: string; href: string };

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  const re = /`([^`]+)`|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ kind: "text", text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: "code", text: m[1] });
    else if (m[2] !== undefined) out.push({ kind: "em", text: m[2] });
    else if (m[3] !== undefined && m[4] !== undefined) out.push({ kind: "link", text: m[3], href: m[4] });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

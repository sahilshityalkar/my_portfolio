/**
 * A small line breaker for the hero's live measure: the paragraph is re-set on
 * a canvas while its measure is dragged, so reflowing it never moves the page.
 *
 * Breaking is greedy at spaces (what browsers do), and `balance` mirrors CSS
 * `text-wrap: balance`: the narrowest width that keeps the greedy line count,
 * found by bisection. Widths come from the caller's canvas text metrics, with
 * the same font, size and tracking as the DOM text.
 */
export type Measure = (text: string) => number;

export function greedy(words: string[], width: number, measure: Measure): string[] {
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && measure(next) > width) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** The greedy lines at the narrowest width that still needs no extra line. */
export function balance(words: string[], width: number, measure: Measure): string[] {
  const target = greedy(words, width, measure).length;
  if (target < 2) return greedy(words, width, measure);
  let lo = 0;
  let hi = width;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (greedy(words, mid, measure).length <= target) hi = mid;
    else lo = mid;
  }
  return greedy(words, hi, measure);
}

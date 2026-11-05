import type { Block } from "../content/writing";

/**
 * Reading helpers for posts, pure so they are unit-tested
 * (tests/reading.test.ts).
 */

/** Reading time at 220 words a minute, code counted at half weight; at least 1. */
export function minutes(body: Block[]) {
  let words = 0;
  const count = (s: string) => s.split(/\s+/).filter(Boolean).length;
  for (const b of body) {
    if (b.type === "code") words += count(b.code) / 2;
    else if (b.type === "list") words += count(b.items.join(" "));
    else if ("text" in b) words += count(b.text);
  }
  return Math.max(1, Math.round(words / 220));
}

/** "2026-11-04" to "4 November 2026", the same in every time zone. */
export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** A heading's anchor: lower case, letters and digits, words joined by hyphens. */
export const anchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");

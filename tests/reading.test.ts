import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { anchor, formatDate, minutes } from "../src/lib/reading.ts";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

test("reading time: 220 words a minute, at least one", () => {
  assert.equal(minutes([{ type: "p", text: "Short." }]), 1);
  assert.equal(minutes([{ type: "p", text: words(440) }]), 2);
  assert.equal(minutes([{ type: "h", text: words(220) }, { type: "list", items: [words(220), words(220)] }]), 3);
});

test("reading time: code counts at half weight", () => {
  assert.equal(minutes([{ type: "code", code: words(880) }]), 2);
});

test("dates read the same in every time zone", () => {
  assert.equal(formatDate("2026-11-04"), "4 November 2026");
  assert.equal(formatDate("2026-01-01"), "1 January 2026");
});

test("anchors are lower case, hyphenated, without punctuation", () => {
  assert.equal(anchor('What "done" meant'), "what-done-meant");
  assert.equal(anchor("  Keep the DOM, draw a copy "), "keep-the-dom-draw-a-copy");
});

test("no post contains an em or en dash", () => {
  const dir = new URL("../src/content/posts/", import.meta.url);
  for (const f of readdirSync(dir)) {
    const text = readFileSync(new URL(f, dir), "utf8");
    assert.ok(!/[–—]/.test(text), `${f} contains an em or en dash`);
  }
});

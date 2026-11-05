import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenize } from "../src/lib/inline.ts";

test("plain text is one token", () => {
  assert.deepEqual(tokenize("Just words."), [{ kind: "text", text: "Just words." }]);
});

test("code, emphasis and links, in order, with the text between", () => {
  assert.deepEqual(tokenize("Call `measure()` *once* per [frame](https://example.com/raf)."), [
    { kind: "text", text: "Call " },
    { kind: "code", text: "measure()" },
    { kind: "text", text: " " },
    { kind: "em", text: "once" },
    { kind: "text", text: " per " },
    { kind: "link", text: "frame", href: "https://example.com/raf" },
    { kind: "text", text: "." },
  ]);
});

test("internal links keep their path", () => {
  assert.deepEqual(tokenize("[the case](/work/replyai)"), [{ kind: "link", text: "the case", href: "/work/replyai" }]);
});

test("markup inside code is left alone", () => {
  assert.deepEqual(tokenize("`a*b*[c](d)`"), [{ kind: "code", text: "a*b*[c](d)" }]);
});

test("unclosed markers stay text", () => {
  assert.deepEqual(tokenize("2 * 3 and `open"), [{ kind: "text", text: "2 * 3 and `open" }]);
});

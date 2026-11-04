import { test } from "node:test";
import assert from "node:assert/strict";
import { balance, greedy } from "../src/lib/measure.ts";

// a monospace "font": every character is 1 unit wide, a space included
const mono = (s: string) => s.length;
const words = "I build interfaces end to end: the architecture underneath".split(" ");

test("greedy fills each line as far as the width allows", () => {
  assert.deepEqual(greedy(["aa", "bb", "cc"], 5, mono), ["aa bb", "cc"]);
  assert.deepEqual(greedy(["aa", "bb", "cc"], 8, mono), ["aa bb cc"]);
  for (const line of greedy(words, 20, mono)) assert.ok(line.length <= 20, line);
});

test("greedy never splits a word, even one wider than the measure", () => {
  assert.deepEqual(greedy(["a", "architecture", "b"], 5, mono), ["a", "architecture", "b"]);
});

test("greedy keeps every word, in order", () => {
  assert.equal(greedy(words, 17, mono).join(" "), words.join(" "));
});

test("balance keeps the greedy line count and never widens a line", () => {
  for (const width of [14, 20, 27, 33, 45]) {
    const g = greedy(words, width, mono);
    const b = balance(words, width, mono);
    assert.equal(b.length, g.length, `width ${width}`);
    assert.ok(Math.max(...b.map(mono)) <= Math.max(...g.map(mono)), `width ${width}`);
    assert.equal(b.join(" "), words.join(" "));
  }
});

test("balance evens out a ragged last line", () => {
  // greedy at 11: "aaaa bbbb c" / "d"; balanced: two lines of similar length
  const b = balance(["aaaa", "bbbb", "c", "d"], 11, mono);
  assert.equal(b.length, 2);
  assert.ok(Math.abs(b[0]!.length - b[1]!.length) <= 4, b.join(" | "));
});

test("a single line, and no words at all", () => {
  assert.deepEqual(balance(["one", "line"], 40, mono), ["one line"]);
  assert.deepEqual(greedy([], 10, mono), []);
});

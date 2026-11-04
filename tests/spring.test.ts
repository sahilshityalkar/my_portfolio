import { test } from "node:test";
import assert from "node:assert/strict";
import { Spring, springs } from "../src/lib/spring.ts";

/** Run a spring for `seconds` at `hz` frames per second; returns its value. */
function run(hz: number, seconds: number, cfg = springs.aperture) {
  const s = new Spring(0, cfg);
  s.target = 100;
  // whole frames: accumulating 1/hz in floating point would drift by a frame
  const frames = Math.round(seconds * hz);
  for (let i = 0; i < frames; i++) s.step(1 / hz);
  return s;
}

test("a spring settles on its target and reports rest", () => {
  const s = run(60, 3);
  assert.equal(s.value, 100);
  assert.equal(s.velocity, 0);
  assert.equal(s.step(1 / 60), false);
});

test("the same spring moves identically at 60, 120 and 144 Hz", () => {
  // part-way through the motion, where frame-rate dependence would show
  const at = (hz: number) => run(hz, 0.25).value;
  assert.ok(Math.abs(at(60) - at(120)) < 0.5, `${at(60)} vs ${at(120)}`);
  assert.ok(Math.abs(at(60) - at(144)) < 0.5, `${at(60)} vs ${at(144)}`);
});

test("a long frame (a backgrounded tab) is clamped, not integrated whole", () => {
  const s = new Spring(0, springs.glass);
  s.target = 100;
  s.step(10); // ten seconds in one frame
  assert.ok(Number.isFinite(s.value));
  assert.ok(s.value < 100, "one clamped frame cannot finish the motion");
});

test("snap jumps without motion", () => {
  const s = new Spring(0, springs.flood);
  s.snap(42);
  assert.equal(s.value, 42);
  assert.equal(s.target, 42);
  assert.equal(s.step(1 / 60), false);
});

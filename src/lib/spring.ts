/**
 * A damped harmonic spring integrated on wall-clock time, not on frames.
 *
 * The same spring settles identically at 60, 120 or 144Hz: each animation frame
 * is split into fixed 1/240s sub-steps (semi-implicit Euler), and the frame delta
 * is clamped so a backgrounded tab does not explode the simulation on return.
 *
 * This is the whole motion language of the site: one integrator, a few named
 * presets, used by the loupe, the theme transition and the reveal system.
 */
export type SpringConfig = { stiffness: number; damping: number; mass?: number };

export const springs = {
  /** The loupe following the pointer: heavy glass, slight lag, no wobble. */
  glass: { stiffness: 260, damping: 30, mass: 1 },
  /** Opening and closing the lens: a soft, confident overshoot. */
  aperture: { stiffness: 170, damping: 19, mass: 1 },
  /** Expanding the lens to fill the screen. */
  flood: { stiffness: 90, damping: 18, mass: 1 },
} satisfies Record<string, SpringConfig>;

const STEP = 1 / 240;
const MAX_DT = 1 / 20;

export class Spring {
  value: number;
  target: number;
  velocity = 0;
  private cfg: Required<SpringConfig>;

  constructor(value: number, cfg: SpringConfig) {
    this.value = value;
    this.target = value;
    this.cfg = { mass: 1, ...cfg };
  }

  set config(cfg: SpringConfig) {
    this.cfg = { mass: 1, ...cfg };
  }

  /** Jump without animating (reduced motion, first placement). */
  snap(v: number) {
    this.value = v;
    this.target = v;
    this.velocity = 0;
  }

  /** Advance by `dt` seconds. Returns true while still moving. */
  step(dt: number): boolean {
    const { stiffness: k, damping: c, mass: m } = this.cfg;
    let t = Math.min(dt, MAX_DT);
    while (t > 0) {
      const h = Math.min(STEP, t);
      const force = -k * (this.value - this.target) - c * this.velocity;
      this.velocity += (force / m) * h;
      this.value += this.velocity * h;
      t -= h;
    }
    const resting = Math.abs(this.velocity) < 0.01 && Math.abs(this.value - this.target) < 0.01;
    if (resting) this.snap(this.target);
    return !resting;
  }
}

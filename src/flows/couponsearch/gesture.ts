import { csTokens } from './tokens';

const { decel, rubber: c } = csTokens.gesture;

/** UIScrollView-style projection: where a release at `v` px/s coasts to (Apple's `project(initialVelocity:decelerationRate:)`). */
export const project = (pos: number, v: number, rate: number = decel) => pos + ((v / 1000) * rate) / (1 - rate);

/** UIKit rubber band past an edge: o·d·c / (d + c·|o|), diminishing returns the further you pull. */
export const rubber = (o: number, d: number) => (o * d * c) / (d + c * Math.abs(o));

/** Pointer velocity (px/s) from the last ~80ms of samples; 0 when the finger stopped before release. */
export function velocityTracker() {
  let s: { v: number; t: number }[] = [];
  return {
    reset() {
      s = [];
    },
    add(v: number, t = performance.now()) {
      s.push({ v, t });
      while (s.length > 2 && t - s[0].t > 80) s.shift();
    },
    get(now = performance.now()) {
      if (s.length < 2) return 0;
      const a = s[0];
      const b = s[s.length - 1];
      if (now - b.t > 60) return 0;
      const dt = (b.t - a.t) / 1000;
      return dt > 0 ? (b.v - a.v) / dt : 0;
    },
  };
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

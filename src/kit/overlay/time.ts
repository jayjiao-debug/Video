// overlay/time.ts: THE CLOCK OF AN OVERLAY (shared kit; src/kit/overlay/README.md).
// Every overlay is a plain function of the frame: no hooks, no state, nothing random, so frames render in any order on
// fresh pages. These are the timing pieces only. What moves, and what it looks like, is each film's own.
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const clamp01 = (x: number) => clamp(x, 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (x: number, p = 3) => 1 - Math.pow(1 - clamp01(x), p);
export const easeIn = (x: number, p = 3) => Math.pow(clamp01(x), p);
export const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
/** out with one overshoot (`over` 1.7 = gentle, 2.6 = a pop) */
export const easeOutBack = (x: number, over = 1.70158) => { const t = clamp01(x) - 1; return 1 + (over + 1) * t * t * t + over * t * t; };
/** a deterministic 0..1 from two integers: the only "random" an overlay may use */
export const hash01 = (i: number, k = 0) => { const s = Math.sin(i * 12.9898 + k * 78.233 + 0.37) * 43758.5453; return s - Math.floor(s); };

/** where an overlay is in its life: t = frames since it came up, len = its whole length, arrive 0..1 over its first
 *  frames, leave 0..1 over its last frames, k = how present it is (min of arriving and not yet leaving) */
export type Life = { t: number; len: number; arrive: number; leave: number; k: number };
/** THE LIFE of an overlay shown on frames [from, to] (inclusive): null outside. It arrives over `nin` frames and leaves
 *  over its last `nout`; one that starts on frame 0 is already in. */
export const life = (f: number, from: number, to: number, nin = 6, nout = 6): Life | null => {
  if (f < from || f > to) return null;
  const t = f - from, arrive = from === 0 ? 1 : clamp01((t + 1) / Math.max(1, nin)), leave = nout > 0 ? clamp01((f - (to - nout)) / nout) : 0;
  return { t, len: to - from + 1, arrive, leave, k: Math.min(arrive, 1 - leave) };
};
/** the progress 0..1 of ONE PART of an overlay: it starts `at` frames into the life and takes `n` frames */
export const part = (t: number, at: number, n: number) => clamp01((t - at + 1) / Math.max(1, n));
/** the start of item i when parts come one after another, `step` frames apart */
export const stagger = (i: number, step: number, first = 0) => first + i * step;
/** A POP: a part that arrives small and overshoots once. s = its scale (from `small` to 1), o = its opacity, k = raw */
export const pop = (t: number, at: number, n = 7, over = 2.6, small = 0.35) => {
  const k = easeOutBack(part(t, at, n), over);
  return { k, s: small + (1 - small) * k, o: part(t, at, 3) };
};
/** A SLAP: it lands LARGE on frame `at` and squashes to rest over four frames (a seal, a stamp, a slammed word).
 *  Returns the scale; 0 before `at`. */
export const slap = (t: number, at: number, big = 1.7) => {
  const d = t - at;
  return d < 0 ? 0 : d === 0 ? big : d === 1 ? 1 + (big - 1) * 0.4 : d === 2 ? 0.94 : d === 3 ? 1.04 : 1;
};
/** A SHAKE that dies over `n` frames from `at`: an offset in px, the same on every render */
export const shake = (t: number, at: number, n = 6, amp = 10, seed = 0) => {
  const d = t - at;
  if (d < 0 || d >= n) return { x: 0, y: 0 };
  const a = amp * Math.pow(1 - d / n, 2);
  return { x: a * (2 * hash01(d, seed) - 1), y: a * (2 * hash01(d, seed + 5) - 1) };
};
/** a slow growth over a life (1 at its start, 1 + amount at its end): a held overlay is never dead still */
export const drift = (l: Life, amount = 0.03) => 1 + amount * (l.t / l.len);

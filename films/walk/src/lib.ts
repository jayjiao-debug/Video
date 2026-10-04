import music from './music.json';

/* Timing helpers (video-engine-v1). Every visual is a pure function of the global time T in seconds:
   no state, no effects that animate on their own. That is what makes chunked cloud renders and
   per-scene re-renders possible. */
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const beats: number[] = music.beats;
/** time of beat i; write all scene timing as b(i) so cuts and pops land on the music */
export const b = (i: number) => beats[Math.max(0, Math.min(beats.length - 1, i))];
export const clamp = (x: number, a = 0, c = 1) => Math.max(a, Math.min(c, x));
export const prog = (t: number, a: number, z: number) => clamp((t - a) / (z - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a: number, z: number, x: number) => a + (z - a) * x;
/** fade in over [at, at+fin], out over [out-fout, out] */
export const inOut = (t: number, at: number, out: number, fin = 0.45, fout = 0.35) => Math.min(easeOut(prog(t, at, at + fin)), 1 - prog(t, out - fout, out));
/** overshoot pop for things that appear on a beat */
export const pop = (T: number, a: number, d = 0.28) => {
  const k = clamp((T - a) / d);
  return k <= 0 ? 0 : easeOut(k) + 0.16 * Math.sin(k * Math.PI) * (1 - k);
};
/** deterministic random numbers (never Math.random in a frame) */
export const mulberry = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

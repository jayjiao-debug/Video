import music from './music.json'; // written by scripts/beats.py: { beats: number[], markers: {...}, tempo }

/* Timing helpers. Every visual is a pure function of the global time T (seconds): no state, no useEffect animations.
   That is what makes chunked cloud renders and per-scene re-renders possible. */
export const FPS = 30;
export const ZH = '"Noto Serif CJK SC", "Noto Serif SC", serif';
export const EN = '"Cormorant Garamond", Georgia, serif';
export const beats: number[] = music.beats;
/** time of beat i; write all scene timing as b(i) so cuts and pops land on the music */
export const b = (i: number) => beats[i];

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
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/** camera keyframes: [time, position, lookAt]; eased between keys */
export type Key = [number, number[], number[]];
export const camAt = (keys: Key[], T: number) => {
  let i = 0;
  while (i < keys.length - 2 && T > keys[i + 1][0]) i++;
  const [ta, pa, la] = keys[i], [tb, pb, lb] = keys[i + 1];
  const k = easeInOut(prog(T, ta, tb));
  return { pos: pa.map((x, j) => lerp(x, pb[j], k)), look: la.map((x, j) => lerp(x, lb[j], k)) };
};

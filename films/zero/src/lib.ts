import music from './music.json'; // beat grid of public/bgm.mp3 (118 bpm, 323 beats; markers break/build/drop/outro)

/* Timing helpers (video engine V1). Every visual is a pure function of the global time T (seconds):
   no state, no useEffect animations, so any frame range renders on its own (farm chunks, per-scene fixes). */
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const FILM_END = 157.2; // the end card holds ~6 s after b296; the music fades out over the last 3 s
export const FILM_FRAMES = Math.round(FILM_END * FPS);
export const ZH = '"Noto Serif CJK SC", "Noto Serif SC", serif';
export const SANS = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif';
export const EN = '"Cormorant Garamond", Georgia, serif';
export const GOLD = '#f6cf78';
export const RED = '#ff6a5c';
export const INK = '#f3ede2';
export const NIGHT = '#05070d';

export const beats: number[] = music.beats;
/** time of beat i; write all scene timing as b(i) so cuts and pops land on the music */
export const b = (i: number) => beats[Math.max(0, Math.min(beats.length - 1, i))];
/** time of a fractional beat index (between two beats, linearly) */
export const bf = (x: number) => { const i = Math.max(0, Math.min(beats.length - 2, Math.floor(x))); return lerp(beats[i], beats[i + 1], x - i); };
/** a scene written against one beat grid, re-timed onto another: piecewise-linear [oldBeat, newBeat] anchors */
export const remapBeats = (anchors: [number, number][]) => (i: number) => {
  let k = 0; while (k < anchors.length - 2 && i > anchors[k + 1][0]) k++;
  const [a0, n0] = anchors[k], [a1, n1] = anchors[k + 1];
  const x = a1 === a0 ? n1 : n0 + (n1 - n0) * Math.max(0, Math.min(1, (i - a0) / (a1 - a0)));
  return bf(x);
};
/** a hard cut on beat i: the new shot's first frame lands on (never after) the beat */
export const cut = (i: number) => b(i) - 0.02;

export const clamp = (x: number, a = 0, c = 1) => Math.max(a, Math.min(c, x));
export const prog = (t: number, a: number, z: number) => clamp((t - a) / (z - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a: number, z: number, x: number) => a + (z - a) * x;
/** fade in over [at, at+fin], out over [out-fout, out] */
export const inOut = (t: number, at: number, out: number, fin = 0.45, fout = 0.35) => Math.min(easeOut(prog(t, at, at + fin)), 1 - prog(t, out - fout, out));
/** overshoot pop for something that lands on a beat */
export const pop = (T: number, a: number, d = 0.28) => {
  const k = clamp((T - a) / d);
  return k <= 0 ? 0 : easeOut(k) + 0.16 * Math.sin(k * Math.PI) * (1 - k);
};
/** a single decaying hit (flash, shake) starting at a */
export const hit = (T: number, a: number, decay = 0.12) => (T < a ? 0 : Math.exp(-(T - a) / decay));
/** deterministic random numbers (never Math.random in a frame) */
export const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const rnd = (i: number, k = 0) => mulberry(i * 7919 + k * 104729 + 17)();
/** camera keyframes: [time, position, lookAt]; eased between keys */
export type Key = [number, number[], number[]];
export const camAt = (keys: Key[], T: number) => {
  let i = 0;
  while (i < keys.length - 2 && T > keys[i + 1][0]) i++;
  const [ta, pa, la] = keys[i], [tb, pb, lb] = keys[i + 1];
  const k = easeInOut(prog(T, ta, tb));
  return { pos: pa.map((x, j) => lerp(x, pb[j], k)), look: la.map((x, j) => lerp(x, lb[j], k)) };
};
/** monotone cubic (Fritsch–Carlson) through [time, values[]] keys: C1-smooth, never overshoots, keeps moving through
    the keys (no stop at each key, unlike camAt), so a long camera move reads as one continuous motion */
export const smoothKeys = (keys: [number, number[]][], T: number) => {
  const n = keys.length, dim = keys[0][1].length;
  if (T <= keys[0][0]) return keys[0][1].slice();
  if (T >= keys[n - 1][0]) return keys[n - 1][1].slice();
  let i = 0; while (i < n - 2 && T > keys[i + 1][0]) i++;
  const out: number[] = [];
  for (let j = 0; j < dim; j++) {
    const t = keys.map((k) => k[0]), y = keys.map((k) => k[1][j]);
    const d = t.slice(0, -1).map((_, k) => (y[k + 1] - y[k]) / (t[k + 1] - t[k]));
    const m = t.map((_, k) => {
      if (k === 0) return d[0];
      if (k === n - 1) return d[n - 2];
      if (d[k - 1] * d[k] <= 0) return 0;
      const w1 = 2 * (t[k + 1] - t[k]) + (t[k] - t[k - 1]), w2 = (t[k + 1] - t[k]) + 2 * (t[k] - t[k - 1]);
      return (w1 + w2) / (w1 / d[k - 1] + w2 / d[k]);
    });
    const h = t[i + 1] - t[i], s = (T - t[i]) / h;
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
    out.push(h00 * y[i] + h10 * h * m[i] + h01 * y[i + 1] + h11 * h * m[i + 1]);
  }
  return out;
};
/** a zoom key: [time, lookAt, direction from the target to the camera, distance]; distance is eased in log space, so a
    move from 60 units to 0.02 units feels like one steady dive (powers of ten) */
export type ZoomKey = [number, number[], number[], number];
export const zoomAt = (keys: ZoomKey[], T: number) => {
  const v = smoothKeys(keys.map(([t, l, d, r]) => [t, [...l, ...d, Math.log(r)]]), T);
  const look = v.slice(0, 3), dir = v.slice(3, 6), dist = Math.exp(v[6]);
  const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return { pos: look.map((x, j) => x + (dir[j] / len) * dist), look, dist };
};
/** Benford's law */
export const benford = (d: number) => Math.log10(1 + 1 / d);

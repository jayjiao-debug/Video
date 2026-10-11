import music from './music.json';

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const END = 130.5;
export const DURATION = Math.round(END * FPS);

export const C = {
  ink: '#0f1016',
  ink2: '#171a25',
  paper: '#ebe4d2',
  dim: '#a39d8c',
  gold: '#c9a45c',
  goldHi: '#f0d59a',
  rouge: '#b8483b',
  slate: '#6f7d91',
  slateHi: '#9aa8bd',
  cardBack: '#e2d6bb',
  cardFront: '#efe6d0',
  cardInk: '#2b2118',
};

export const ZH = '"Noto Serif CJK SC", "Noto Serif SC", serif';
export const EN = '"Cormorant Garamond", Georgia, serif';

export const beats: number[] = music.beats;

/** nth beat at or after time t */
export const beatAfter = (t: number, n = 0): number => {
  const i = beats.findIndex((b) => b >= t - 0.03);
  return beats[Math.min(beats.length - 1, i + n)];
};

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** fade in over [at, at+fin], fade out over [out-fout, out] */
export const inOut = (t: number, at: number, out: number, fin = 0.45, fout = 0.35) =>
  Math.min(easeOut(prog(t, at, at + fin)), 1 - prog(t, out - fout, out));

/** damped swing, degrees */
export const swing = (t: number, at: number, amp = 6) => {
  const d = t - at;
  if (d < 0) return 0;
  return amp * Math.exp(-d * 2.4) * Math.sin(d * 8);
};

/** optimal stopping success probability: reject first k of n, then take first best-so-far */
export const pStop = (n: number, k: number) => {
  if (k === 0) return 1 / n;
  let s = 0;
  for (let i = k + 1; i <= n; i++) s += 1 / (i - 1);
  return (k / n) * s;
};

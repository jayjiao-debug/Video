import music from './music.json';

/* 《草稿箱》: the regret of inaction. In the short run we regret what we did; over a life, what we didn't do. The
   undone stays open like an unsent draft. BGM only, subtitles burned in. Same music skeleton as 《最后一面》 / 《筛子》:
   the first drop lands on the title at 8.14 s, the second drop at 73.77 s. Every visual is a pure function of T. */
export const FPS = 30;
export const W = 1920;
export const H = 1080;

const B: number[] = music.beats;
const OFFSET = B[16];
export const MUSIC_OFFSET = OFFSET;
/** film time of track beat i */
export const fb = (i: number) => B[i] - OFFSET;
export const FILM_END = fb(206) + 0.3;
export const FILM_FRAMES = Math.round(FILM_END * FPS);
export const FILM_BEATS = B.map((b) => b - OFFSET).filter((t) => t >= 0 && t <= FILM_END);

// chapter cuts (on beats)
export const CUT = {
  title: fb(32), intro: fb(36), model: fb(46), net: fb(82), atus: fb(106), dunbar: fb(128), drop: fb(161), pay: fb(177), end: fb(197),
};

/** subtitles (burned in; also written to .srt), timed by scripts/lines.py */
export const SUBS: [number, number, string][] = [
  [0.10, 2.63, '如果今天是最后一天，'],
  [2.73, 5.42, '你最后悔的，会是哪件事？'],
  [5.52, 8.05, '心理学家问了很多人。'],
  [10.25, 12.28, '答案分成两种：'],
  [12.38, 15.15, '做错了的事，和没去做的事。'],
  [15.30, 18.98, '1994年，心理学家吉洛维奇发现：'],
  [19.08, 21.79, '只看上一周，最后悔的，'],
  [21.89, 24.27, '一半是做了的事。'],
  [24.37, 26.91, '可要是回看一辈子，'],
  [27.01, 30.53, '84%的人，最后悔的是没做的事。'],
  [30.63, 33.50, '两种后悔，随时间交叉了。'],
  [33.70, 36.88, '做错的事，我们会道歉、会弥补，'],
  [36.98, 39.51, '会说"至少我学到了"。'],
  [39.61, 42.47, '没做的事，永远停在"如果"。'],
  [42.57, 45.75, '时间越久，越觉得"当时我能行"。'],
  [45.90, 49.77, '2018年他又问：后悔的，是哪个自己？'],
  [49.87, 53.25, '72%，是没成为"想成为的自己"；'],
  [53.35, 56.90, '只有28%，是没尽到"该尽的责任"。'],
  [57.05, 59.85, '那当初，是什么拦住了我们？'],
  [59.95, 62.15, '常常是：怕被人看。'],
  [62.25, 65.65, '实验里，穿一件尴尬的T恤走进教室，'],
  [65.75, 68.55, '本人以为，一半人会注意到；'],
  [68.65, 71.30, '实际，只有大约四分之一。'],
  [71.40, 73.60, '整整高估了一倍。'],
  [73.85, 77.01, '别人没你想的那么在意你，'],
  [77.11, 80.60, '可你会一直记得，那件没做的事。'],
  [82.00, 85.03, '2022年，一项全球后悔调查：'],
  [85.13, 88.01, '109个国家，2万多条后悔。'],
  [88.11, 90.70, '30岁以后，"没做"的后悔，'],
  [90.80, 92.80, '是"做错"的两倍。'],
  [92.90, 96.60, '你有一件，一直没去做的事吗？'],
];

export const ZH = '"Noto Serif CJK SC", "Noto Serif SC", serif';
export const SANS = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif';
export const MONO = '"JunoMono", "DejaVu Sans Mono", monospace';
export const EN = '"Cormorant Garamond", Georgia, serif';

// palette: near-black, hard white, one hot red (TA / the last meeting), one cold blue (family / the other line), gold = brand
export const BG = '#060608';
export const INK = '#f2f0ea';
export const DIM = 'rgba(242,240,234,0.45)';
export const FAINT = 'rgba(242,240,234,0.12)';
export const RED = '#ff3d2e';
export const BLUE = '#4aa8ff';
export const GOLD = '#f1c56d';

export const clamp = (x: number, a = 0, c = 1) => Math.max(a, Math.min(c, x));
export const prog = (t: number, a: number, z: number) => clamp((t - a) / (z - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const expoInOut = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2);
export const lerp = (a: number, z: number, x: number) => a + (z - a) * x;
export const pop = (T: number, a: number, d = 0.3) => {
  const k = clamp((T - a) / d);
  return k <= 0 ? 0 : easeOut(k) + 0.18 * Math.sin(k * Math.PI) * (1 - k);
};
/** a decaying hit starting at a */
export const hit = (T: number, a: number, decay = 0.18) => (T < a ? 0 : Math.exp(-(T - a) / decay));
export const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const rnd = (i: number, k = 0) => mulberry(i * 7919 + k * 104729 + 17)();
export const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

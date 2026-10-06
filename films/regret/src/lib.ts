import music from './music.json';

/* 《没走的路》: the regret of inaction. In the short run we regret what we did; over a life, what we didn't do.
   Cinematic plates (generated stills) with 2.5D camera, letterbox, kinetic type. BGM only, subtitles burned in. Same music skeleton as 《最后一面》 / 《筛子》:
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
  [0.10, 2.45, '后悔分两种。'],
  [2.65, 5.00, '一种，时间会治好；'],
  [5.20, 8.05, '另一种，时间会放大。'],
  [10.25, 12.72, '1994年，心理学家问：'],
  [12.82, 15.15, '你这辈子，最后悔什么？'],
  [15.35, 17.10, '只看上一周：'],
  [17.20, 19.91, '53%的人，最后悔"做了"的事——'],
  [20.01, 22.31, '说错的话，冲动的决定。'],
  [22.41, 24.30, '拉长到一辈子——'],
  [24.50, 27.47, '84%的人，最后悔"没做"的事：'],
  [27.57, 30.38, '没去的地方，没说出口的话。'],
  [30.48, 33.45, '时间尺度一换，答案翻了过来。'],
  [33.70, 35.64, '原因很冷酷：'],
  [35.74, 38.91, '做错的事有结局，你会慢慢消化；'],
  [39.01, 42.48, '没做的事没有结局，大脑一直在补完。'],
  [42.58, 45.75, '而且越往后，你越确信"当时能行"。'],
  [45.90, 49.55, '2018年，他又追问：是哪一种"没做"？'],
  [49.65, 53.31, '72%的后悔，是没成为想成为的人；'],
  [53.41, 56.90, '只有28%，是没尽到该尽的责任。'],
  [57.05, 60.18, '拦住你的，常常是一个误判：'],
  [60.28, 63.24, '你以为所有人都在看你。'],
  [63.34, 66.97, '实验：穿一件尴尬的T恤走进教室，'],
  [67.07, 70.20, '本人估计，一半人会注意到；'],
  [70.30, 73.60, '实际：只有大约四分之一的人。'],
  [73.85, 77.36, '你高估了别人的目光一倍，'],
  [77.46, 80.60, '却低估了遗憾的寿命。'],
  [82.00, 86.36, '2022年，109个国家，2万多条后悔：'],
  [86.46, 89.40, '30岁以后，差距拉开：'],
  [89.50, 92.80, '"没做"的后悔，是"做错"的两倍。'],
  [92.90, 96.60, '你那条没走的路，是什么？'],
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

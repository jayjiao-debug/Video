import music from './music.json';

/* 《冰下捉鬼》: the 2026 Nobel Prize in Physics (Francis Halzen, IceCube). Every set drawn in code (no generated
   images), 2.5D camera, letterbox, kinetic type. BGM only, subtitles burned in. Same music skeleton as 《最后一面》 / 《筛子》:
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
  [0.10, 2.90, '就在这一秒，'],
  [3.00, 5.80, '100万亿个粒子，穿过了你，'],
  [5.90, 8.05, '你毫无感觉。'],
  [10.20, 12.51, '今年诺贝尔物理学奖，'],
  [12.61, 15.20, '颁给了在冰里捉它们的人。'],
  [15.35, 18.54, '它们叫中微子，外号"幽灵粒子"：'],
  [18.64, 21.34, '不带电，几乎没有质量，'],
  [21.44, 24.30, '能一口气穿过整个地球。'],
  [24.50, 27.62, '你这一生，被它撞上一次的概率，'],
  [27.72, 30.08, '大约只有四分之一。'],
  [30.18, 33.45, '想抓住它，探测器只能做得足够大。'],
  [33.70, 36.86, '1988年，物理学家哈尔岑提出：'],
  [36.96, 39.53, '把南极的冰，变成探测器。'],
  [39.63, 42.49, '冰下1450到2450米，'],
  [42.59, 45.75, '钻86个孔，挂上5160只"眼睛"。'],
  [45.90, 50.09, '一整立方公里的冰，2010年底完工。'],
  [50.19, 53.67, '中微子偶尔撞上冰里的原子，'],
  [53.77, 56.90, '会闪出一道微弱的蓝光。'],
  [57.05, 61.32, '2013年，第一次抓到太阳系外的中微子：'],
  [61.42, 65.69, '28个，能量是1987年超新星的百万倍。'],
  [65.79, 69.89, '2017年9月22日，又一个撞进冰里，'],
  [69.99, 73.60, '不到一分钟，警报传遍全球望远镜。'],
  [73.85, 77.34, '顺着方向找过去：40亿光年外，'],
  [77.44, 80.60, '一个喷流正对地球的黑洞。'],
  [82.00, 85.98, '2023年，它用中微子拍下了银河系。'],
  [86.08, 89.89, '人类多了一种看宇宙的方式，不靠光。'],
  [89.99, 92.80, '从提出到获奖：38年。'],
  [92.90, 96.60, '你愿意为一个想法，等38年吗？'],
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

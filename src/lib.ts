import music from './music.json';

/* 《筛子》: Berkson's paradox. Why the good-looking ones seem to have worse personalities: the negative correlation is
   made by the filter you look through. BGM only, subtitles burned in. Same music skeleton as 《最后一面》: music starts
   at track beat 16, the first drop (b32) lands on the title at 8.14 s, the second drop (b161) at 73.77 s. Every visual
   is a pure function of the global time T. */
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

/** subtitles (burned in; also written to .srt): [start, end, text]. Reading budget 0.5 + chars/7 + 0.6 s. */
export const SUBS: [number, number, string][] = [
  [0.10, 2.55, '好看的人，性格都差？'],
  [2.65, 5.40, '身边好像真是这样：'],
  [5.50, 8.05, '越好看的，越难相处。'],
  [10.25, 12.30, '先别急着下结论。'],
  [12.40, 15.15, '把一千个人，画在一张图上。'],
  [15.30, 18.30, '横轴是颜值，竖轴是性格。'],
  [18.40, 20.60, '每个点，是一个人。'],
  [20.70, 23.70, '颜值和性格，毫无关系。'],
  [23.80, 26.10, '但你不会全都去约。'],
  [26.20, 29.50, '两项加起来不够格的，直接划走。'],
  [29.60, 33.40, '剩下229人，相关系数变成-0.64。'],
  [33.70, 36.80, '不够好看的人，想留下来，'],
  [36.90, 40.20, '只能靠性格特别好。'],
  [40.30, 43.00, '又丑又坏的，你根本没见过。'],
  [43.10, 45.75, '不是人性，是你手里的筛子。'],
  [45.90, 49.40, '1946年，统计学家伯克森发现：'],
  [49.50, 52.50, '住院病人里，胆囊炎和糖尿病，'],
  [52.60, 54.60, '看起来有关系。'],
  [54.70, 57.50, '只因为病越多，越容易住院。'],
  [57.60, 60.90, '2020年，巴黎一家医院统计：'],
  [61.00, 64.60, '新冠住院病人里，每天抽烟的不到5%；'],
  [64.70, 67.40, '法国人整体，是四分之一。'],
  [67.50, 70.40, '于是有人说：尼古丁防新冠。'],
  [70.50, 73.60, '法国一度限购尼古丁产品。'],
  [73.85, 77.30, '后来证明：抽烟的人，更容易重症。'],
  [77.40, 80.40, '医院这道门，就是那个筛子。'],
  [82.00, 84.70, '巷子深处还没倒闭的小店，'],
  [84.80, 87.10, '多半是真好吃。'],
  [87.20, 90.00, '下次觉得"这个好，那个就差"，'],
  [90.10, 92.80, '先问：我看到的，被谁筛过？'],
  [92.90, 96.60, '你还见过哪种"此消彼长"？'],
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

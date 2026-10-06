import music from './music.json';

/* 《最后一面》: the "Last meeting theory" seen through maths and statistics. BGM only; the subtitles are delivered as
   an .srt for the owner's post-production (not burned in), so the lower band (y > 880) stays free of key content.
   Every visual is a pure function of the global time T. Music starts at track beat 16, so the first drop (b32) lands
   on the title at 8.14 s; chapter cuts sit on beats (fb). */
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

/** subtitles (for the .srt; not burned in): [start, end, text] */
export const SUBS: [number, number, string][] = [
  [0.10, 2.60, '有个理论火了：Last meeting theory'],
  [2.70, 5.40, '完成了彼此的课题，'],
  [5.50, 8.05, '宇宙保证你们再无重逢。'],
  [10.25, 12.30, '宇宙不管这件事。'],
  [12.40, 15.10, '但数学，可以把它算出来。'],
  [15.30, 18.30, '假设毕业后，每年见面的机会，'],
  [18.40, 20.60, '都比前一年少两成。'],
  [20.70, 23.70, '那这辈子剩下的见面，加起来——'],
  [23.80, 26.00, '期望只有5次。'],
  [26.20, 29.50, '而且你不会知道，哪一次是最后一次。'],
  [29.60, 33.30, '第10年起再也不见的概率，近六成。'],
  [33.70, 36.80, '荷兰研究者跟踪604人，整整7年。'],
  [36.90, 40.20, '7年后，能说心里话、能帮上忙的人，'],
  [40.30, 42.30, '只有48%还在。'],
  [42.35, 45.75, '很多关系结束，是因为没了见面的机会。'],
  [45.90, 49.60, '在美国，18岁的人每天和朋友待近2小时；'],
  [49.70, 52.20, '到30岁，只剩46分钟；'],
  [52.30, 54.30, '40岁，半小时。'],
  [54.40, 56.90, '不是不在乎，是见得太少。'],
  [57.10, 60.90, '英国一项研究，跟踪了刚上大学的学生18个月：'],
  [61.00, 64.50, '见面一少，和朋友的亲密度一路往下掉；'],
  [64.60, 67.10, '和家人的，却几乎没变。'],
  [67.20, 70.30, '友情比亲情，更需要见面来续命。'],
  [70.50, 73.60, '所以，这个理论才显得那么准——'],
  [73.85, 77.30, '几乎每一段关系，都会有一个最后一面。'],
  [77.40, 79.60, '它不需要宇宙安排，'],
  [79.70, 81.80, '只需要，不再约。'],
  [82.00, 84.00, '反过来也一样：'],
  [84.10, 87.20, '想再见一面，最可靠的不是缘分，'],
  [87.30, 89.10, '是现在就约。'],
  [89.30, 92.00, '发给那个很久没见的人。'],
  [92.30, 96.60, '你上一次见TA，是什么时候？'],
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

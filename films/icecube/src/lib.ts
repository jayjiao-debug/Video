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
export const FILM_END = fb(256) + 0.3; // ≈ 122.4 s
export const FILM_FRAMES = Math.round(FILM_END * FPS);
export const FILM_BEATS = B.map((b) => b - OFFSET).filter((t) => t >= 0 && t <= FILM_END);

// chapter cuts (on beats)
export const CUT = {
  title: fb(40), intro: fb(40), curve: fb(56), body: fb(80), pole: fb(96), dive: fb(112), cube: fb(128), rare: fb(144),
  drop: fb(161), blazar: fb(176), galaxy: fb(192), years: fb(224), end: fb(240),
};

/** subtitles (burned in; also written to .srt), timed by scripts/lines.py */
export const SUBS: [number, number, string][] = [
  [0.10, 3.52, '100多年来，宇宙一直在朝地球"开枪"。'],
  [3.62, 7.32, '有的"子弹"，能量是人类最强加速器的百万倍。'],
  [7.42, 9.83, '可没人知道，枪手在哪——'],
  [9.93, 12.05, '因为子弹会拐弯。'],
  [14.30, 17.00, '今年的诺贝尔物理学奖，'],
  [17.10, 20.25, '颁给了在南极冰下找"枪手"的人。'],
  [20.45, 23.40, '宇宙射线带电，被磁场一路掰弯，'],
  [23.50, 26.16, '落到地球，早就分不清方向。'],
  [26.26, 29.49, '但现场还会飞出一个"目击者"：中微子。'],
  [29.59, 32.40, '不带电，不拐弯，沿直线飞回来。'],
  [32.62, 35.37, '每秒100万亿个穿过你，'],
  [35.47, 38.36, '一辈子撞上你的概率：1/4。'],
  [38.46, 40.62, '要抓它，只能靠"大"。'],
  [40.80, 43.86, '1988年，哈尔岑想到：南极冰。'],
  [43.96, 46.72, '深处的冰被压得没有气泡，'],
  [46.82, 48.70, '清澈得惊人。'],
  [48.95, 51.86, '在冰下1.5到2.5公里，'],
  [51.96, 54.43, '挂上5160只"眼睛"，'],
  [54.53, 56.85, '2010年底完工。'],
  [57.10, 60.07, '中微子偶尔撞上冰里的原子，'],
  [60.17, 62.23, '闪出一道蓝光；'],
  [62.33, 65.00, '按光到的先后，算出来向。'],
  [65.25, 67.63, '每年几十亿次闪光里，'],
  [67.73, 70.83, '来自宇宙深处的，只占一亿分之一。'],
  [70.93, 73.60, '2013年，确认了第一批。'],
  [73.85, 77.74, '2017年9月22日，又一个撞进冰里，'],
  [77.84, 81.25, '不到一分钟，全球望远镜一起转头——'],
  [81.50, 84.50, '40亿光年外，一个黑洞的喷流，'],
  [84.60, 86.44, '正对着地球。'],
  [86.54, 89.40, '第一次，人类指认出一个"枪手"。'],
  [89.65, 93.52, '2023年，它用中微子拍下了银河系：'],
  [93.62, 97.17, '光被尘埃挡住的地方，它能穿过来。'],
  [97.27, 99.34, '这有什么用？'],
  [99.44, 102.17, '和第一台望远镜一样：'],
  [102.27, 105.65, '让人类看见以前看不见的东西。'],
  [105.95, 108.59, '从1988年的一个想法，'],
  [108.69, 111.34, '到今天的诺贝尔奖：38年。'],
  [111.44, 113.80, '那些眼睛，还在冰下等。'],
  [114.10, 121.90, '你愿意为一个想法，等38年吗？'],
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

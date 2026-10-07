import music from './music.json';
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

/* 《大脑的懒惰》: the owner's track, uncut from beat 16 (scripts/music.py). */
export const FPS = 30, W = 1920, H = 1080;
export const EV = music.events;
export const BEAT = music.beat;
export const FILM_END = EV.p5;                       // 113.63, a phrase boundary; the end card is its last 6.1 s
export const FILM_FRAMES = Math.round(FILM_END * FPS);

/** subtitles, timed by scripts/lines.py */
export const SUBS: [number, number, string][] = [
  [0.05, 2.45, 'A和B，是[同一个颜色]。'],
  [2.50, 5.15, '盯着B，我把周围[遮住]——'],
  [5.25, 7.95, 'B在变深——它{一像素没动}。'],
  [11.75, 15.40, '把阴影[拿开]：B一点没变，它本来就这么深。'],
  [15.50, 19.51, '这不是眼睛的错，是大脑的一种[省力策略]。'],
  [19.61, 23.46, '它先猜：B在阴影里，阴影会让东西变暗。'],
  [23.56, 26.60, '于是自动把B[调亮]了一档。'],
  [26.70, 30.35, '1867年，亥姆霍兹管这叫"[无意识推理]"：'],
  [30.45, 33.80, '你看到的不是光，是大脑对光的[推断]。'],
  [33.95, 36.27, '这原本是一项本领：'],
  [36.37, 40.45, '阴影里的白纸，读数少了一半，你看它依然是[白纸]。'],
  [40.90, 44.77, '2015年，一张裙子照片引发全网[争论]。'],
  [44.88, 49.22, '1401人里：57%看成蓝黑，30%看成[白金]。'],
  [49.32, 53.04, '以为在阴影里的人，扣除蓝光，看成[白金]；'],
  [53.14, 56.70, '以为在灯下的人，扣除黄光，看成[蓝黑]。'],
  [57.15, 60.83, '再看一组：这12个球，分别是什么颜色？'],
  [60.93, 63.22, '红、绿、蓝、紫、橙……对吧？'],
  [63.32, 66.38, '我们把每一个球，都取一次色——'],
  [66.48, 69.54, '第一个：215、199、174。'],
  [69.64, 72.70, '第二个，[一样]。第三个，还是一样……'],
  [73.10, 76.00, '12个球，全是[同一种米色]。'],
  [76.10, 79.00, '彩色的，只是前面那些细线。'],
  [79.10, 83.12, '2018年，工程学教授诺维克提出了这个错觉。'],
  [83.22, 86.80, '大脑处理形状很精细，处理颜色却很[节省]：'],
  [86.90, 89.90, '它会把旁边的颜色，借过来涂上。'],
  [90.00, 93.12, '你看到的世界，是大脑的[最佳推断]。'],
  [93.22, 95.62, '这种懒惰，其实是[效率]：'],
  [95.72, 99.70, '大多数时候推断得很准，所以你几乎从来没发现。'],
  [99.85, 103.10, '现在你知道A和B一样了。再看一眼——'],
  [103.20, 105.30, '它们还是{不一样}。'],
];

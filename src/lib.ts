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
  [11.75, 15.21, '把阴影[拿开]：B一点没变，它本来就这么深。'],
  [15.31, 18.64, '大脑不测量，它[猜]：B在阴影里，就该调亮。'],
  [18.74, 22.20, '1867年，亥姆霍兹称之为"[无意识推理]"。'],
  [22.55, 25.53, '这块玻璃，刚好盖住左边的桌面。'],
  [25.62, 28.60, '放得进右边那张桌子吗？押一个——'],
  [28.70, 30.40, '看好了——'],
  [30.55, 33.50, '{严丝合缝}，两块桌面一模一样。'],
  [33.60, 36.85, '不信？用两根手指比一比两条长边。'],
  [36.95, 40.50, '大脑默认它是立体的，自动按[透视]拉长。'],
  [40.90, 44.12, '黄蓝两块赛跑，谁先到终点？押一个——'],
  [44.22, 47.00, '看起来，你追我赶，[一步一停]。'],
  [48.90, 51.60, '{同时}撞线。它们一直是匀速。'],
  [51.70, 55.40, '拿掉条纹再跑一次：大脑靠边缘[对比]估速度。'],
  [57.15, 60.83, '再来一组：这12个球，分别是什么颜色？'],
  [60.93, 63.22, '红、绿、蓝、紫、橙……对吧？'],
  [63.32, 66.38, '我们把每一个球，都取一次色——'],
  [66.48, 69.54, '第一个：219、203、178。'],
  [69.64, 72.70, '第二个，[一样]。第三个，还是一样……'],
  [73.10, 76.00, '12个球，全是[同一种米色]。'],
  [76.10, 79.00, '彩色的，只是前面那些细线。'],
  [79.10, 82.90, '大脑处理颜色很[节省]：直接借旁边的。'],
  [83.30, 86.08, '这些斜条纹，明明在往{右}走。'],
  [86.18, 89.10, '用两根手指，把左右两边挡住——'],
  [89.30, 92.13, '只剩一条缝，它们就开始往[上]走。'],
  [92.23, 95.20, '信息不够，大脑就挑[最省事]的答案。'],
  [95.45, 98.65, '你看到的世界，是大脑[最省力]的猜测。'],
  [98.75, 101.25, '大多数时候，它都猜对了。'],
  [101.60, 104.05, '现在，再看一眼A和B——'],
  [104.15, 106.30, '它们还是{不一样}。'],
];

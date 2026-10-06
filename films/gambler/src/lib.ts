import edit from './edit.json';

/* 《大脑是个赌徒》 (demo). The music is the owner's track re-cut by scripts/edit_music.py to play three tricks on the
   listener's prediction: the first drop is taken away (silence), given back (title), and the big drop is delayed by an
   extra bar plus one beat of silence. Every visual is a pure function of T. Picture is a rough demo: the owner asked
   to judge the music control first. */
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const EV = edit.events;
export const BEATS: number[] = edit.beats;
export const FILM_END = EV.end;
export const FILM_FRAMES = Math.round(FILM_END * FPS);
export const BEAT = 60 / 117.94;
/** the most recent beat at or before T (or -1) */
export const lastBeat = (T: number) => { let b = -1; for (const x of BEATS) { if (x <= T) b = x; else break; } return b; };

/** subtitles, timed by scripts/lines.py (see scripts/lines.py) */
export const SUBS: [number, number, string][] = [
  [0.10, 2.97, '这首歌，马上要"炸"了。'],
  [3.07, 6.30, '你的大脑，已经押好了注——'],
  [6.40, 8.05, '3、2、1——'],
  [8.30, 10.05, '……没炸？'],
  [10.25, 13.53, '你愣住的那一下，就是大脑押空了。'],
  [13.63, 15.40, '再来一次。'],
  [19.70, 22.72, '听歌时，你的大脑一直在赌：'],
  [22.82, 25.84, '下一拍是什么？和弦往哪走？'],
  [25.94, 28.96, '猜对了，大脑就给你发奖励——'],
  [29.06, 32.40, '哪怕猜中的，只是最普通的一拍。'],
  [32.60, 34.89, '可全猜中，几遍就腻；'],
  [34.99, 37.43, '全猜不中，又成了噪音。'],
  [37.53, 41.43, '2019年，研究者分析了8万个流行歌和弦：'],
  [41.53, 43.82, '最上头的，是这两种：'],
  [43.92, 46.21, '很有把握，却被骗了；'],
  [46.31, 48.60, '毫无把握，却押中了。'],
  [49.00, 51.64, '那为什么，drop最爽？'],
  [51.74, 54.83, '一项研究扫描了听歌人的大脑：'],
  [54.93, 58.16, '高潮来之前，多巴胺已经开始分泌；'],
  [58.26, 60.90, '高潮那一刻，再分泌一次。'],
  [61.15, 64.45, '注意：这首歌，真的要drop了。'],
  [65.30, 69.14, '从这一秒起，你的大脑就在分泌多巴胺。'],
  [69.24, 73.08, '研究里，期待在高潮前十几秒就开始了。'],
  [73.18, 75.57, '这就是"等"的快乐。'],
  [75.67, 78.70, '那我们，让你再多等一会儿。'],
  [79.00, 80.83, '再等等……'],
  [80.93, 82.90, '多加了一小节。'],
  [85.00, 88.54, '你刚才经历的，就是那个实验。'],
  [88.64, 92.00, '等得越久，押中的时候越爽。'],
  [92.10, 94.65, '但每个人的"甜区"，不一样。'],
  [94.75, 98.44, '2025年，400多人听旋律，反复二选一：'],
  [98.54, 101.38, '有人偏爱好猜，有人偏爱意外——'],
  [101.48, 104.31, '爱听爵士的人，甜区更靠"意外"；'],
  [104.41, 107.10, '而这，和学没学过音乐无关。'],
  [107.30, 109.98, '所以，副歌要重复：让你押中。'],
  [110.08, 113.33, 'drop前停一下：让你多押一会儿。'],
  [113.43, 116.40, '你押注的依据，是听过的所有歌。'],
  [116.70, 120.20, '下次单曲循环，你的大脑还在赌。'],
  [120.60, 124.20, '你的甜区偏哪边：好猜，还是意外？'],
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

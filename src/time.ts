/* 《差一分钱》 timeline. Music: the channel track from 0 s. Beat k = 0.4058 + k·0.50625; phrase hits 0.402 · 8.505 ·
   16.603 · 32.806 · 49.008 (break, soft) · 65.206 (build) · 81.404 (drop) · 97.606 · 113.806 · 130.0.
   Lines are laid out by reading time (0.5 s + chars/7 + 0.6 s); each section starts on the next beat so the camera
   move that carries us there lands on it. Key reveals are nudged onto nearby downbeats, never stretched. */
export type Line = [number, number, string];
export const B = 0.50625;
export const bt = (k: number) => 0.4058 + k * B;
const nextBeat = (t: number) => bt(Math.ceil((t - 0.4058) / B - 1e-6));
const strip = (s: string) => s.replace(/[\[\]{}「」，。：？、""…—\s]/g, '');
export const need = (s: string) => Math.max(1.9, 0.5 + strip(s).length / 7 + 0.6);

type Spec = [string, string, number?];          // key, text, optional extra hold (a visual beat that needs time)
const L: Record<string, [number, number]> = {};
export const LINES: Line[] = [];
const run = (t0: number, specs: Spec[], gap = 0.14) => {
  let t = t0;
  for (const [k, s, extra] of specs) { const d = need(s) + (extra ?? 0); L[k] = [t, t + d]; LINES.push([t, t + d, s]); t += d + gap; }
  return t;
};

export const GLIDE = 4 * B;                       // every move between stations: 4 beats, after the last line has been read
const after = (tEnd: number) => nextBeat(tEnd + GLIDE - 0.45);
const section = (tEnd: number, anchor?: number) => {
  const s = after(tEnd);
  if (anchor === undefined) return s;
  if (s > anchor + 1e-3) console.warn(`section misses its hit ${anchor.toFixed(3)} by ${(s - anchor).toFixed(2)} s`);
  return Math.max(anchor, s);
};

// ---------------------------------------------------------------- cold open: the tag lands on the first hit, turns over on beat 2
export const FLIP = bt(2);                        // 1.418
export const PAIR = bt(6);                        // 3.443: the 10.00 tag slides in beside it, the felt-price columns rise
let t = run(1.15, [
  ['h1', '只便宜了一分钱'],
  ['h2', '为什么感觉便宜了一大截？'],
  ['h3', '你一定也被它骗过'],
]);
export const TITLE = bt(16);                     // 8.505, the second phrase hit
export const T_OUT = bt(24);                     // title card holds 4 s; the camera glides to the trays underneath it
// ---------------------------------------------------------------- 1 · what the brain does
const S1 = T_OUT;
export const GROOVE = bt(32);                    // 16.603: the groove comes in; the first digit lights up
t = run(S1 + 0.12, [
  ['a1', '读一个数，我们从左往右'],
  ['a2', '看到第一位，大脑就开始估大小'],
  ['a3', '9.99进了「9块多」，10.00进了「10块」', 0.4],
  ['a4', '一分钱，硬是被分进了[两个格子]'],
]);
// ---------------------------------------------------------------- 2 · is that stupid? no: a smart shortcut
const S2 = section(t);
t = run(S2 + 0.12, [
  ['b2', '笨吗？不，这其实是个[聪明的捷径]'],
  ['b3', '看79900：最左边的7，代表七万', 0.4],
  ['b4', '最后那个0，什么都不代表'],
  ['b5', '第一位，几乎就决定了一个数[有多大]'],
  ['b6', '所以只看第一位，平时几乎都对，还省力'],
]);
// ---------------------------------------------------------------- 3 · when does it fail? at the carry
const S3 = section(t);
t = run(S3 + 0.12, [
  ['c1', '那它什么时候会出错？'],
  ['c2', '偏偏在{进位}的那一刻'],
  ['c3', '79999再多1，第一位就从7跳成8', 0.2],
  ['c4', '数值几乎没变，判断却跳了一大格'],
  ['c5', '美国2200多万笔二手车交易记录里'],
  ['c6', '里程表每过一个整万英里，车价就{掉一截}'],
  ['c7', '79,900英里的车，比80,000英里的贵约200美元', 0.1],
  ['c8', '可79,800和79,900之间，只差约10美元'],
  ['c9', '卖家也懂：快到整万时，拍卖的车突然变多'],
]);
// ---------------------------------------------------------------- 4 · sellers stand at the cliff (lands on the drop)
export const DROP = bt(160);                     // 81.404, the biggest hit in the track
const S4 = section(t, DROP);
t = run(S4 + 0.12, [
  ['d1', '定价的人，就站在这道悬崖边上'],
  ['d2', '女装目录实验：同一条裙子，标三个价'],
  ['d3', '标39美元的，竟然比34美元的[卖得更多]'],
  ['d5', '39和34都算「30多」，贵的5块几乎感觉不到'],
]);
// ---------------------------------------------------------------- 5 · even the experts
const S5 = section(t, bt(192));                  // 97.606
t = run(S5 - 1.0, [                              // the question is asked while we travel
  ['e1', '那专业的人呢？'],
  ['e2', '2020年，研究者翻查了美国老人医保的数据'],
  ['e3', '同样是心脏病发作，在80岁生日前后住院'],
  ['e4', '生日前两周住院的：7.0%做了搭桥手术'],
  ['e5', '生日后两周住院的：只有{5.3%}'],
]);
export const SLAM80 = bt(224);                  // 113.806, a phrase hit: the words slam in here
if (t > SLAM80 + 0.05) console.warn('e5 runs past the slam');
t = run(Math.max(t, SLAM80), [
  ['e6', '只隔一个生日，就被归进了{「80多岁」}'],
  ['e7', '77到83岁的其他生日前后，都没有这个落差'],
]);
// ---------------------------------------------------------------- 6 · what to take home (back to the first tags)
const S6 = section(t);
t = run(S6 + 0.12, [
  ['f1', '大脑不是笨，是[太会省力]'],
  ['f2', '所以下次看到9.99'],
  ['f3', '先在心里，[把它读成10]', 0.6],
]);
export const END = nextBeat(t + 0.1);
export const FIN = END + 6.2;
export const FILM_FRAMES = Math.round(FIN * 30);
export const CUT = { S1, S2, S3, S4, S5, S6, TITLE, T_OUT, END, FIN };
export const at = (k: string) => L[k][0];
export const till = (k: string) => L[k][1];
export const near = (x: number) => bt(Math.round((x - 0.4058) / B));   // the beat closest to x

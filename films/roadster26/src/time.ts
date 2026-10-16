/* 《倒挂飞车》 timeline. Track: the owner's slowed track, 92.05 BPM (beat 0.6518 s, bar 2.607 s).
   Measured accents: 10.54 · 18.36 · 39.02 · 41.82 · 44.44 · 54.21 · 62.68 · 66.81 · 77.46 · 82.23.
   Quiet: 21.0–28.8 and 69.4–77.3. Lines follow the reading budget (0.5 s + chars/7 + 0.6 s, ≥ 1.9 s). */
export type Line = [number, number, string];
export const B = 0.6518;
export const bt = (k: number) => 0.12 + k * B;
const strip = (s: string) => s.replace(/[\[\]{}「」，。：？、""…—\s]/g, '');
export const need = (s: string) => Math.max(1.9, 0.5 + strip(s).length / 7 + 0.6);
const L = (a: number, s: string, z?: number): Line => [a, z ?? a + need(s), s];

export const HIT = { TITLE: 10.54, CEIL: 18.36, QUIET: 21.0, BACK: 28.8, ROLL: 39.02, BRAKE: 41.82, LAND: 44.44, JUMP: 54.21, DESC: 62.68, LAND2: 66.81, QUIET2: 69.4, Y2028: 77.46, END: 82.4 };
export const FIN = 89.8;
export const FILM_FRAMES = Math.round(FIN * 30);

export const LINES: Line[] = [
  L(0.3, '这辆车，正开上一面墙'),
  L(3.6, '倒过来了，它却没掉下来'),
  L(7.1, '还能飞起来，翻身落地'),
  // title 10.54
  L(15.1, '倒回去，看它怎么挂住的'),
  L(18.4, '车底有风扇，一直往外抽气'),
  // quiet: time stops
  L(21.4, '外面空气推它：约40吨'),
  L(24.1, '车只有约2吨'),
  L(26.2, '车底只要少约[5%]的空气'),
  // back to the groove: off the end, slowed down
  L(29.1, '车里塞满了高压气瓶'),
  L(31.6, '据特斯拉：10个喷口，600升空气'),
  L(35.0, '气往一边喷，车往反方向走'),
  L(38.4, '一侧喷气，车就翻过身来'),
  L(41.6, '往下喷，落地前刹一下'),
  // the jump
  L(45.2, '再来：前面停着一排车'),
  L(50.4, '看它怎么跳过去'),
  L(54.3, '往下喷，车就跳了起来'),
  L(57.0, '喷气推力，是抓地力的4–5倍'),
  L(60.2, '这是特斯拉自己的说法'),
  L(63.4, '往下喷着气，稳稳落地'),
  // quiet: the reality
  L(69.7, '一共三个版本'),
  L(71.8, '会飞的：单座、只邀请、不能上路'),
  L(74.8, '飞多高、飞多久：{没公布}'),
  L(77.5, '[2028年]才量产'),
  L(79.7, '最便宜一版，定金5万美元'),
];

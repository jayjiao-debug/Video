/* 《谁打来的？》 timeline (film seconds). Music: track 0–1.0 s, then silence under the WeChat ringtone, then the track
   resumes from its 16.603 s slam at film 4.6 s, so after the slam film t ↔ track t + 12.003.
   Phrase hits (checked by RMS): 20.803 (title) · 37.005 (break, soft) · 53.203 (build) · 69.401 (drop) · 85.603 · 101.803. */
export type Line = [number, number, string];
export const SLAM = 4.6, P0 = 1.0, B = 0.50625;
export const beat = (k: number) => SLAM + k * B;            // k-th beat after the slam (film time)
export const bt = (k: number) => 0.4058 + k * B;            // legacy (track time from 0)

const sn = (x: number) => Math.floor(x * 30 + 1e-6) / 30;   // a hit lands on the frame that contains it, never a frame late
export const CUT = {
  open: 0, p23: 15.2, dead23: beat(22), why: beat(27.5), title: sn(20.803), tOut: 24.05,
  draft: 24.05, live: beat(44), sixty: beat(56.5),
  breakA: 37.005, reasons: 40.1, land63: beat(72), notOver: beat(78), flap: beat(84), perDay: beat(90.5),
  build: sn(53.203), friend: 55.8, split: 58.7, predict: 61.5, chose: 64.7, result: 67.0,
  drop: sn(69.401), bond: 72.1, exp2: beat(139), bars: beat(147), timeSame: 82.4,
  coda: sn(85.603), good: 88.0, warm: beat(166), booked: beat(173), ask: 95.2, call: 98.8, callLand: beat(189),
  end: sn(101.803), fin: 107.8,
} as const;
export const FILM_FRAMES = Math.round((CUT.fin + 0.2) * 30);

// subtitles: [ ] gold = the answer / the warm side; { } magenta = the tightening (fear, scams, the wrong belief).
// The drop (69.4) has no subtitle: the slammed words carry it, as in the cold open.
export const LINES: Line[] = [
  [0.12, 1.6, '每天，你的大脑都在悄悄做一件事——'],
  [beat(7) - 0.05, beat(12) - 0.1, '第一反应：谁打来的？'],
  [beat(12) + 0.05, 15.05, '56%的英国年轻人：亲友突然来电，多半{没好事}'],
  [15.2, 18.42, '23%的年轻人，干脆从不接电话'],
  [beat(27.5), 20.7, '这到底是为什么？'],
  [24.1, 26.8, '发消息，你可以想好了再回'],
  [26.9, 30.0, '打电话，每一句都是现场直播'],
  [30.1, 33.1, '说错了撤不回，冷场了没处躲'],
  [33.25, 36.95, '比起来电，61%的年轻人更想收到消息'],
  [37.05, 40.0, '陌生号码一响，第一反应是：'],
  [40.1, 44.0, '不接电话的头号理由：怕是{骚扰或诈骗}'],
  [44.09, 47.05, '这不是想多了'],
  [47.17, 50.35, '2025年，拦截诈骗电话{36亿}次'],
  [50.45, 53.1, '平均每天，将近一千万通'],
  [53.25, 55.7, '心理学家做过一个实验'],
  [55.8, 58.6, '让人联系很久没聊的老朋友'],
  [58.7, 61.4, '一半打电话，一半写邮件'],
  [61.5, 64.6, '事前大家都以为，打电话{更尴尬}'],
  [64.7, 66.9, '所以更想写邮件'],
  [67.0, 69.3, '结果——'],
  [72.1, 74.87, '感情连接，也[确实更强]'],
  [74.97, 78.92, '另一个实验：陌生人打字、视频或语音聊天'],
  [79.02, 82.3, '比起打字，听到声音就更亲近'],
  [82.4, 85.55, '而且打电话，不比写邮件更费时'],
  [85.65, 87.9, '但同一份调查里'],
  [88.0, 92.13, '53%说：好消息不[打电话]告诉我，会不高兴'],
  [92.23, 95.1, '68%更喜欢[约好的电话]'],
  [95.2, 98.7, '所以想打给谁，先发一句：方便吗？'],
  [98.8, 101.6, '然后，[放心打过去]'],
];

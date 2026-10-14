/* 《谁打来的？》 timeline (film seconds). Music: track 0–1.0 s, then silence under the WeChat ringtone, then the track
   resumes from its 16.603 s slam at film 4.6 s, so after the slam film t ↔ track t + 12.003.
   Phrase hits (checked by RMS): 20.803 (title) · 37.005 (break, soft) · 53.203 (build) · 69.401 (drop) · 85.603 · 101.803. */
export type Line = [number, number, string];
export const SLAM = 4.6, P0 = 1.0, B = 0.50625;
export const beat = (k: number) => SLAM + k * B;            // k-th beat after the slam (film time)
export const bt = (k: number) => 0.4058 + k * B;            // legacy (track time from 0)

export const CUT = {
  open: 0, p23: 14.95, why: 18.5, title: 20.803, tOut: 24.05,
  draft: 24.05, live: 26.875, sixty: 33.15,
  breakA: 37.005, reasons: 40.1, land63: beat(73), notOver: 44.0, flap: 46.111, perDay: 50.1,
  build: 53.203, friend: 55.8, split: 58.7, predict: 61.5, chose: 64.7, result: 67.0,
  drop: 69.401, bond: 72.1, exp2: 74.8, bars: 78.8, timeSame: 82.5,
  coda: 85.603, good: 88.0, booked: 92.3, ask: 95.2, call: 98.8, callLand: beat(189),
  end: 101.803, fin: 107.8,
} as const;
export const FILM_FRAMES = Math.round((CUT.fin + 0.2) * 30);

// subtitles: [ ] gold = the answer / the warm side; { } magenta = the tightening (fear, scams, the wrong belief)
export const LINES: Line[] = [
  [0.12, 1.6, '每天，你的大脑都在悄悄做一件事——'],
  [beat(6) - 0.05, beat(12) - 0.1, '第一反应：谁打来的？'],
  [beat(12) + 0.05, 14.8, '56%的英国年轻人觉得：突然来电，多半{没好事}'],
  [14.95, 18.4, '23%的年轻人，干脆从不接电话'],
  [18.5, 20.7, '这到底是为什么？'],
  [24.1, 26.85, '发消息，你可以想好了再回'],
  [26.95, 30.0, '打电话，每一句都是现场直播'],
  [30.1, 33.05, '说错了撤不回，冷场了没处躲'],
  [33.2, 36.9, '比起通话，61%的年轻人更想发消息'],
  [37.05, 40.0, '陌生号码，更让人往坏处想'],
  [40.1, 43.9, '不接电话的头号理由：怕是{骚扰或诈骗}'],
  [44.0, 46.05, '这不是想多了'],
  [46.15, 50.0, '2025年，全国拦截诈骗电话{36亿}次'],
  [50.1, 53.1, '平均每天，将近一千万通'],
  [53.25, 55.7, '心理学家做过一个实验'],
  [55.8, 58.6, '让人联系很久没聊的老朋友'],
  [58.7, 61.4, '一半打电话，一半写邮件'],
  [61.5, 64.6, '事前大家都以为，打电话{更尴尬}'],
  [64.7, 66.9, '所以更想写邮件'],
  [67.0, 69.3, '结果——'],
  [69.45, 72.0, '打电话，[并没有更尴尬]'],
  [72.1, 74.7, '感情连接，反而[明显更强]'],
  [74.8, 78.7, '另一个实验：陌生人打字、视频或语音聊天'],
  [78.8, 82.4, '能听见声音就更亲近，看不见脸也一样'],
  [82.5, 85.5, '而且通话时长，跟写邮件差不多'],
  [85.65, 87.9, '但同一批年轻人里'],
  [88.0, 92.2, '53%说：好消息不打电话告诉我，会{不高兴}'],
  [92.3, 95.1, '68%更喜欢[约好的电话]'],
  [95.2, 98.7, '所以想打给谁，先发一句：方便吗？'],
  [98.8, 101.6, '然后，[放心打过去]'],
];

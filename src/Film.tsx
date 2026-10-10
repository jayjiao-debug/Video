/* 《你买的不是包》 full film, style A (金线装饰艺术), on the owner's track from 0:00 uncut
   (title hit 8.473 · break 49.17 · build 65.45 · drop 81.40), story ends on the bar line 116.33, end card to 122.43.
   One bag (with its gold price-tag charm) walks through every scene; scenes open on each other through a deco arch. */
import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { font } from './brand/lib';
import { JUNO } from './brand/identity';
import { Bag2D, Watch2D, Ring2D, Perfume2D, Lipstick2D, Heel2D, Grain, GOLD, GOLD_D, GOLD_L, INK } from './Flat';
import { Sunburst, Frame, Card, Glass, Flame, BG, VIOLET, UV } from './Deco';
import { prog, easeOut, easeInOut, backOut, clamp, lerp, Subtitles, Line } from './art';

export const FILM_END = 122.43, FILM_FRAMES = Math.round(FILM_END * 30);
const TITLE = 8.473, BREAK = 49.17, BUILD = 65.45, DROP = 81.4, STORY_END = 116.33;
const dimIn = (t: number, a: number, d = 0.35) => easeOut(prog(t, a, a + d));
/** a slam: big → settle, for numbers and titles landing on a hit */
const slam = (t: number, a: number) => (t < a ? 0 : 1 + 0.35 * Math.exp(-(t - a) / 0.07) * Math.cos((t - a) * 28));

export const LINES: Line[] = [
  { t: 0.45, end: 3.3, text: '代工厂交货价：53欧元。' },
  { t: 3.45, end: 5.85, text: '店里的标价：2600欧元。' },
  { t: 6.0, end: 8.35, text: '差了49倍。' },
  { t: 12.6, end: 16.3, text: '这个数字，来自2024年米兰法院的文件。' },
  { t: 16.45, end: 20.0, text: '迪奥的代工厂，一只包交货53欧元。' },
  { t: 20.15, end: 23.4, text: '多出来的2547欧元，买的是什么？' },
  { t: 23.6, end: 26.9, text: '先看门口：为什么要排队？' },
  { t: 27.05, end: 31.0, text: '有一种说法：我们想要的，常是别人想要的。' },
  { t: 31.2, end: 34.7, text: '再看等待：缺货、登记、排号。' },
  { t: 34.85, end: 38.55, text: '大脑里，“想要”和“喜欢”是两套系统。' },
  { t: 38.7, end: 42.4, text: '多巴胺最活跃，是在“快要得到”之前。' },
  { t: 42.55, end: 45.9, text: '等待本身，就是商品的一部分。' },
  { t: 46.05, end: 49.0, text: '然后，是价格。' },
  { t: 49.4, end: 53.2, text: '2008年，研究者请人在脑扫描仪里喝酒。' },
  { t: 53.35, end: 57.0, text: '同一种酒，一次标10美元，一次标90美元。' },
  { t: 57.15, end: 60.6, text: '人们说：90美元那杯，更好喝。' },
  { t: 60.75, end: 65.2, text: '大脑里负责愉悦的区域，也真的更活跃。' },
  { t: 65.6, end: 68.9, text: '可东西到手以后呢？' },
  { t: 69.05, end: 72.9, text: '那股劲很快就退了。这叫“享乐适应”。' },
  { t: 73.05, end: 76.0, text: '所以，品牌最怕的是打折。' },
  { t: 76.15, end: 81.2, text: '2018年，Burberry销毁了2860万英镑的存货。' },
  { t: 81.45, end: 84.55, text: '而另一边，是4670亿美元的假货。', gold: true },
  { t: 84.7, end: 88.35, text: '最常被仿的，是最大、最显眼的logo。' },
  { t: 88.5, end: 92.0, text: '真正的有钱人，反而偏爱看不出牌子的。' },
  { t: 92.15, end: 95.75, text: '假货越多，正品就越要涨价、越难买到。' },
  { t: 95.9, end: 99.5, text: '所以那2547欧元，买的不是皮。' },
  { t: 99.65, end: 103.55, text: '是排队、等待、价格，和给别人看的logo。' },
  { t: 103.7, end: 107.3, text: '是被设计出来的欲望。', gold: true },
];

/** a small source line, top-left, that stays still once it lands */
const Note: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; color?: string }> = ({ t, a, b, children, color = 'rgba(243,237,226,0.6)' }) => {
  const o = dimIn(t, a) * (1 - prog(t, b - 0.3, b)); if (o <= 0) return null;
  return <text x={110} y={128} fontFamily={font.sans} fontWeight={500} fontSize={24} fill={color} opacity={o}>{children}</text>;
};
/** the slow push every scene gets */
const Push: React.FC<{ t: number; t0: number; t1: number; k?: number; cx?: number; cy?: number; children: React.ReactNode }> = ({ t, t0, t1, k = 0.05, cx = 960, cy = 600, children }) => {
  const s = 1 + k * easeInOut(prog(t, t0, t1));
  return <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>;
};

/* ================================================================== 0 · hook: 53 → 2600 */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const on = dimIn(t, 0.334, 0.5), bag = backOut(prog(t, 0.334, 0.85)), dimRest = 1 - 0.75 * prog(t, 7.9, 8.4);
  const arrow = easeInOut(prog(t, 5.93, 6.44));
  return (
    <Push t={t} t0={0} t1={8.47} k={0.06} cy={700}>
      <rect width={1920} height={1080} fill={BG} />
      <g opacity={on} transform={`rotate(${t * 1.2} 960 1080)`}><Sunburst cx={960} cy={1080} r0={200} r1={1400} n={64} o={0.12} /></g>
      <g transform={`translate(0 ${(1 - bag) * 60})`} opacity={clamp(bag * 2)}><Bag2D x={960} y={800} s={1.25} look="A" id="h0" /></g>
      <g opacity={dimRest}>
        {t >= 0.45 && <g transform={`translate(420 470) scale(${slam(t, 0.45)})`}>
          <text textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={170} fill={INK}>€53</text>
          <text y={60} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={34} fill="rgba(243,237,226,0.7)">代工厂交货价</text></g>}
        {t >= 3.895 && <g transform={`translate(1500 470) scale(${slam(t, 3.895)})`}>
          <text textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={170} fill={GOLD}>€2,600</text>
          <text y={60} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={34} fill="rgba(241,197,109,0.85)">店里的标价</text></g>}
        {arrow > 0 && <path d="M 600 420 L 1290 420" stroke={GOLD} strokeWidth={3} strokeDasharray="10 10" pathLength={1} style={{ strokeDasharray: `${arrow} 1` }} />}
        {arrow > 0.98 && <path d="M 1270 404 L 1296 420 L 1270 436" fill="none" stroke={GOLD} strokeWidth={3} />}
        {t >= 6.439 && <g transform={`translate(945 395) scale(${slam(t, 6.439)})`}><text textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={72} fill={GOLD}>× 49</text></g>}
      </g>
    </Push>
  );
};

/* ================================================================== 1 · title: the bag in the arch */
const Title: React.FC<{ t: number }> = ({ t }) => {
  const arch = easeInOut(prog(t, TITLE, TITLE + 0.7)), card = prog(t, TITLE + 1.1, TITLE + 1.6);
  const swing = card > 0 ? -6 + 14 * Math.exp(-(t - TITLE - 1.1) * 1.6) * Math.cos((t - TITLE - 1.1) * 6) : 0;
  return (
    <Push t={t} t0={TITLE} t1={12.5} k={0.04} cx={1260} cy={600}>
      <rect width={1920} height={1080} fill={BG} />
      <g transform={`rotate(${(t - TITLE) * 1.5} 1260 640)`}><Sunburst cx={1260} cy={640} r0={120} r1={900} o={0.22 * dimIn(t, TITLE, 0.4)} /></g>
      <path d="M 1010 900 L 1010 420 A 250 250 0 0 1 1510 420 L 1510 900" fill="#120f0c" stroke={GOLD} strokeWidth={4} pathLength={1} strokeDasharray={`${arch} 1`} />
      <rect x={1080} y={740} width={360} height={160} fill="#16120e" stroke={GOLD} strokeWidth={3} />
      <rect x={1060} y={720} width={400} height={22} fill="#16120e" stroke={GOLD} strokeWidth={3} />
      <Bag2D x={1260} y={720} s={1.15} look="A" id="t1" />
      {card > 0 && <g opacity={card} transform={`translate(1440 ${lerp(600, 690, easeOut(card))}) rotate(${swing})`}><rect x={-54} y={-26} width={108} height={52} fill="#f1e8d6" stroke={GOLD} strokeWidth={2} /><text y={10} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={30} fill="#1d1a16">€ 2,600</text></g>}
      <g transform={`translate(150 430) scale(${slam(t, TITLE)})`}><text fontFamily={font.serif} fontWeight={900} fontSize={150} fill={GOLD}>你买的</text></g>
      <g transform={`translate(150 600) scale(${slam(t, TITLE + 0.509)})`}>{t >= TITLE + 0.509 && <text fontFamily={font.serif} fontWeight={900} fontSize={150} fill={GOLD}>不是包</text>}</g>
      <line x1={154} y1={650} x2={154 + 406 * easeOut(prog(t, TITLE + 0.9, TITLE + 1.4))} y2={650} stroke={GOLD} strokeWidth={2} />
      <text x={154} y={712} fontFamily={font.sans} fontWeight={700} fontSize={42} fill={INK} opacity={dimIn(t, TITLE + 1.2)}>多出来的2547欧元，买的是什么？</text>
      <text x={154} y={770} fontFamily="JunoMono, monospace" fontSize={22} letterSpacing="0.4em" fill={GOLD} opacity={0.8 * dimIn(t, TITLE + 1.5)}>— {JUNO.series} —</text>
    </Push>
  );
};

/* ================================================================== 2 · workshop: where the number comes from */
const Workshop: React.FC<{ t: number }> = ({ t }) => {
  const t0 = 12.45, bulb = t < t0 + 0.5 ? (Math.sin((t - t0) * 70) > 0 ? 1 : 0.3) * prog(t, t0, t0 + 0.1) : 1;
  const rays = easeOut(prog(t, t0 + 0.2, t0 + 1.2));
  const st = t - t0, swing = 8 + 10 * Math.exp(-st * 0.9) * Math.sin(st * 4.2);
  const flip = prog(t, 20.15, 20.55), face = flip < 0.5 ? 0 : 1, sx = Math.abs(Math.cos(flip * Math.PI));
  const rise = easeOut(prog(t, 20.5, 21.6));
  return (
    <Push t={t} t0={t0} t1={23.5} k={0.06} cy={680}>
      <rect width={1920} height={1080} fill="#0d0b08" />
      <line x1={980} y1={0} x2={980} y2={250} stroke={GOLD} strokeWidth={2} />
      <g opacity={rays * bulb}><Sunburst cx={980} cy={290} r0={70} r1={900} n={40} a0={Math.PI * 0.12} a1={Math.PI * 0.88} o={0.18} /></g>
      <circle cx={980} cy={290} r={34} fill={GOLD_L} opacity={0.25 + 0.75 * bulb} />
      <circle cx={980} cy={290} r={60} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.6 * bulb} />
      <path d="M 962 252 L 998 252 L 994 262 L 966 262 Z" fill={GOLD_D} />
      <rect x={180} y={800} width={1560} height={36} fill="#3a2716" stroke={GOLD} strokeWidth={3} />
      <rect x={240} y={836} width={40} height={244} fill="#2a1c10" stroke={GOLD} strokeWidth={2} />
      <rect x={1640} y={836} width={40} height={244} fill="#2a1c10" stroke={GOLD} strokeWidth={2} />
      {[[360, 760, '#6d1a20'], [470, 772, '#3d2418']].map(([x, y, c], i) => <g key={i}><rect x={(x as number) - 80} y={(y as number) - 30} width={160} height={60} rx={30} fill={c as string} stroke={GOLD} strokeWidth={2} /><ellipse cx={(x as number) + 80} cy={y as number} rx={14} ry={30} fill="#1a0a06" stroke={GOLD} strokeWidth={2} /></g>)}
      <rect x={1330} y={740} width={50} height={60} fill="#d8c8a0" stroke={GOLD} strokeWidth={2} /><rect x={1322} y={734} width={66} height={10} fill={GOLD_D} /><rect x={1322} y={796} width={66} height={8} fill={GOLD_D} />
      <g transform="translate(1450 790) rotate(-12)"><rect x={0} y={-8} width={90} height={16} rx={6} fill="#3a2a1a" stroke={GOLD} strokeWidth={1.5} /><path d="M 90 -3 L 150 0 L 90 3 Z" fill="#c9ccd2" /></g>
      <g transform="translate(560 788) rotate(8)"><rect x={0} y={-6} width={120} height={12} fill="#3a2a1a" stroke={GOLD} strokeWidth={1.5} /><rect x={110} y={-26} width={40} height={52} rx={6} fill="#4a3424" stroke={GOLD} strokeWidth={1.5} /></g>
      <Bag2D x={960} y={800} s={1.1} look="A" id="w2" tag={false} />
      {/* the paper tag swings on its string; at 20.15 it flips to the shop price */}
      <g transform={`translate(1046 548) rotate(${swing - 8})`}>
        <path d="M 0 0 Q 34 52 46 92" fill="none" stroke="#e8e0cc" strokeWidth={2} />
        <g transform={`translate(64 132) rotate(8) scale(${Math.max(0.02, sx)} 1)`}>
          {face === 0 ? <Card x={0} y={0} w={130} h={80} lines={[['€ 53', 46]]} /> : <Card x={0} y={0} w={170} h={80} lines={[['€ 2,600', 42]]} bg={GOLD_L} />}
        </g>
      </g>
      {rise > 0 && <text x={1180} y={lerp(560, 470, rise)} fontFamily={font.latin} fontWeight={700} fontSize={64} fill={GOLD} opacity={rise * (1 - prog(t, 23.0, 23.5))}>+ €2,547 ?</text>}
      <Note t={t} a={12.8} b={23.4}>据米兰法院 2024 年文件（路透社等报道）· 2025 年法院认可整改，提前解除托管</Note>
    </Push>
  );
};

/* ================================================================== 3 · the door: the queue */
const Door: React.FC<{ t: number }> = ({ t }) => {
  const t0 = 23.5, drift = (t - t0) * 7, gaze = easeOut(prog(t, 27.05, 28.2)), sway = Math.sin((t - t0) * 1.3) * 6;
  const heads = Array.from({ length: 14 }, (_, i) => { const depth = i / 13, s = 1 - depth * 0.6; return { i, depth, s, x: 420 + i * 82 + (i % 2) * 14 - drift * (1 - depth * 0.5), base: 880 - depth * 120 }; });
  const star = { x: 960, y: 230 };
  return (
    <Push t={t} t0={t0} t1={31.2} k={0.05} cy={560}>
      <rect width={1920} height={1080} fill={BG} />
      <rect x={360} y={140} width={1200} height={740} fill="#1a2238" />
      <Sunburst cx={960} cy={880} r0={100} r1={900} n={36} o={0.12} color="#9fb6e6" />
      <clipPath id="glass"><path d="M 362 1080 L 362 306 Q 362 142 526 142 L 1394 142 Q 1558 142 1558 306 L 1558 1080 Z" /></clipPath>
      <g clipPath="url(#glass)">
        {heads.map(({ i, depth, s, x, base }) => (
          <g key={i} transform={`translate(${x} ${base}) scale(${s})`} opacity={0.95 - depth * 0.45}>
            <ellipse cx={0} cy={-330} rx={26} ry={31} fill="#0a0c14" />
            <path d="M -62 -280 Q 0 -305 62 -280 L 70 -100 L 52 0 L -52 0 L -70 -100 Z" fill="#0a0c14" />
            <path d="M -62 -280 Q 0 -305 62 -280" fill="none" stroke="#9fb6e6" strokeWidth={2} opacity={0.6} />
          </g>))}
        {/* everyone's eyes on the same thing */}
        {gaze > 0 && heads.map(({ i, s, x, base }) => <line key={i} x1={x} y1={base - 330 * s} x2={lerp(x, star.x, gaze)} y2={lerp(base - 330 * s, star.y, gaze)} stroke={GOLD} strokeWidth={1.5} strokeDasharray="6 8" opacity={0.6} />)}
      </g>
      {gaze > 0 && <g transform={`translate(${star.x} ${star.y}) scale(${0.32 * backOut(gaze)})`}><circle r={150} fill="#1a1408" stroke={GOLD} strokeWidth={4} /><Bag2D x={0} y={95} s={0.9} look="A" id="d3" /></g>}
      <path d="M 340 1080 L 340 300 Q 340 120 520 120 L 1400 120 Q 1580 120 1580 300 L 1580 1080" fill="none" stroke={GOLD} strokeWidth={6} />
      <path d="M 960 120 L 960 1080" stroke={GOLD} strokeWidth={5} />
      <rect x={0} y={880} width={1920} height={200} fill="#0e0c0a" />
      <line x1={0} y1={880} x2={1920} y2={880} stroke={GOLD} strokeWidth={2} opacity={0.6} />
      {[600, 1320].map((x) => <g key={x}><rect x={x - 10} y={640} width={20} height={300} fill={GOLD} /><circle cx={x} cy={630} r={24} fill={GOLD_L} stroke={GOLD_D} strokeWidth={2} /><ellipse cx={x} cy={948} rx={70} ry={16} fill={GOLD} stroke={GOLD_D} strokeWidth={2} /></g>)}
      <path d={`M 600 650 Q 960 ${830 + sway} 1320 650`} fill="none" stroke="#7a0f1a" strokeWidth={22} strokeLinecap="round" />
      <path d={`M 600 644 Q 960 ${818 + sway} 1320 644`} fill="none" stroke="#c43a4a" strokeWidth={4} opacity={0.6} />
      <Note t={t} a={27.2} b={31.1}>"模仿欲望"：哲学家勒内·基拉尔提出的一种解释</Note>
    </Push>
  );
};

/* ================================================================== 4 · waiting: wanting is not liking */
const Waiting: React.FC<{ t: number }> = ({ t }) => {
  const t0 = 31.1, num = t < 32.9 ? 37 : t < 34.1 ? 36 : 35;
  const chart = dimIn(t, 34.85, 0.5), want = easeInOut(prog(t, 35.4, 38.4)), peak = dimIn(t, 38.7), fill = prog(t, 42.55, 44.5);
  const ticketOut = easeInOut(prog(t, 34.6, 35.2)), tag = prog(t, 46.05, 46.6), swing = tag > 0 ? 6 * Math.exp(-(t - 46.05) * 1.5) * Math.cos((t - 46.05) * 7) : 0;
  // the schematic curves: x from 0 (see it) to 1 (after you have it)
  const W = 700, H = 300, X = 1020, Y = 700;
  const wantY = (u: number) => (u < 0.72 ? Math.pow(u / 0.72, 1.8) : Math.max(0.15, 1 - (u - 0.72) * 3.2));
  const likeY = (u: number) => 0.32 * Math.exp(-Math.pow((u - 0.78) / 0.07, 2));
  const pts = (f: (u: number) => number, upto: number) => Array.from({ length: 81 }, (_, i) => i / 80).filter((u) => u <= upto).map((u) => `${X + u * W},${Y - f(u) * H}`).join(' ');
  return (
    <Push t={t} t0={t0} t1={49.2} k={0.04} cx={560} cy={600}>
      <rect width={1920} height={1080} fill={BG} />
      <Sunburst cx={560} cy={640} r0={120} r1={900} o={0.12} />
      <path d="M 310 900 L 310 420 A 250 250 0 0 1 810 420 L 810 900" fill="#120f0c" stroke={GOLD} strokeWidth={4} />
      <rect x={380} y={740} width={360} height={160} fill="#16120e" stroke={GOLD} strokeWidth={3} />
      <rect x={360} y={720} width={400} height={22} fill="#16120e" stroke={GOLD} strokeWidth={3} />
      <g transform="translate(560 720) scale(1.15)">
        <path d="M -142 0 Q -160 0 -158 -18 L -132 -202 Q -130 -220 -112 -220 L 112 -220 Q 130 -220 132 -202 L 158 -18 Q 160 0 142 0 Z" fill={GOLD} fillOpacity={0.18 * fill} stroke={GOLD} strokeWidth={2} strokeDasharray="10 8" strokeDashoffset={-(t - t0) * 12} opacity={0.6} />
        <path d="M -78 -224 C -78 -338, 78 -338, 78 -224" fill="none" stroke={GOLD} strokeWidth={2} strokeDasharray="10 8" strokeDashoffset={-(t - t0) * 12} opacity={0.6} />
      </g>
      <Card x={560} y={660} w={260} h={120} lines={[['暂时缺货', 44, font.serif], ['可登记等候', 28, font.sans]]} />
      {/* the waiting-list ticket, then the curves in its place */}
      {ticketOut < 1 && <g transform={`translate(${1440 + ticketOut * 700} 600) rotate(-7)`}>
        <rect x={-130} y={-180} width={260} height={360} fill="#f1e8d6" stroke={GOLD} strokeWidth={2} />
        <text y={-120} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill="#1d1a16">等候名单</text>
        <line x1={-100} y1={-96} x2={100} y2={-96} stroke="#1d1a16" strokeWidth={1.5} />
        <text y={20} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={130} fill="#7a1c22">{num}</text>
        <text y={80} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill="#1d1a16">{`您前面还有 ${num - 1} 位`}</text>
      </g>}
      {chart > 0 && <g opacity={chart}>
        <line x1={X} y1={Y} x2={X + W} y2={Y} stroke={INK} strokeWidth={2} opacity={0.6} />
        {[['看到', 0.05], ['排队', 0.3], ['等待', 0.55], ['到手', 0.78], ['之后', 0.97]].map(([w, u]) => <text key={w as string} x={X + (u as number) * W} y={Y + 44} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={28} fill="rgba(243,237,226,0.7)">{w}</text>)}
        <polyline points={pts(wantY, want)} fill="none" stroke={GOLD} strokeWidth={5} strokeLinejoin="round" />
        <polyline points={pts(likeY, want)} fill="none" stroke={INK} strokeWidth={3} opacity={0.7} />
        <text x={X + 20} y={Y - H - 20} fontFamily={font.sans} fontWeight={900} fontSize={34} fill={GOLD}>想要</text>
        <text x={X + 0.86 * W} y={Y - 0.32 * H - 14} fontFamily={font.sans} fontWeight={700} fontSize={28} fill="rgba(243,237,226,0.75)">喜欢</text>
        {peak > 0 && <g opacity={peak}><circle cx={X + 0.72 * W} cy={Y - H} r={12} fill={GOLD} /><text x={X + 0.72 * W} y={Y - H - 26} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={30} fill={GOLD}>最想要</text></g>}
        <text x={X + W} y={Y + 90} textAnchor="end" fontFamily={font.sans} fontSize={22} fill="rgba(243,237,226,0.45)">示意 · 据 Berridge 的"想要/喜欢"研究、Schultz 1997</text>
      </g>}
      {tag > 0 && <g transform={`translate(560 ${lerp(120, 300, easeOut(tag))}) rotate(${swing})`}><line x1={0} y1={-200} x2={0} y2={-30} stroke={GOLD} strokeWidth={2} /><Card x={0} y={0} w={180} h={64} lines={[['€ ? ? ?', 40]]} bg={GOLD_L} /></g>}
    </Push>
  );
};

/* ================================================================== 5 · the same wine (the quiet break) */
const Brain: React.FC<{ x: number; y: number; k: number; glow: number }> = ({ x, y, k, glow }) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <path d="M -90 20 C -110 -40 -60 -90 0 -86 C 60 -90 110 -40 90 20 C 80 50 40 56 0 50 C -40 56 -80 50 -90 20 Z" fill="#16120e" stroke={GOLD} strokeWidth={3} />
    <path d="M -50 -40 C -30 -20 -40 0 -20 10 M 20 -60 C 10 -30 40 -20 30 0 M -60 0 C -40 10 -50 30 -30 36" fill="none" stroke={GOLD} strokeWidth={2} opacity={0.4} />
    <circle cx={-34} cy={4} r={14 + 22 * glow} fill={GOLD_L} opacity={0.15 + 0.7 * glow} />
  </g>
);
const Wine: React.FC<{ t: number }> = ({ t }) => {
  const t0 = BREAK, draw = easeInOut(prog(t, 49.4, 50.6)), pour = easeInOut(prog(t, 50.6, 52.4));
  const tagA = dimIn(t, 53.35), tagB = dimIn(t, 54.4), burst = easeOut(prog(t, 57.15, 58.4)), brains = dimIn(t, 60.75, 0.5);
  return (
    <Push t={t} t0={t0} t1={65.5} k={0.03}>
      <rect width={1920} height={1080} fill={BG} />
      {[[620, false, tagA], [1300, true, tagB]].map(([x, warm, tg]) => (
        <g key={x as number}>
          {warm && burst > 0 && <g opacity={burst} transform={`rotate(${(t - 57) * 3} ${x} 540)`}><Sunburst cx={x as number} cy={540} r0={160} r1={160 + 360 * burst} n={40} a0={-Math.PI} a1={Math.PI} o={0.22} /></g>}
          <g transform={`translate(${x} 780)`}>
            <path d="M -110 -420 Q -120 -270 -40 -220 L -10 -200 L -10 -40 Q -10 -10 -80 0 L 80 0 Q 10 -10 10 -40 L 10 -200 L 40 -220 Q 120 -270 110 -420" fill="none" stroke={warm && burst > 0 ? GOLD : 'rgba(243,237,226,0.55)'} strokeWidth={4} pathLength={1} strokeDasharray={`${draw} 1`} />
            <clipPath id={`bowl${x}`}><rect x={-130} y={-222 - 108 * pour} width={260} height={108 * pour + 2} /></clipPath>
            <path d="M -114 -330 Q -110 -250 -40 -222 L 40 -222 Q 110 -250 114 -330 Z" fill={warm && burst > 0 ? '#9a1428' : '#5a0c18'} clipPath={`url(#bowl${x})`} />
          </g>
          {(tg as number) > 0 && <g opacity={tg as number} transform={`translate(0 ${(1 - (tg as number)) * -20})`}><Card x={x as number} y={850} w={170} h={70} lines={[[warm ? '$ 90' : '$ 10', 44]]} bg={warm ? '#f1e8d6' : '#9a9286'} /></g>}
          <Brain x={x as number} y={225} k={brains} glow={warm ? easeOut(prog(t, 61.2, 62.4)) : 0.1} />
        </g>))}
      <Note t={t} a={49.6} b={65.4}>Plassmann 等，2008，《美国国家科学院院刊》（PNAS） · 示意</Note>
    </Push>
  );
};

/* ================================================================== 6 · home: after you have it */
const Home: React.FC<{ t: number }> = ({ t }) => {
  const t0 = BUILD, drop = t < 65.6 ? 0 : backOut(prog(t, 65.6, 66.2)), fade = prog(t, 69.0, 72.8);
  return (
    <Push t={t} t0={t0} t1={73.1} k={0.06} cx={700} cy={700}>
      <rect width={1920} height={1080} fill="#0a0908" />
      <g opacity={1 - 0.85 * fade}><Sunburst cx={700} cy={760} r0={200} r1={900} n={40} o={0.16} /></g>
      <rect x={160} y={780} width={1600} height={30} fill="#2a1d12" stroke={GOLD} strokeWidth={2} opacity={0.8} />
      <rect x={1320} y={160} width={360} height={460} fill="#111a2e" stroke={GOLD} strokeWidth={3} opacity={0.9} />
      <line x1={1500} y1={160} x2={1500} y2={620} stroke={GOLD} strokeWidth={2} opacity={0.6} /><line x1={1320} y1={390} x2={1680} y2={390} stroke={GOLD} strokeWidth={2} opacity={0.6} />
      <circle cx={1600} cy={250} r={26} fill="#d8dce6" opacity={0.6} />
      <g transform="translate(1200 780)"><path d="M -150 0 L -150 -110 L 150 -110 L 150 0 Z" fill="#e9e1d2" stroke={GOLD} strokeWidth={2} /><path d="M -150 -110 L -120 -150 L 180 -150 L 150 -110 Z" fill="#cfc6b4" stroke={GOLD} strokeWidth={2} /><path d="M 150 0 L 180 -40 L 180 -150 L 150 -110 Z" fill="#b9b09e" stroke={GOLD} strokeWidth={2} /></g>
      <g transform="translate(1420 780) rotate(-8)"><rect x={-160} y={-24} width={320} height={24} fill="#e9e1d2" stroke={GOLD} strokeWidth={2} /></g>
      <g transform={`translate(0 ${(1 - drop) * -260})`} opacity={clamp(drop * 3)}><Bag2D x={700} y={780} s={1.0} look="A" id="h6" leather={fade > 0.5 ? '#5a161b' : '#7a1c22'} /></g>
      <g transform="translate(330 780)"><rect x={-8} y={-260} width={16} height={260} fill={GOLD_D} /><path d="M -90 -260 L 90 -260 L 60 -360 L -60 -360 Z" fill="#2a2016" stroke={GOLD} strokeWidth={2} /><ellipse cx={0} cy={-250} rx={70} ry={10} fill={GOLD_L} opacity={0.6 - 0.45 * fade} /></g>
      <rect width={1920} height={1080} fill="#000" opacity={0.35 * fade} />
    </Push>
  );
};

/* ================================================================== 7 · the unsold */
const Unsold: React.FC<{ t: number }> = ({ t }) => {
  const t0 = 73.0, fire = dimIn(t, 76.15, 0.6), count = easeOut(prog(t, 76.4, 78.6));
  const lower = easeInOut(prog(t, 73.2, 75.6));
  return (
    <Push t={t} t0={t0} t1={81.4} k={0.05} cy={700}>
      <rect width={1920} height={1080} fill="#0c0a09" />
      <g opacity={fire}><Sunburst cx={960} cy={900} r0={120} r1={1000} n={40} o={0.14} color="#e0782a" /></g>
      {/* "SALE" never goes up: a discount card drops toward the shop and is struck out */}
      <g opacity={1 - fire}>
        <g transform={`translate(960 ${lerp(200, 430, lower)}) rotate(-6)`}><rect x={-170} y={-60} width={340} height={120} fill="#c4303c" stroke={GOLD} strokeWidth={3} /><text y={22} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={70} fill="#fff">打 折</text></g>
        {t > 74.6 && <path d={`M 760 ${300 + 230 * lower} L ${760 + 400 * easeOut(prog(t, 74.6, 75.2))} ${560 - 0 * lower}`} stroke={GOLD} strokeWidth={14} strokeLinecap="round" />}
      </g>
      <rect x={420} y={140} width={1080} height={600} fill="#1e1d1c" stroke={GOLD} strokeWidth={3} opacity={fire} />
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={420} y1={170 + i * 30} x2={1500} y2={170 + i * 30} stroke="#3a3836" strokeWidth={6} opacity={fire} />)}
      <rect x={420} y={740} width={1080} height={160} fill="#2a1206" opacity={fire} />
      {fire > 0 && [600, 760, 900, 1040, 1180, 1320].map((x, i) => <g key={x} transform={`translate(0 ${0}) `}><g transform={`translate(${x} 900) scale(1 ${0.85 + 0.2 * Math.sin(t * (5 + i) + i * 2)}) translate(${-x} -900)`} opacity={fire}><Flame x={x} s={0.8 + (i % 3) * 0.25} /></g></g>)}
      <rect x={0} y={900} width={1920} height={180} fill="#0f0d0b" />
      <line x1={0} y1={900} x2={1920} y2={900} stroke={GOLD} strokeWidth={2} opacity={0.6} />
      {[[200, 900], [300, 900], [250, 790], [1620, 900], [1730, 900]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><rect x={-60} y={-110} width={120} height={110} fill="#e2d8c6" stroke={GOLD} strokeWidth={2} /><rect x={-60} y={-60} width={120} height={10} fill={GOLD} opacity={0.8} /></g>)}
      {count > 0 && <text x={960} y={112} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={72} fill={GOLD}>£ {Math.round(28600000 * count).toLocaleString('en-US')}</text>}
      <Note t={t} a={76.4} b={81.3}>Burberry 2017/18 财年年报 · 同年 9 月宣布停止销毁</Note>
    </Push>
  );
};

/* ================================================================== 8 · the fakes (the drop) */
const LogoPlate: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${k})`}><rect x={-110} y={-34} width={220} height={68} fill="none" stroke={GOLD_L} strokeWidth={4} /><text y={18} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={52} letterSpacing="0.3em" fill={GOLD_L}>LOGO</text></g>
);
const Fakes: React.FC<{ t: number }> = ({ t }) => {
  const t0 = DROP, flash = t < t0 + 0.4 ? Math.exp(-(t - t0) / 0.08) : 0, uv = prog(t, t0, t0 + 0.05);
  const logo = backOut(prog(t, 84.7, 85.3)), quiet = easeOut(prog(t, 88.5, 89.3)), up = easeOut(prog(t, 92.15, 92.8));
  const shift = 220 * quiet;
  return (
    <Push t={t} t0={t0} t1={95.9} k={0.05} cy={640}>
      <rect width={1920} height={1080} fill="#07050d" />
      <g opacity={uv}><Sunburst cx={960} cy={60} r0={60} r1={1200} n={40} a0={Math.PI * 0.15} a1={Math.PI * 0.85} o={0.16} color={VIOLET} /></g>
      <rect x={840} y={40} width={240} height={34} rx={6} fill="#c9b2ff" opacity={uv} /><rect x={830} y={30} width={260} height={14} fill="#2a2240" stroke={VIOLET} strokeWidth={2} />
      <rect x={0} y={860} width={1920} height={220} fill="#0d0a18" /><line x1={0} y1={860} x2={1920} y2={860} stroke={VIOLET} strokeWidth={2} opacity={0.6} />
      <Bag2D x={640 - shift} y={860} s={1.15} look="A" id="f8a" leather="#3a1a52" outline={VIOLET} stitch="#6a5a8a" />
      <Bag2D x={1280 - shift * 0.3} y={860} s={1.15} look="A" id="f8b" leather="#3a1a52" outline={VIOLET} stitch={UV} />
      <g transform={`translate(${1280 - shift * 0.3} 860) scale(1.15)`} style={{ filter: 'drop-shadow(0 0 8px #9ef0ff) drop-shadow(0 0 18px #6ad8ff)' }} opacity={uv}>
        <path d="M -126 -212 L -127 -150 Q -114 -100 0 -96 Q 114 -100 127 -150 L 126 -212" fill="none" stroke={UV} strokeWidth={3} strokeDasharray="7 6" />
      </g>
      <LogoPlate x={640 - shift} y={860 - 1.15 * 165} k={logo} />
      <LogoPlate x={1280 - shift * 0.3} y={860 - 1.15 * 165} k={logo} />
      <text x={640 - shift} y={912} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill="rgba(243,237,226,0.7)">正品</text>
      <text x={1280 - shift * 0.3} y={912} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill={UV}>仿品</text>
      {/* the quiet one: no plate, no shouting */}
      {quiet > 0 && <g opacity={quiet} transform={`translate(${lerp(2100, 1600, quiet)} 0)`}>
        <Bag2D x={0} y={860} s={0.95} look="A" id="f8c" leather="#1b2236" outline={GOLD} tag={false} />
        <text y={912} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill={GOLD}>看不出牌子</text></g>}
      {up > 0 && <g opacity={up}>
        <path d={`M ${640 - shift} 520 L ${640 - shift} 400`} stroke={GOLD} strokeWidth={6} /><path d={`M ${640 - shift - 22} 424 L ${640 - shift} 396 L ${640 - shift + 22} 424`} fill="none" stroke={GOLD} strokeWidth={6} />
        <text x={640 - shift + 40} y={440} fontFamily={font.sans} fontWeight={900} fontSize={40} fill={GOLD}>涨价 · 限购</text></g>}
      {t >= DROP + 0.05 && <g transform={`translate(960 ${200}) scale(${slam(t, DROP + 0.05)})`} opacity={1 - prog(t, 84.4, 84.7)}><text textAnchor="middle" fontFamily={font.serif} fontWeight={900} fontSize={110} fill={UV} style={{ filter: 'drop-shadow(0 0 16px #6ad8ff)' }}>4670亿美元</text></g>}
      <Note t={t} a={81.6} b={84.6} color="rgba(191,244,255,0.7)">OECD · 欧盟知识产权局 2025 年报告（2021 年全球假货贸易）</Note>
      <Note t={t} a={84.8} b={95.8} color="rgba(191,244,255,0.7)">Han, Nunes & Drèze, 2010,《Journal of Marketing》</Note>
      <rect width={1920} height={1080} fill="#efe6ff" opacity={0.7 * flash} />
    </Push>
  );
};

/* ================================================================== 9 · the reveal */
const Reveal: React.FC<{ t: number }> = ({ t }) => {
  const t0 = 95.85, base = 820, H = 560, k = H / 2600;
  const sliver = dimIn(t, 95.9), grow = easeInOut(prog(t, 99.65, 101.4)), gold = t >= 103.7;
  const hB = 2547 * k * grow, yA = base - 53 * k, yB = yA - hB;
  return (
    <Push t={t} t0={t0} t1={107.5} k={0.04} cx={1100}>
      <rect width={1920} height={1080} fill={BG} />
      <g transform={`rotate(${(t - t0) * 1.2} 1180 ${base})`} opacity={0.6 + 0.4 * (gold ? 1 : 0)}><Sunburst cx={1180} cy={base} r0={100} r1={1100} n={44} o={gold ? 0.18 : 0.1} /></g>
      <Bag2D x={560} y={base} s={1.3} look="A" id="r9" />
      <line x1={900} y1={base} x2={1700} y2={base} stroke={GOLD} strokeWidth={2} />
      <g opacity={sliver}>
        <rect x={1000} y={yA} width={220} height={53 * k} fill="#c9b9a0" />
        <text x={970} y={yA + 12} textAnchor="end" fontFamily={font.latin} fontWeight={700} fontSize={38} fill={INK}>€53</text>
        <text x={1250} y={base - 4} fontFamily={font.sans} fontWeight={700} fontSize={30} fill={INK}>皮 · 五金 · 工时（代工价）</text>
      </g>
      {grow > 0 && <g>
        <rect x={1000} y={yB} width={220} height={hB} fill={GOLD} />
        {grow > 0.6 && <text x={1110} y={yB + hB / 2 + 20} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={60} fill={BG} opacity={prog(grow, 0.6, 1)}>€2,547</text>}
        {['排队', '等待', '价格', 'logo'].map((w, i) => { const a = dimIn(t, 100.2 + i * 0.55); return <text key={w} x={1250} y={yB + 60 + i * 100} fontFamily={font.sans} fontWeight={900} fontSize={44} fill={GOLD} opacity={a}>{w}</text>; })}
        <text x={970} y={yB + 14} textAnchor="end" fontFamily={font.latin} fontWeight={700} fontSize={44} fill={GOLD} opacity={prog(grow, 0.9, 1)}>€2,600</text>
      </g>}
      {gold && <g transform={`translate(1110 200) scale(${slam(t, 103.7)})`}><text textAnchor="middle" fontFamily={font.serif} fontWeight={900} fontSize={66} fill={GOLD}>被设计出来的欲望</text></g>}
    </Push>
  );
};

/* ================================================================== 10 · three questions over the window display */
const QS: [string, string, number][] = [['①', '这是给谁看的？', 107.9], ['②', '没有 logo，我还想要吗？', 110.4], ['③', '一年后，它还让我开心吗？', 112.9]];
const Questions: React.FC<{ t: number }> = ({ t }) => {
  const t0 = 107.45, dim = dimIn(t, 107.6, 0.5), out = 1 - prog(t, 115.8, 116.3);
  return (
    <Push t={t} t0={t0} t1={116.4} k={0.03}>
      <rect width={1920} height={1080} fill={BG} />
      <g transform={`rotate(${(t - t0) * 1.5} 960 900)`}><Sunburst cx={960} cy={900} r0={200} r1={1100} n={60} o={0.14} /></g>
      {[[640, 1280, 760], [440, 1480, 860], [240, 1680, 960]].map(([x0, x1, y]) => <rect key={y} x={x0} y={y} width={x1 - x0} height={1080 - y} fill="#14110d" stroke={GOLD} strokeWidth={3} />)}
      <Bag2D x={960} y={760} s={1.05} look="A" id="q10" />
      <Perfume2D x={555} y={860} s={1.05} look="A" />
      <Watch2D x={1370} y={770} s={1.0} look="A" />
      <Ring2D x={370} y={960} s={1.15} look="A" />
      <Lipstick2D x={1560} y={960} s={1.15} />
      <Heel2D x={1110} y={860} s={1.0} look="A" />
      <rect width={1920} height={1080} fill="#030304" opacity={0.7 * dim} />
      <g opacity={dim * out}>
        <text x={960} y={250} textAnchor="middle" fontFamily={font.serif} fontWeight={900} fontSize={60} fill={GOLD}>买之前，问自己三个问题</text>
        {QS.map(([n, q, a], i) => { const k = easeOut(prog(t, a, a + 0.45)); return (
          <g key={n} opacity={k} transform={`translate(${420 + i * 540} ${560 + (1 - k) * 30})`}>
            <rect x={-240} y={-170} width={480} height={340} rx={20} fill="#0f0d0b" stroke={GOLD} strokeWidth={3} />
            <text y={-70} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={70} fill={GOLD}>{n}</text>
            {q.length > 8 ? <>
              <text y={20} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={46} fill={INK}>{q.slice(0, q.indexOf('，') + 1)}</text>
              <text y={86} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={46} fill={INK}>{q.slice(q.indexOf('，') + 1)}</text></>
              : <text y={50} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={50} fill={INK}>{q}</text>}
          </g>); })}
      </g>
    </Push>
  );
};

/* ================================================================== end card */
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const ring = easeInOut(prog(t, 0, 0.8)), f = (a: number) => easeOut(prog(t, a, a + 0.4));
  const goldText: React.CSSProperties = { backgroundImage: 'linear-gradient(180deg,#fbe3a6 0%,#f1c56d 55%,#c8913a 100%)', WebkitBackgroundClip: 'text', color: 'transparent' };
  return (
    <AbsoluteFill style={{ background: '#05060b' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 0.6 * f(0.6) }}><Sunburst cx={960} cy={1080} r0={300} r1={1400} n={64} o={0.1} /></svg>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={960} cy={110} r={46} fill="none" stroke={GOLD} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 110)" />
        <text x={960} y={130} textAnchor="middle" fontFamily={font.latin} fontStyle="italic" fontWeight={700} fontSize={64} fill={GOLD} opacity={f(0.4)}>J</text>
        <text x={960} y={182} textAnchor="middle" fontFamily="JunoMono, monospace" fontWeight={700} fontSize={18} letterSpacing="0.5em" fill={GOLD} opacity={0.8 * f(0.6)}>JUNO</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: font.serif, fontWeight: 900, fontSize: 120, opacity: f(0.5), ...goldText }}>《你买的不是包》</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 60, color: INK, opacity: f(1.0) }}>你买过最后悔的一件“贵东西”是什么？</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 530, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 34, color: 'rgba(243,237,226,0.62)', opacity: f(1.2) }}>评论区说说</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center', opacity: f(1.5) }}>
        <div style={{ padding: '12px 36px', borderRadius: 40, border: `2px solid ${GOLD}`, fontFamily: font.sans, fontWeight: 700, fontSize: 32, color: GOLD }}>{JUNO.follow}</div>
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 840, textAlign: 'center', fontFamily: font.sans, fontSize: 20, lineHeight: 1.7, color: 'rgba(243,237,226,0.42)', opacity: f(1.8) }}>
        资料：米兰法院 2024 年文件（路透社、The Fashion Law 报道）· Burberry 2017/18 年报 · OECD–EUIPO 2025 · Plassmann et al. 2008, PNAS · Berridge & Robinson 关于"想要/喜欢"的研究 · Schultz 1997, Science · Han, Nunes & Drèze 2010, Journal of Marketing · Girard《浪漫的谎言与小说的真实》
        <br />画面为代码绘制的示意；包与其他商品均为原创设计，不代表任何品牌
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== timeline */
type Sc = { t0: number; t1: number; C: React.FC<{ t: number }>; tr: number };
const SCENES: Sc[] = [
  { t0: 0, t1: TITLE, C: Hook, tr: 0 },
  { t0: TITLE, t1: 12.45, C: Title, tr: 0.35 },
  { t0: 12.45, t1: 23.5, C: Workshop, tr: 0.7 },
  { t0: 23.5, t1: 31.1, C: Door, tr: 0.7 },
  { t0: 31.1, t1: BREAK, C: Waiting, tr: 0.7 },
  { t0: BREAK, t1: BUILD, C: Wine, tr: 1.1 },
  { t0: BUILD, t1: 73.0, C: Home, tr: 0.5 },
  { t0: 73.0, t1: DROP, C: Unsold, tr: 0.6 },
  { t0: DROP, t1: 95.85, C: Fakes, tr: 0 },
  { t0: 95.85, t1: 107.45, C: Reveal, tr: 0.7 },
  { t0: 107.45, t1: STORY_END + 0.1, C: Questions, tr: 0.7 },
];
/** a deco arch that opens from the bottom centre to reveal the next scene; its gold edge rides the opening */
const archPath = (k: number) => { const a = 40 + 1400 * k, hs = 1.2 * a, ty = 1080 - hs; return `M ${960 - a} 1100 L ${960 - a} ${ty} A ${a} ${a} 0 0 1 ${960 + a} ${ty} L ${960 + a} 1100 Z`; };

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const i = SCENES.findIndex((s) => T >= s.t0 && T < s.t1);
  const cur = SCENES[i], prev = i > 0 ? SCENES[i - 1] : null;
  const k = cur && cur.tr > 0 ? easeInOut(prog(T, cur.t0, cur.t0 + cur.tr)) : 1;
  const markO = (T < TITLE - 0.2 || (T > 12.6 && T < STORY_END - 0.2)) ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format("woff2"); font-style: italic; }`}</style>
      {cur && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, fontVariantNumeric: 'lining-nums' }}>
          <defs><clipPath id="arch"><path d={archPath(k)} /></clipPath></defs>
          {prev && k < 1 && <prev.C t={T} />}
          <g clipPath={k < 1 ? 'url(#arch)' : undefined}><cur.C t={T} /></g>
          {k < 1 && k > 0 && <path d={archPath(k)} fill="none" stroke={GOLD} strokeWidth={6} />}
          <Frame />
        </svg>
      )}
      {T >= STORY_END && <EndCard t={T - STORY_END} />}
      <Grain f={f} o={0.05} />
      <Subtitles T={T} lines={LINES} />
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * markO, fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}><span style={{ color: GOLD }}>◆ </span>{JUNO.mark}</div>
    </AbsoluteFill>
  );
};

/* 《你买的不是包》 full film, style A (金线装饰艺术), on the owner's track from 0:00 uncut
   (title 8.473 · break 49.17 · build 65.45 · drop 81.40), ending on a bar line (122.43 s).
   One bag, our own design, with a gold price-tag charm, walks through every scene. */
import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { font } from './brand/lib';
import { JUNO } from './brand/identity';
import { Bag2D, Watch2D, Ring2D, Perfume2D, Lipstick2D, Heel2D, Grain, GOLD, GOLD_D, GOLD_L, INK } from './Flat';
import { Sunburst, Frame, Card, Flame, BG, VIOLET, UV } from './Deco';
import { prog, easeOut, easeInOut, backOut, clamp, lerp, Subtitles, Line } from './art';

export const FILM_END = 122.43, FILM_FRAMES = Math.round(FILM_END * 30);
const TITLE = 8.473, DROP = 81.4, END_CARD = 116.4;

export const LINES: Line[] = [
  { t: 0.45, end: 2.9, text: '这只包，出厂时53欧元。' },
  { t: 3.0, end: 5.75, text: '到了店里，标价2600欧元。' },
  { t: 5.9, end: 8.35, text: '中间，差了整整49倍。' },
  { t: 12.3, end: 15.85, text: '2024年，米兰法院公布了一份调查文件：' },
  { t: 15.95, end: 19.7, text: '迪奥的一款手袋，代工厂交货价约53欧元。' },
  { t: 19.8, end: 23.2, text: '店里，同款卖2600欧元以上。' },
  { t: 23.4, end: 26.3, text: '多出来的钱，买的是欲望。' },
  { t: 26.4, end: 29.3, text: '而欲望，是可以被设计的。' },
  { t: 29.5, end: 32.8, text: '第一步：门口限流，让人排队。' },
  { t: 32.95, end: 37.0, text: '我们想要的，往往是别人想要的东西。' },
  { t: 37.2, end: 40.5, text: '第二步：等候名单，让你买不到。' },
  { t: 40.65, end: 44.5, text: '大脑里，"想要"和"喜欢"是两套系统。' },
  { t: 44.65, end: 49.0, text: '多巴胺最活跃的时候，是"快要得到"之前。' },
  { t: 49.4, end: 53.1, text: '第三步：价格。2008年有个实验——' },
  { t: 53.25, end: 57.3, text: '同一瓶酒，一杯标10美元，一杯标90美元。' },
  { t: 57.45, end: 61.3, text: '标90美元的那杯，被评得更好喝；' },
  { t: 61.45, end: 65.3, text: '大脑里管愉悦的区域，也真的更活跃。' },
  { t: 65.6, end: 68.8, text: '可拿到手以后，那股劲很快就退了。' },
  { t: 68.95, end: 72.3, text: '心理学叫它：享乐适应。' },
  { t: 72.45, end: 76.2, text: '卖不掉的呢？宁可销毁，也不打折。' },
  { t: 76.35, end: 81.2, text: '2018年，博柏利销毁了2860万英镑的存货。' },
  { t: 81.45, end: 84.9, text: '全球假货贸易：4670亿美元。', gold: true },
  { t: 85.05, end: 88.6, text: '研究发现：大logo的款，最常被仿；' },
  { t: 88.75, end: 92.3, text: '最有钱的人，反而偏爱看不出牌子的款。' },
  { t: 92.45, end: 96.1, text: '所以，53欧元和2600欧元之间——' },
  { t: 96.25, end: 100.1, text: '是排队、等待、价格和logo，被设计出来的欲望。', gold: true },
  { t: 100.3, end: 104.2, text: '包、表、钻戒、香水，都是同一套设计。' },
  { t: 111.9, end: 113.9, text: '下次心动之前，' },
  { t: 114.0, end: 116.35, text: '先问问：这是谁的欲望？' },
];

/* ------------------------------------------------------------------ helpers */
const pop = (t: number, a: number, d = 0.35) => backOut(clamp((t - a) / d));
const fade = (t: number, a: number, d = 0.3) => easeOut(prog(t, a, a + d));
/** a slow push-in over a scene, centred (no float: one direction, eased) */
const Push: React.FC<{ T: number; a: number; b: number; k?: number; cx?: number; cy?: number; children: React.ReactNode }> = ({ T, a, b, k = 0.06, cx = 960, cy = 540, children }) => {
  const s = 1 + k * easeInOut(prog(T, a, b));
  return <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>{children}</g>;
};
/** the charm swings after the bag moves, then settles */
const swingAt = (T: number, kick: number, amp = 14) => { const d = T - kick; return d < 0 ? 0 : amp * Math.exp(-d * 1.6) * Math.sin(d * 7.5); };
const Num: React.FC<{ x: number; y: number; text: string; size: number; color: string; k: number; anchor?: 'start' | 'middle' | 'end' }> = ({ x, y, text, size, color, k, anchor = 'middle' }) =>
  k <= 0 ? null : <text x={x} y={y} textAnchor={anchor} fontFamily={font.latin} fontWeight={700} fontSize={size} fill={color} opacity={Math.min(1, k * 1.5)} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k}) translate(${-x} ${-y})`}>{text}</text>;
const Caption: React.FC<{ T: number; a: number; b: number; text: string; x?: number; y?: number; anchor?: 'start' | 'middle' | 'end' }> = ({ T, a, b, text, x = 1840, y: y0 = 150, anchor = 'end' }) => {
  const y = y0 < 150 ? 150 : y0;
  const o = fade(T, a) * (1 - prog(T, b - 0.3, b)); if (o <= 0) return null;
  return <text x={x} y={y} textAnchor={anchor} fontFamily={font.sans} fontWeight={500} fontSize={26} fill="rgba(243,237,226,0.6)" opacity={o}>{text}</text>;
};

/* ------------------------------------------------------------------ scenes (T is film time) */
const Hook: React.FC<{ T: number }> = ({ T }) => {
  const on = easeOut(prog(T, 0.33, 0.6));
  const arrow = easeInOut(prog(T, 2.37, 2.877));
  return (
    <Push T={T} a={0} b={8.6} k={0.05}>
      <rect width={1920} height={1080} fill={BG} />
      <g opacity={on}><Sunburst cx={960} cy={1080} r0={200} r1={lerp(400, 1300, on)} n={64} o={0.12} /></g>
      <g opacity={on} transform={`translate(0 ${(1 - on) * 30})`}><Bag2D x={960} y={800} s={1.25} look="A" id="h" swing={swingAt(T, 0.4)} /></g>
      <Num x={420} y={470} text="€53" size={170} color={INK} k={pop(T, 0.45)} />
      <text x={420} y={530} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={34} fill="rgba(243,237,226,0.7)" opacity={fade(T, 0.7)}>代工厂交货价</text>
      <path d="M 600 420 L 1290 420" stroke={GOLD} strokeWidth={3} strokeDasharray="10 10" pathLength={1} style={{ strokeDasharray: `${arrow} 1` }} />
      {arrow > 0.98 && <path d="M 1270 404 L 1296 420 L 1270 436" fill="none" stroke={GOLD} strokeWidth={3} />}
      <Num x={1500} y={470} text="€2,600" size={170} color={GOLD} k={pop(T, 2.877)} />
      <text x={1500} y={530} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={34} fill="rgba(241,197,109,0.85)" opacity={fade(T, 3.1)}>店里的标价</text>
      <Num x={945} y={390} text="× 49" size={72} color={GOLD} k={pop(T, 5.93, 0.25)} />
    </Push>
  );
};

/** the arch case: used for the title, the "designed" beat, and the callback */
const Vitrine: React.FC<{ T: number; a: number; title?: boolean; blueprint?: number; lights?: number }> = ({ T, a, title, blueprint = 0, lights = 1 }) => (
  <Push T={T} a={a} b={a + 6} k={0.04} cx={1260} cy={600}>
    <rect width={1920} height={1080} fill={BG} />
    <g opacity={lights}><Sunburst cx={1260} cy={640} r0={120} r1={760} o={0.22} /></g>
    <path d="M 1010 900 L 1010 420 A 250 250 0 0 1 1510 420 L 1510 900" fill="#120f0c" stroke={GOLD} strokeWidth={4} opacity={0.4 + 0.6 * lights} />
    <path d="M 1030 900 L 1030 420 A 230 230 0 0 1 1490 420 L 1490 900" fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.6 * lights} />
    <rect x={1080} y={740} width={360} height={160} fill="#16120e" stroke={GOLD} strokeWidth={3} opacity={0.4 + 0.6 * lights} />
    <rect x={1060} y={720} width={400} height={22} fill="#16120e" stroke={GOLD} strokeWidth={3} opacity={0.4 + 0.6 * lights} />
    {/* the spot from above */}
    <polygon points="1200,0 1320,0 1460,720 1060,720" fill={GOLD_L} opacity={0.06 * lights} />
    <g opacity={0.25 + 0.75 * lights}><Bag2D x={1260} y={720} s={1.15} look="A" id={`v${a}`} swing={swingAt(T, a + 0.2, 10)} /></g>
    {lights > 0.5 && <g transform="translate(1440 690) rotate(-6)"><rect x={-54} y={-26} width={108} height={52} fill="#f1e8d6" stroke={GOLD} strokeWidth={2} /><text y={10} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={30} fill="#1d1a16">€ 2,600</text></g>}
    {/* the designer's construction lines: desire is drawn on purpose */}
    {blueprint > 0 && <g fill="none" stroke={GOLD_L} strokeWidth={1.6} opacity={0.85}>
      <circle cx={1260} cy={500} r={210} pathLength={1} strokeDasharray={`${blueprint} 1`} />
      <path d="M 1050 720 L 1470 720 M 1076 500 L 1444 500 M 1260 230 L 1260 760" pathLength={1} strokeDasharray={`${blueprint} 1`} strokeDashoffset={0} />
      <path d="M 1076 740 L 1076 780 M 1444 740 L 1444 780 M 1076 770 L 1444 770" pathLength={1} strokeDasharray={`${blueprint} 1`} />
      <text x={1260} y={800} textAnchor="middle" fontFamily={font.latin} fontSize={26} fill={GOLD_L} stroke="none" opacity={blueprint}>368 mm</text>
      <text x={1480} y={496} fontFamily={font.latin} fontSize={26} fill={GOLD_L} stroke="none" opacity={blueprint}>R 210</text>
    </g>}
    {title && <TitleCard T={T} />}
  </Push>
);

const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  const chars = [...'你买的不是包'];
  return (
    <g>
      {chars.map((c, i) => { const row = i < 3 ? 0 : 1, col = i % 3, k = pop(T, TITLE + (i < 3 ? 0 : 0.26) + col * 0.05, 0.22); return (
        <text key={i} x={150 + col * 150 + 75} y={430 + row * 170} textAnchor="middle" fontFamily={font.serif} fontWeight={900} fontSize={150} fill={GOLD} opacity={Math.min(1, k * 1.4)} transform={`translate(${225 + col * 150} ${380 + row * 170}) scale(${0.7 + 0.3 * k}) translate(${-(225 + col * 150)} ${-(380 + row * 170)})`}>{c}</text>); })}
      <line x1={154} y1={650} x2={154 + 406 * easeOut(prog(T, TITLE + 0.5, TITLE + 0.9))} y2={650} stroke={GOLD} strokeWidth={2} />
      <text x={154} y={712} fontFamily={font.sans} fontWeight={700} fontSize={42} fill={INK} opacity={fade(T, TITLE + 0.7)}>53欧元的包，凭什么卖2600？</text>
      <text x={154} y={770} fontFamily="JunoMono, monospace" fontSize={22} letterSpacing="0.4em" fill={GOLD} opacity={0.8 * fade(T, TITLE + 1.0)}>— {JUNO.series} —</text>
    </g>
  );
};

const Workshop: React.FC<{ T: number }> = ({ T }) => {
  const flick = 0.9 + 0.1 * Math.sin(T * 23) * Math.sin(T * 7.3);
  const tagSwing = swingAt(T, 12.2, 8) + 3 * Math.sin(T * 1.3);
  return (
    <Push T={T} a={12} b={23.5} k={0.07} cx={980} cy={600}>
      <rect width={1920} height={1080} fill="#0d0b08" />
      <line x1={980} y1={0} x2={980} y2={250} stroke={GOLD} strokeWidth={2} />
      <g opacity={flick}><Sunburst cx={980} cy={290} r0={70} r1={900} n={40} a0={Math.PI * 0.12} a1={Math.PI * 0.88} o={0.18} /></g>
      <circle cx={980} cy={290} r={34} fill={GOLD_L} opacity={flick} />
      <circle cx={980} cy={290} r={60} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.6} />
      <path d="M 962 252 L 998 252 L 994 262 L 966 262 Z" fill={GOLD_D} />
      <rect x={180} y={800} width={1560} height={36} fill="#3a2716" stroke={GOLD} strokeWidth={3} />
      <rect x={240} y={836} width={40} height={244} fill="#2a1c10" stroke={GOLD} strokeWidth={2} />
      <rect x={1640} y={836} width={40} height={244} fill="#2a1c10" stroke={GOLD} strokeWidth={2} />
      {[[360, 760, '#6d1a20'], [470, 772, '#3d2418']].map(([x, y, c], i) => <g key={i}><rect x={(x as number) - 80} y={(y as number) - 30} width={160} height={60} rx={30} fill={c as string} stroke={GOLD} strokeWidth={2} /><ellipse cx={(x as number) + 80} cy={y as number} rx={14} ry={30} fill="#1a0a06" stroke={GOLD} strokeWidth={2} /></g>)}
      <rect x={1330} y={740} width={50} height={60} fill="#d8c8a0" stroke={GOLD} strokeWidth={2} /><rect x={1322} y={734} width={66} height={10} fill={GOLD_D} /><rect x={1322} y={796} width={66} height={8} fill={GOLD_D} />
      <g transform="translate(1450 790) rotate(-12)"><rect x={0} y={-8} width={90} height={16} rx={6} fill="#3a2a1a" stroke={GOLD} strokeWidth={1.5} /><path d="M 90 -3 L 150 0 L 90 3 Z" fill="#c9ccd2" /></g>
      <Bag2D x={960} y={800} s={1.1} look="A" id="w" tag={false} />
      <g transform={`rotate(${tagSwing} 1046 548)`}>
        <path d="M 1046 548 Q 1080 600 1092 640" fill="none" stroke="#e8e0cc" strokeWidth={2} />
        <Card x={1110} y={680} w={130} h={80} rot={8} lines={[['€ 53', 46]]} />
      </g>
      {/* the court file slides in, then the shop price lands next to it */}
      <g opacity={fade(T, 12.4, 0.4)} transform={`translate(${lerp(-60, 0, fade(T, 12.4, 0.5))} 0)`}>
        <rect x={190} y={200} width={360} height={440} fill="#efe6d2" stroke={GOLD} strokeWidth={2} transform="rotate(-4 370 420)" />
        <g transform="rotate(-4 370 420)">
          <text x={370} y={262} textAnchor="middle" fontFamily={font.serif} fontWeight={900} fontSize={34} fill="#1d1a16">米兰法院 · 2024</text>
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={226} y={300 + i * 34} width={i % 3 === 2 ? 200 : 288} height={10} fill="#1d1a16" opacity={0.18} />)}
          <rect x={226} y={300 + 4 * 34 - 6} width={288} height={24} fill={GOLD} opacity={0.35 * fade(T, 16.0)} />
          <text x={370} y={612} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={40} fill="#7a1c22" opacity={fade(T, 16.0)}>€ 53 / 只</text>
        </g>
      </g>
      <g transform={`translate(1500 470) rotate(-6) scale(${pop(T, 19.8)})`} opacity={clamp(pop(T, 19.8) * 1.4)}>
        <rect x={-120} y={-50} width={240} height={100} fill="#f1e8d6" stroke={GOLD} strokeWidth={3} />
        <text y={18} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={54} fill="#1d1a16">€ 2,600+</text>
      </g>
      <Caption T={T} a={16.4} b={23.4} text="注：该子公司整改后，2025年法院解除了托管" x={1840} y={110} />
    </Push>
  );
};

const Door: React.FC<{ T: number }> = ({ T }) => (
  <Push T={T} a={29.4} b={37.4} k={0.05} cx={960} cy={700}>
    <rect width={1920} height={1080} fill={BG} />
    <rect x={360} y={140} width={1200} height={740} fill="#1a2238" />
    <Sunburst cx={960} cy={880} r0={100} r1={900} n={36} o={0.12} color="#9fb6e6" />
    {/* the line grows: people join one by one, from the far end (presence only, nobody moves) */}
    {Array.from({ length: 16 }, (_, i) => {
      const depth = i / 15, s = 1 - depth * 0.6, x = 400 + i * 74 + (i % 2) * 14, base = 880 - depth * 120;
      const k = fade(T, 29.5 + (15 - i) * 0.22 + (i % 3) * 0.07, 0.5);
      return k <= 0 ? null : (
        <g key={i} transform={`translate(${x} ${base}) scale(${s})`} opacity={k * (0.95 - depth * 0.45)}>
          <ellipse cx={0} cy={-330} rx={26} ry={31} fill="#0a0c14" />
          <path d="M -62 -280 Q 0 -305 62 -280 L 70 -100 L 52 0 L -52 0 L -70 -100 Z" fill="#0a0c14" />
          <path d="M -62 -280 Q 0 -305 62 -280" fill="none" stroke="#9fb6e6" strokeWidth={2} opacity={0.6} />
        </g>);
    })}
    <path d="M 340 1080 L 340 300 Q 340 120 520 120 L 1400 120 Q 1580 120 1580 300 L 1580 1080" fill="none" stroke={GOLD} strokeWidth={6} />
    <path d="M 960 120 L 960 1080" stroke={GOLD} strokeWidth={5} />
    <rect x={0} y={880} width={1920} height={200} fill="#0e0c0a" />
    <line x1={0} y1={880} x2={1920} y2={880} stroke={GOLD} strokeWidth={2} opacity={0.6} />
    {[600, 1320].map((x) => <g key={x}><rect x={x - 10} y={640} width={20} height={300} fill={GOLD} /><circle cx={x} cy={630} r={24} fill={GOLD_L} stroke={GOLD_D} strokeWidth={2} /><ellipse cx={x} cy={948} rx={70} ry={16} fill={GOLD} stroke={GOLD_D} strokeWidth={2} /></g>)}
    {(() => { const sag = 180 + 6 * Math.sin(T * 1.7); return <><path d={`M 600 650 Q 960 ${650 + sag} 1320 650`} fill="none" stroke="#7a0f1a" strokeWidth={22} strokeLinecap="round" /><path d={`M 600 644 Q 960 ${638 + sag} 1320 644`} fill="none" stroke="#c43a4a" strokeWidth={4} opacity={0.6} /></>; })()}
    <Caption T={T} a={33.2} b={37.3} text="一种解释：模仿欲望（勒内·基拉尔）" y={110} />
  </Push>
);

const Waiting: React.FC<{ T: number }> = ({ T }) => {
  const card = pop(T, 37.4, 0.4), graph = easeOut(prog(T, 40.7, 41.4)), curve = easeInOut(prog(T, 44.7, 46.4));
  const n = T < 41 ? 37 : Math.max(36, 37 - Math.floor((T - 41) * 0.5));
  // wanting rises toward the moment of getting and falls after it
  const pts = Array.from({ length: 61 }, (_, i) => { const u = i / 60, x = 1240 + u * 520; const y = 760 - 300 * (u < 0.62 ? Math.pow(u / 0.62, 2.2) : Math.exp(-(u - 0.62) * 9)); return `${x.toFixed(1)},${y.toFixed(1)}`; });
  return (
    <Push T={T} a={37.2} b={49.2} k={0.05} cx={960} cy={560}>
      <rect width={1920} height={1080} fill={BG} />
      <Sunburst cx={760} cy={640} r0={120} r1={900} o={0.1} />
      <path d="M 510 900 L 510 420 A 250 250 0 0 1 1010 420 L 1010 900" fill="#120f0c" stroke={GOLD} strokeWidth={4} />
      <rect x={580} y={740} width={360} height={160} fill="#16120e" stroke={GOLD} strokeWidth={3} />
      <rect x={560} y={720} width={400} height={22} fill="#16120e" stroke={GOLD} strokeWidth={3} />
      <g transform="translate(760 720) scale(1.15)" opacity={0.5}><path d="M -142 0 Q -160 0 -158 -18 L -132 -202 Q -130 -220 -112 -220 L 112 -220 Q 130 -220 132 -202 L 158 -18 Q 160 0 142 0 Z" fill="none" stroke={GOLD} strokeWidth={2} strokeDasharray="10 8" /><path d="M -78 -224 C -78 -338, 78 -338, 78 -224" fill="none" stroke={GOLD} strokeWidth={2} strokeDasharray="10 8" /></g>
      <g transform={`translate(0 ${(1 - card) * -60})`} opacity={clamp(card * 1.4)}><Card x={760} y={660} w={260} h={120} lines={[['暂时缺货', 44, font.serif], ['可登记等候', 28, font.sans]]} /></g>
      {/* the ticket, then the graph of wanting */}
      <g opacity={fade(T, 38.2) * (1 - graph)} transform="translate(1440 560) rotate(-7)">
        <rect x={-130} y={-180} width={260} height={360} fill="#f1e8d6" stroke={GOLD} strokeWidth={2} />
        <text y={-120} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill="#1d1a16">等候名单</text>
        <line x1={-100} y1={-96} x2={100} y2={-96} stroke="#1d1a16" strokeWidth={1.5} />
        <text y={20} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={130} fill="#7a1c22">{n}</text>
        <text y={80} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill="#1d1a16">您前面还有 {n - 1} 位</text>
      </g>
      <g opacity={graph}>
        <rect x={1180} y={360} width={640} height={480} fill="#120f0c" stroke={GOLD} strokeWidth={2} />
        <line x1={1240} y1={780} x2={1780} y2={780} stroke={INK} strokeWidth={2} opacity={0.6} />
        <text x={1240} y={410} fontFamily={font.sans} fontWeight={700} fontSize={30} fill={GOLD}>"想要"的强度</text>
        <text x={1780} y={820} textAnchor="end" fontFamily={font.sans} fontWeight={500} fontSize={24} fill="rgba(243,237,226,0.6)">时间 →</text>
        <line x1={1240 + 0.62 * 520} y1={440} x2={1240 + 0.62 * 520} y2={780} stroke={INK} strokeWidth={2} strokeDasharray="8 8" opacity={0.6} />
        <text x={1240 + 0.62 * 520} y={810} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={24} fill={INK}>拿到</text>
        <polyline points={pts.join(' ')} fill="none" stroke={GOLD} strokeWidth={5} pathLength={1} style={{ strokeDasharray: `${curve} 1` }} />
        {curve > 0.55 && <text x={1240 + 0.5 * 520} y={448} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={26} fill={GOLD_L} opacity={fade(T, 45.6)}>最强：快要得到</text>}
      </g>
      <Caption T={T} a={40.8} b={49.0} text="据 Berridge 等；Schultz 等的多巴胺研究" y={110} />
    </Push>
  );
};

const Glass: React.FC<{ x: number; y: number; warm: boolean; fill: number; glow: number; tag: number; brain: number }> = ({ x, y, warm, fill, glow, tag, brain }) => (
  <g transform={`translate(${x} ${y})`}>
    {warm && glow > 0 && <g opacity={glow}><Sunburst cx={0} cy={-240} r0={160} r1={520} n={40} a0={-Math.PI} a1={Math.PI} o={0.22} /></g>}
    <clipPath id={`cup${x}`}><path d="M -114 -330 Q -110 -250 -40 -222 L 40 -222 Q 110 -250 114 -330 Z" /></clipPath>
    <rect x={-120} y={-222 - 110 * fill} width={240} height={120} fill={warm ? '#9a1428' : '#6a1220'} clipPath={`url(#cup${x})`} />
    <path d="M -110 -420 Q -120 -270 -40 -220 L -10 -200 L -10 -40 Q -10 -10 -80 0 L 80 0 Q 10 -10 10 -40 L 10 -200 L 40 -220 Q 120 -270 110 -420" fill="none" stroke={warm && glow > 0.5 ? GOLD : 'rgba(243,237,226,0.55)'} strokeWidth={4} />
    <path d="M -90 -400 Q -96 -300 -60 -250" fill="none" stroke="#fff" strokeWidth={6} opacity={0.18} strokeLinecap="round" />
    <g transform={`translate(0 ${70 - (1 - tag) * 30})`} opacity={clamp(tag * 1.3)}><Card x={0} y={0} w={170} h={70} lines={[[warm ? '$ 90' : '$ 10', 44]]} /></g>
    {/* a small brain above each glass; the pleasure area lights by how good it "tastes" */}
    {brain > 0 && <g transform="translate(0 -560)" opacity={brain}>
      <path d="M -90 10 C -110 -60 -40 -100 10 -90 C 70 -100 110 -50 95 0 C 100 40 50 60 0 52 C -50 62 -95 50 -90 10 Z" fill="#120f0c" stroke={GOLD} strokeWidth={3} />
      <path d="M -40 -50 C -20 -30 0 -60 20 -40 M -60 0 C -30 -10 -10 20 20 0 C 40 -10 60 10 70 -10" fill="none" stroke={GOLD} strokeWidth={2} opacity={0.4} />
      <circle cx={-40} cy={20} r={warm ? 30 : 16} fill={warm ? GOLD_L : 'rgba(243,237,226,0.35)'} opacity={warm ? 0.95 : 0.6} />
    </g>}
  </g>
);
const Price: React.FC<{ T: number }> = ({ T }) => {
  const fill = easeInOut(prog(T, 49.6, 52.6));
  return (
    <Push T={T} a={49.17} b={65.5} k={0.05} cx={960} cy={560}>
      <rect width={1920} height={1080} fill={BG} />
      <text x={960} y={150} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={38} fill="rgba(243,237,226,0.75)" opacity={fade(T, 49.6)}>同一瓶酒，倒两杯</text>
      <Glass x={620} y={800} warm={false} fill={fill} glow={0} tag={pop(T, 53.3)} brain={fade(T, 61.5, 0.5)} />
      <Glass x={1300} y={800} warm fill={fill} glow={easeOut(prog(T, 57.5, 58.4))} tag={pop(T, 54.6)} brain={fade(T, 61.9, 0.5)} />
      <Caption T={T} a={53.4} b={65.3} text="Plassmann 等，2008，PNAS" y={110} />
    </Push>
  );
};

const After: React.FC<{ T: number }> = ({ T }) => {
  const lamp = 1 - 0.7 * easeInOut(prog(T, 65.6, 71.5));
  const raysOn = 14 - Math.floor(13 * prog(T, 65.8, 71.0));
  return (
    <Push T={T} a={65.45} b={72.6} k={0.05} cx={900} cy={640}>
      <rect width={1920} height={1080} fill="#0a0908" />
      <g opacity={0.9}>{Array.from({ length: 14 }, (_, i) => { if (i >= raysOn) return null; const a = -Math.PI + (i / 13) * Math.PI; return <line key={i} x1={700 + Math.cos(a) * 200} y1={780 + Math.sin(a) * 200} x2={700 + Math.cos(a) * 700} y2={780 + Math.sin(a) * 700} stroke={GOLD} strokeOpacity={0.14} strokeWidth={2} />; })}</g>
      <rect x={160} y={780} width={1600} height={30} fill="#2a1d12" stroke={GOLD} strokeWidth={2} opacity={0.8} />
      <rect x={1320} y={160} width={360} height={460} fill="#111a2e" stroke={GOLD} strokeWidth={3} opacity={0.9} />
      <line x1={1500} y1={160} x2={1500} y2={620} stroke={GOLD} strokeWidth={2} opacity={0.6} /><line x1={1320} y1={390} x2={1680} y2={390} stroke={GOLD} strokeWidth={2} opacity={0.6} />
      <circle cx={1600} cy={250} r={26} fill="#d8dce6" opacity={0.6} />
      <g transform="translate(1200 780)"><path d="M -150 0 L -150 -110 L 150 -110 L 150 0 Z" fill="#e9e1d2" stroke={GOLD} strokeWidth={2} /><path d="M -150 -110 L -120 -150 L 180 -150 L 150 -110 Z" fill="#cfc6b4" stroke={GOLD} strokeWidth={2} /><path d="M 150 0 L 180 -40 L 180 -150 L 150 -110 Z" fill="#b9b09e" stroke={GOLD} strokeWidth={2} /></g>
      <g transform="translate(1420 780) rotate(-8)"><rect x={-160} y={-24} width={320} height={24} fill="#e9e1d2" stroke={GOLD} strokeWidth={2} /></g>
      <g opacity={0.55 + 0.45 * lamp}><Bag2D x={700} y={780} s={1.0} look="A" id="af" leather="#5a1418" /></g>
      <g transform="translate(330 780)"><rect x={-8} y={-260} width={16} height={260} fill={GOLD_D} /><path d="M -90 -260 L 90 -260 L 60 -360 L -60 -360 Z" fill="#2a2016" stroke={GOLD} strokeWidth={2} /><ellipse cx={0} cy={-250} rx={70} ry={10} fill={GOLD_L} opacity={0.6 * lamp} /><polygon points="-70,-250 70,-250 220,0 -220,0" fill={GOLD_L} opacity={0.08 * lamp} /></g>
    </Push>
  );
};

const Unsold: React.FC<{ T: number }> = ({ T }) => {
  const count = Math.round(28600000 * easeOut(prog(T, 76.4, 78.6)));
  return (
    <Push T={T} a={72.4} b={81.5} k={0.06} cx={960} cy={700}>
      <rect width={1920} height={1080} fill="#0c0a09" />
      <Sunburst cx={960} cy={900} r0={120} r1={1000} n={40} o={0.12} color="#e0782a" />
      <rect x={420} y={140} width={1080} height={600} fill="#1e1d1c" stroke={GOLD} strokeWidth={3} />
      {Array.from({ length: 20 }, (_, i) => <line key={i} x1={420} y1={170 + i * 30} x2={1500} y2={170 + i * 30} stroke="#3a3836" strokeWidth={6} />)}
      <rect x={420} y={740} width={1080} height={160} fill="#2a1206" />
      {[600, 760, 900, 1040, 1180, 1320].map((x, i) => { const f = 0.85 + 0.15 * Math.sin(T * (5 + i) + i * 2); return <g key={x} transform={`translate(${x} 900) scale(1 ${f}) translate(${-x} -900)`}><Flame x={x} s={0.8 + (i % 3) * 0.25} /></g>; })}
      <rect x={0} y={900} width={1920} height={180} fill="#0f0d0b" />
      <line x1={0} y1={900} x2={1920} y2={900} stroke={GOLD} strokeWidth={2} opacity={0.6} />
      {[[200, 900], [300, 900], [250, 790], [1620, 900], [1730, 900]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><rect x={-60} y={-110} width={120} height={110} fill="#e2d8c6" stroke={GOLD} strokeWidth={2} /><rect x={-60} y={-60} width={120} height={10} fill={GOLD} opacity={0.8} /></g>)}
      {T > 76.4 && <text x={960} y={112} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={64} fill={GOLD}>£ {count.toLocaleString('en-US')}</text>}
      <Caption T={T} a={76.6} b={81.3} text="博柏利 2017/18 财年年报" y={170} />
    </Push>
  );
};

const Fakes: React.FC<{ T: number }> = ({ T }) => {
  const on = T >= DROP ? 1 : 0, flash = T >= DROP ? Math.exp(-(T - DROP) / 0.12) : 0;
  const logos = easeOut(prog(T, 85.1, 85.8));
  return (
    <Push T={T} a={81.4} b={92.5} k={0.05} cx={960} cy={640}>
      <rect width={1920} height={1080} fill="#07050d" />
      {on > 0 && <Sunburst cx={960} cy={60} r0={60} r1={1200} n={40} a0={Math.PI * 0.15} a1={Math.PI * 0.85} o={0.16} color={VIOLET} />}
      <rect x={840} y={40} width={240} height={34} rx={6} fill={on ? '#c9b2ff' : '#2a2240'} /><rect x={830} y={30} width={260} height={14} fill="#2a2240" stroke={VIOLET} strokeWidth={2} />
      <rect x={0} y={860} width={1920} height={220} fill="#0d0a18" /><line x1={0} y1={860} x2={1920} y2={860} stroke={VIOLET} strokeWidth={2} opacity={0.6} />
      <g opacity={1 - 0.75 * logos}>
        <Bag2D x={640} y={860} s={1.15} look="A" id="fa" leather={on ? '#3a1a52' : '#1a1020'} outline={on ? VIOLET : '#3a2a50'} stitch="#6a5a8a" />
        <Bag2D x={1280} y={860} s={1.15} look="A" id="fb" leather={on ? '#3a1a52' : '#1a1020'} outline={on ? VIOLET : '#3a2a50'} stitch={on ? UV : '#6a5a8a'} glowStitch={on > 0} />
        <text x={640} y={430} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={32} fill="rgba(243,237,226,0.7)" opacity={on}>正品</text>
        <text x={1280} y={430} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={32} fill={UV} opacity={on}>仿品：缝线在紫外灯下发光</text>
      </g>
      {/* loud vs quiet: our own emblem, big or absent */}
      {logos > 0 && <g opacity={logos}>
        {[[640, true], [1280, false]].map(([x, loud]) => (
          <g key={x as number} transform={`translate(${x} 700)`}>
            <path d="M -142 0 Q -160 0 -158 -18 L -132 -202 Q -130 -220 -112 -220 L 112 -220 Q 130 -220 132 -202 L 158 -18 Q 160 0 142 0 Z" fill="#14110d" stroke={GOLD} strokeWidth={3} />
            {loud ? Array.from({ length: 12 }, (_, i) => <path key={i} d="M 0 -26 L 22 0 L 0 26 L -22 0 Z" fill={GOLD} transform={`translate(${-90 + (i % 4) * 60} ${-170 + Math.floor(i / 4) * 60})`} />) : <rect x={-14} y={-60} width={28} height={6} fill={GOLD} opacity={0.6} />}
            <text y={60} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={32} fill={loud ? GOLD : INK}>{loud ? '大 logo：最常被仿' : '看不出牌子：最有钱的人偏爱'}</text>
          </g>))}
      </g>}
      <AbsoluteSvgFlash k={flash * 0.6} color="#d8c8ff" />
      <Caption T={T} a={81.6} b={85.0} text="OECD–EUIPO，2025（2021年数据）" y={110} />
      <Caption T={T} a={85.2} b={92.3} text="Han, Nunes & Drèze，2010，Journal of Marketing" y={110} />
    </Push>
  );
};
const AbsoluteSvgFlash: React.FC<{ k: number; color: string }> = ({ k, color }) => (k > 0.01 ? <rect width={1920} height={1080} fill={color} opacity={k} /> : null);

const Reveal: React.FC<{ T: number }> = ({ T }) => {
  const base = 800, H = 600, scale = H / 2600;
  const sliver = fade(T, 92.5, 0.4), grow = easeOut(prog(T, 96.3, 97.6));
  const h2 = 2547 * scale * grow, y2 = base - 53 * scale - h2;
  return (
    <Push T={T} a={92.3} b={100.4} k={0.04} cx={960} cy={620}>
      <rect width={1920} height={1080} fill={BG} />
      <Sunburst cx={1180} cy={base} r0={100} r1={1000} n={44} o={0.1} />
      <Bag2D x={560} y={base} s={1.3} look="A" id="rv" swing={swingAt(T, 92.4, 8)} />
      <line x1={900} y1={base} x2={1700} y2={base} stroke={GOLD} strokeWidth={2} />
      <g opacity={sliver}>
        <rect x={1000} y={base - 53 * scale} width={220} height={Math.max(3, 53 * scale)} fill="#c9b9a0" />
        <text x={970} y={base - 2} textAnchor="end" fontFamily={font.latin} fontWeight={700} fontSize={38} fill={INK}>€53</text>
        <text x={1250} y={base - 4} fontFamily={font.sans} fontWeight={700} fontSize={30} fill={INK}>皮 · 五金 · 工时（代工价）</text>
      </g>
      {grow > 0 && <g>
        <rect x={1000} y={y2} width={220} height={h2} fill={GOLD} />
        <text x={1110} y={y2 + h2 / 2 + 22} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={64} fill={BG} opacity={grow}>€2,547</text>
        <text x={1250} y={y2 + h2 / 2 + 12} fontFamily={font.sans} fontWeight={700} fontSize={38} fill={GOLD} opacity={grow}>排队 · 等待 · 价格 · logo</text>
        <text x={970} y={y2 + 14} textAnchor="end" fontFamily={font.latin} fontWeight={700} fontSize={44} fill={GOLD} opacity={grow}>€2,600</text>
      </g>}
    </Push>
  );
};

const Lineup: React.FC<{ T: number; dim?: number }> = ({ T, dim = 0 }) => {
  const k = (a: number) => pop(T, a, 0.4);
  const it = (a: number, el: React.ReactNode) => { const v = k(a); return <g opacity={clamp(v * 1.5)} transform={`translate(0 ${(1 - v) * 40})`}>{el}</g>; };
  return (
    <Push T={T} a={100.2} b={112} k={0.05} cx={960} cy={760}>
      <rect width={1920} height={1080} fill={BG} />
      <g transform="translate(0 -110)">
      <Sunburst cx={960} cy={900} r0={200} r1={1100} n={60} o={0.12} />
      {[[640, 1280, 760], [440, 1480, 860], [240, 1680, 960]].map(([x0, x1, y]) => <rect key={y} x={x0} y={y} width={x1 - x0} height={1080 - y} fill="#14110d" stroke={GOLD} strokeWidth={3} />)}
      <Bag2D x={960} y={760} s={1.05} look="A" id="lu" swing={swingAt(T, 100.3, 8)} />
      {it(100.6, <Perfume2D x={555} y={860} s={1.05} look="A" />)}
      {it(100.95, <Watch2D x={1370} y={770} s={1.0} look="A" />)}
      {it(101.45, <Ring2D x={370} y={960} s={1.15} look="A" />)}
      {it(101.7, <Lipstick2D x={1560} y={960} s={1.15} />)}
      {it(102.2, <Heel2D x={1110} y={860} s={1.0} look="A" />)}
      </g>
      {dim > 0 && <rect width={1920} height={1080} fill="#000" opacity={0.72 * dim} />}
    </Push>
  );
};

const Questions: React.FC<{ T: number }> = ({ T }) => {
  const on = easeOut(prog(T, 104.4, 104.9)) * (1 - prog(T, 111.4, 111.85)); if (on <= 0) return null;
  const qs: [string, string, number][] = [['①', '这是给谁看的？', 104.8], ['②', '没有logo，我还想要吗？', 107.0], ['③', '一年后，它还会让我开心吗？', 109.2]];
  return (
    <g opacity={on}>
      <text x={960} y={250} textAnchor="middle" fontFamily={font.serif} fontWeight={900} fontSize={60} fill={GOLD}>下次心动之前，问自己三个问题</text>
      <line x1={760} y1={290} x2={1160} y2={290} stroke={GOLD} strokeWidth={2} />
      {qs.map(([n, q, a], i) => { const k = pop(T, a, 0.4); return (
        <g key={n} opacity={clamp(k * 1.5)} transform={`translate(${380 + i * 580} ${560 + (1 - k) * 30})`}>
          <rect x={-250} y={-170} width={500} height={340} fill="#0e0c0a" stroke={GOLD} strokeWidth={3} />
          <rect x={-238} y={-158} width={476} height={316} fill="none" stroke={GOLD} strokeWidth={1} opacity={0.5} />
          <text y={-60} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={72} fill={GOLD}>{n}</text>
          <text y={40} textAnchor="middle" fontFamily={font.sans} fontWeight={900} fontSize={q.length > 11 ? 34 : q.length > 9 ? 38 : 44} fill={INK}>{q}</text>
        </g>); })}
    </g>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const ring = easeInOut(prog(t, 0, 0.8)), f = (a: number) => easeOut(prog(t, a, a + 0.4));
  const gold: React.CSSProperties = { backgroundImage: 'linear-gradient(180deg,#fbe3a6 0%,#f1c56d 55%,#c8913a 100%)', WebkitBackgroundClip: 'text', color: 'transparent' };
  return (
    <AbsoluteFill style={{ background: '#05060b' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 0.6 * f(0.6) }}><Sunburst cx={960} cy={1080} r0={300} r1={1300} n={64} o={0.1} /></svg>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={960} cy={110} r={46} fill="none" stroke={GOLD} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 110)" />
        <text x={960} y={130} textAnchor="middle" fontFamily={font.latin} fontStyle="italic" fontWeight={700} fontSize={64} fill={GOLD} opacity={f(0.4)}>J</text>
        <text x={960} y={182} textAnchor="middle" fontFamily="JunoMono, monospace" fontWeight={700} fontSize={18} letterSpacing="0.5em" fill={GOLD} opacity={0.8 * f(0.6)}>JUNO</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: font.serif, fontWeight: 900, fontSize: 120, opacity: f(0.5), ...gold }}>《你买的不是包》</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: font.sans, fontWeight: 900, fontSize: 64, color: INK, opacity: f(1.0) }}>你最想要的一件奢侈品是什么？</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 530, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 34, color: 'rgba(243,237,226,0.62)', opacity: f(1.2) }}>评论区说说，为什么想要它</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center', opacity: f(1.5) }}>
        <div style={{ padding: '12px 36px', borderRadius: 40, border: `2px solid ${GOLD}`, fontFamily: font.sans, fontWeight: 700, fontSize: 32, color: GOLD }}>{JUNO.follow}</div>
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 840, textAlign: 'center', fontFamily: font.sans, fontSize: 20, lineHeight: 1.7, color: 'rgba(243,237,226,0.42)', opacity: f(1.8) }}>
        资料：米兰法院文件（路透社、The Fashion Law 2024；FashionUnited 2025）· Burberry 2017/18 年报（BoF）· OECD–EUIPO 2025 · Plassmann et al. 2008, PNAS · Berridge & Robinson；Schultz（多巴胺）· Han, Nunes & Drèze 2010, J. Marketing · R. Girard《浪漫的谎言与小说的真实》· 画面为代码绘制的示意，包与物件均为原创设计
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ the film */
type Seg = [number, number, (T: number) => React.ReactNode];
const SEGS: Seg[] = [
  [0, 8.473, (T) => <Hook T={T} />],
  [8.473, 12.3, (T) => <Vitrine T={T} a={TITLE} title />],
  [12.0, 23.5, (T) => <Workshop T={T} />],
  [23.3, 29.6, (T) => <Vitrine T={T} a={23.3} blueprint={easeInOut(prog(T, 26.4, 28.6))} />],
  [29.4, 37.35, (T) => <Door T={T} />],
  [37.15, 49.17, (T) => <Waiting T={T} />],
  [49.17, 65.6, (T) => <Price T={T} />],
  [65.45, 72.6, (T) => <After T={T} />],
  [72.35, 81.4, (T) => <Unsold T={T} />],
  [81.4, 92.5, (T) => <Fakes T={T} />],
  [92.3, 100.4, (T) => <Reveal T={T} />],
  [100.2, 111.9, (T) => <Lineup T={T} dim={easeOut(prog(T, 104.4, 104.9)) * (1 - prog(T, 111.4, 111.85))} />],
  [111.8, END_CARD + 0.05, (T) => <Vitrine T={T} a={111.8} lights={1 - easeInOut(prog(T, 114.2, 116.2))} />],
];
const XF = 0.25; // crossfade where segments overlap

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const markO = T < TITLE - 0.2 ? 1 : T < 12.3 ? 0 : T < END_CARD - 0.2 ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format("woff2"); font-style: italic; }`}</style>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, fontVariantNumeric: 'lining-nums' }}>
        {SEGS.map(([a, b, render], i) => {
          if (T < a || T >= b) return null;
          const prev = SEGS[i - 1];
          // a hard cut on the music where segments meet exactly; a short crossfade where they overlap
          const o = (prev && prev[1] > a ? prog(T, a, Math.min(a + XF, prev[1])) : 1);
          return <g key={i} opacity={o}>{render(T)}</g>;
        })}
        {T >= 100.2 && T < 111.9 && <Questions T={T} />}
        {T < END_CARD && <Frame />}
      </svg>
      {T >= END_CARD && <EndCard t={T - END_CARD} />}
      <Grain f={f} o={0.05} />
      <Subtitles T={T} lines={LINES} />
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * markO, fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
        <span style={{ color: GOLD }}>◆ </span>{JUNO.mark}
      </div>
    </AbsoluteFill>
  );
};
export const _unused = [lerp, Lineup];

/* 《你买的不是包》 · style A (金线装饰艺术): every scene as a key frame. Black, gold line work, flat fills, the sunburst.
   The same bag (with its gold price-tag charm) walks through all of them. Frame i = scene i. */
import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { font } from './brand/lib';
import { JUNO } from './brand/identity';
import { Bag2D, Watch2D, Ring2D, Perfume2D, Lipstick2D, Heel2D, Grain, AHero, ALineup, GOLD, GOLD_D, GOLD_L, INK } from './Flat';

export const BG = '#0b0a09', PANEL = '#14110d', VIOLET = '#8a5cff', UV = '#bff4ff';

/** rays from a point, a fan between two angles */
export const Sunburst: React.FC<{ cx: number; cy: number; r0: number; r1: number; n?: number; a0?: number; a1?: number; o?: number; color?: string }> =
  ({ cx, cy, r0, r1, n = 48, a0 = -Math.PI, a1 = 0, o = 0.2, color = GOLD }) => (
    <g>{Array.from({ length: n }, (_, i) => { const a = a0 + (i / (n - 1)) * (a1 - a0); return <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * r1} y2={cy + Math.sin(a) * r1} stroke={color} strokeOpacity={i % 2 ? o * 0.45 : o} strokeWidth={2} />; })}</g>
  );
/** a stepped deco frame line around the picture */
export const Frame: React.FC<{ color?: string }> = ({ color = GOLD }) => (
  <g fill="none" stroke={color} strokeWidth={2} opacity={0.5}>
    <path d="M 60 120 L 60 60 L 120 60 M 1800 60 L 1860 60 L 1860 120 M 1860 960 L 1860 1020 L 1800 1020 M 120 1020 L 60 1020 L 60 960" />
    <path d="M 80 140 L 80 80 L 140 80 M 1780 80 L 1840 80 L 1840 140 M 1840 940 L 1840 1000 L 1780 1000 M 140 1000 L 80 1000 L 80 940" opacity={0.6} />
  </g>
);
export const Card: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; lines: [string, number, string?][]; bg?: string }> = ({ x, y, w, h, rot = 0, lines, bg = '#f1e8d6' }) => {
  let yy = -h / 2 + 8; const total = lines.reduce((s, l) => s + l[1] * 1.2, 0); yy = -total / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={bg} stroke={GOLD} strokeWidth={2} />
      {lines.map(([t, sz, ff], i) => { yy += sz; const el = <text key={i} y={yy} textAnchor="middle" fontFamily={ff ?? font.latin} fontWeight={700} fontSize={sz} fill="#1d1a16">{t}</text>; yy += sz * 0.2; return el; })}
    </g>
  );
};

/* ------------------------------------------------------------------ 00 cold open: the number */
const S00: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill={BG} />
    <Sunburst cx={960} cy={1080} r0={200} r1={1300} n={64} o={0.12} />
    <Bag2D x={960} y={780} s={1.25} look="A" id="s0" />
    {/* the two numbers that start the film */}
    <text x={420} y={470} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={170} fill={INK}>€53</text>
    <text x={420} y={530} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={34} fill="rgba(243,237,226,0.7)">代工厂交货价</text>
    <text x={1500} y={470} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={170} fill={GOLD}>€2,600</text>
    <text x={1500} y={530} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={34} fill="rgba(241,197,109,0.85)">店里的标价</text>
    <path d="M 600 420 L 1290 420" stroke={GOLD} strokeWidth={3} strokeDasharray="10 10" />
    <path d="M 1270 404 L 1296 420 L 1270 436" fill="none" stroke={GOLD} strokeWidth={3} />
    <text x={945} y={395} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={56} fill={GOLD}>× 49</text>
  </>
);

/* ------------------------------------------------------------------ 01 workshop */
const S01: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill="#0d0b08" />
    {/* bulb on its flex, and the light it throws */}
    <line x1={980} y1={0} x2={980} y2={250} stroke={GOLD} strokeWidth={2} />
    <Sunburst cx={980} cy={290} r0={70} r1={900} n={40} a0={Math.PI * 0.12} a1={Math.PI * 0.88} o={0.18} />
    <circle cx={980} cy={290} r={34} fill={GOLD_L} />
    <circle cx={980} cy={290} r={60} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.6} />
    <path d="M 962 252 L 998 252 L 994 262 L 966 262 Z" fill={GOLD_D} />
    {/* the bench */}
    <rect x={180} y={800} width={1560} height={36} fill="#3a2716" stroke={GOLD} strokeWidth={3} />
    <rect x={240} y={836} width={40} height={244} fill="#2a1c10" stroke={GOLD} strokeWidth={2} />
    <rect x={1640} y={836} width={40} height={244} fill="#2a1c10" stroke={GOLD} strokeWidth={2} />
    {/* rolls of hide, a spool, an awl, a mallet */}
    {[[360, 760, '#6d1a20'], [470, 772, '#3d2418']].map(([x, y, c], i) => <g key={i}><rect x={(x as number) - 80} y={(y as number) - 30} width={160} height={60} rx={30} fill={c as string} stroke={GOLD} strokeWidth={2} /><ellipse cx={(x as number) + 80} cy={y as number} rx={14} ry={30} fill="#1a0a06" stroke={GOLD} strokeWidth={2} /></g>)}
    <rect x={1330} y={740} width={50} height={60} fill="#d8c8a0" stroke={GOLD} strokeWidth={2} /><rect x={1322} y={734} width={66} height={10} fill={GOLD_D} /><rect x={1322} y={796} width={66} height={8} fill={GOLD_D} />
    <g transform="translate(1450 790) rotate(-12)"><rect x={0} y={-8} width={90} height={16} rx={6} fill="#3a2a1a" stroke={GOLD} strokeWidth={1.5} /><path d="M 90 -3 L 150 0 L 90 3 Z" fill="#c9ccd2" /></g>
    <g transform="translate(560 788) rotate(8)"><rect x={0} y={-6} width={120} height={12} fill="#3a2a1a" stroke={GOLD} strokeWidth={1.5} /><rect x={110} y={-26} width={40} height={52} rx={6} fill="#4a3424" stroke={GOLD} strokeWidth={1.5} /></g>
    <Bag2D x={960} y={800} s={1.1} look="A" id="s1" tag={false} />
    {/* the paper tag on a string */}
    <path d="M 1046 548 Q 1080 600 1092 640" fill="none" stroke="#e8e0cc" strokeWidth={2} />
    <Card x={1110} y={680} w={130} h={80} rot={8} lines={[['€ 53', 46]]} />
  </>
);

/* ------------------------------------------------------------------ 03 the door: the queue */
const S03: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill={BG} />
    {/* the street beyond the glass, and the queue as one shape */}
    <rect x={360} y={140} width={1200} height={740} fill="#1a2238" />
    <Sunburst cx={960} cy={880} r0={100} r1={900} n={36} o={0.12} color="#9fb6e6" />
    {Array.from({ length: 14 }, (_, i) => {
      const depth = i / 13, s = 1 - depth * 0.6, x = 420 + i * 82 + (i % 2) * 14, base = 880 - depth * 120;
      return (
        <g key={i} transform={`translate(${x} ${base}) scale(${s})`} opacity={0.95 - depth * 0.45}>
          <ellipse cx={0} cy={-330} rx={26} ry={31} fill="#0a0c14" />
          <path d="M -62 -280 Q 0 -305 62 -280 L 70 -100 L 52 0 L -52 0 L -70 -100 Z" fill="#0a0c14" />
          <path d="M -62 -280 Q 0 -305 62 -280" fill="none" stroke="#9fb6e6" strokeWidth={2} opacity={0.6} />
        </g>);
    })}
    {/* the deco door frame */}
    <path d="M 340 1080 L 340 300 Q 340 120 520 120 L 1400 120 Q 1580 120 1580 300 L 1580 1080" fill="none" stroke={GOLD} strokeWidth={6} />
    <path d="M 960 120 L 960 1080" stroke={GOLD} strokeWidth={5} />
    <path d="M 362 1080 L 362 306 Q 362 142 526 142 L 1394 142 Q 1558 142 1558 306 L 1558 1080" fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.6} />
    <rect x={0} y={880} width={1920} height={200} fill="#0e0c0a" />
    <line x1={0} y1={880} x2={1920} y2={880} stroke={GOLD} strokeWidth={2} opacity={0.6} />
    {/* stanchions and rope, inside, in front */}
    {[600, 1320].map((x) => <g key={x}><rect x={x - 10} y={640} width={20} height={300} fill={GOLD} /><circle cx={x} cy={630} r={24} fill={GOLD_L} stroke={GOLD_D} strokeWidth={2} /><ellipse cx={x} cy={948} rx={70} ry={16} fill={GOLD} stroke={GOLD_D} strokeWidth={2} /></g>)}
    <path d="M 600 650 Q 960 830 1320 650" fill="none" stroke="#7a0f1a" strokeWidth={22} strokeLinecap="round" />
    <path d="M 600 644 Q 960 818 1320 644" fill="none" stroke="#c43a4a" strokeWidth={4} opacity={0.6} />
  </>
);

/* ------------------------------------------------------------------ 04 waiting: the empty case */
const S04: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill={BG} />
    <Sunburst cx={960} cy={640} r0={120} r1={900} o={0.12} />
    <path d="M 710 900 L 710 420 A 250 250 0 0 1 1210 420 L 1210 900" fill="#120f0c" stroke={GOLD} strokeWidth={4} />
    <rect x={780} y={740} width={360} height={160} fill="#16120e" stroke={GOLD} strokeWidth={3} />
    <rect x={760} y={720} width={400} height={22} fill="#16120e" stroke={GOLD} strokeWidth={3} />
    {/* a dashed outline where the bag was */}
    <g transform="translate(960 720) scale(1.15)" opacity={0.5}><path d="M -142 0 Q -160 0 -158 -18 L -132 -202 Q -130 -220 -112 -220 L 112 -220 Q 130 -220 132 -202 L 158 -18 Q 160 0 142 0 Z" fill="none" stroke={GOLD} strokeWidth={2} strokeDasharray="10 8" /><path d="M -78 -224 C -78 -338, 78 -338, 78 -224" fill="none" stroke={GOLD} strokeWidth={2} strokeDasharray="10 8" /></g>
    <Card x={960} y={660} w={260} h={120} lines={[['暂时缺货', 44, font.serif], ['可登记等候', 28, font.sans]]} />
    {/* the waiting list ticket */}
    <g transform="translate(1440 600) rotate(-7)">
      <rect x={-130} y={-180} width={260} height={360} fill="#f1e8d6" stroke={GOLD} strokeWidth={2} />
      <text y={-120} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill="#1d1a16">等候名单</text>
      <line x1={-100} y1={-96} x2={100} y2={-96} stroke="#1d1a16" strokeWidth={1.5} />
      <text y={20} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={130} fill="#7a1c22">37</text>
      <text y={80} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={30} fill="#1d1a16">您前面还有 36 位</text>
      {[110, 130, 150].map((y) => <line key={y} x1={-100} y1={y} x2={100} y2={y} stroke="#1d1a16" strokeWidth={1} opacity={0.3} />)}
    </g>
  </>
);

/* ------------------------------------------------------------------ 05 price: the same wine */
export const Glass: React.FC<{ x: number; y: number; warm: boolean }> = ({ x, y, warm }) => (
  <g transform={`translate(${x} ${y})`}>
    {warm && <Sunburst cx={0} cy={-240} r0={160} r1={520} n={40} a0={-Math.PI} a1={Math.PI} o={0.22} />}
    <path d="M -110 -420 Q -120 -270 -40 -220 L -10 -200 L -10 -40 Q -10 -10 -80 0 L 80 0 Q 10 -10 10 -40 L 10 -200 L 40 -220 Q 120 -270 110 -420" fill="none" stroke={warm ? GOLD : 'rgba(243,237,226,0.45)'} strokeWidth={4} />
    <path d="M -114 -330 Q -110 -250 -40 -222 L 40 -222 Q 110 -250 114 -330 Z" fill={warm ? '#9a1428' : '#4a0c16'} />
    <path d="M -114 -330 L 114 -330" stroke={warm ? '#e05a6a' : '#7a2a36'} strokeWidth={4} />
    <path d="M -90 -400 Q -96 -300 -60 -250" fill="none" stroke="#fff" strokeWidth={6} opacity={0.18} strokeLinecap="round" />
    <Card x={0} y={70} w={170} h={70} lines={[[warm ? '$ 90' : '$ 10', 44]]} bg={warm ? '#f1e8d6' : '#9a9286'} />
  </g>
);
const S05: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill={BG} />
    <Glass x={620} y={780} warm={false} />
    <Glass x={1300} y={780} warm />
    <text x={960} y={160} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={38} fill="rgba(243,237,226,0.75)">同一瓶酒，倒两杯</text>
  </>
);

/* ------------------------------------------------------------------ 06 home: after */
const S06: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill="#0a0908" />
    {/* the rays are going out: only a few left, faint */}
    <Sunburst cx={960} cy={760} r0={200} r1={700} n={14} o={0.07} />
    <rect x={160} y={780} width={1600} height={30} fill="#2a1d12" stroke={GOLD} strokeWidth={2} opacity={0.8} />
    {/* window with the night */}
    <rect x={1320} y={160} width={360} height={460} fill="#111a2e" stroke={GOLD} strokeWidth={3} opacity={0.9} />
    <line x1={1500} y1={160} x2={1500} y2={620} stroke={GOLD} strokeWidth={2} opacity={0.6} /><line x1={1320} y1={390} x2={1680} y2={390} stroke={GOLD} strokeWidth={2} opacity={0.6} />
    <circle cx={1600} cy={250} r={26} fill="#d8dce6" opacity={0.6} />
    {/* the open, empty box and its lid */}
    <g transform="translate(1200 780)"><path d="M -150 0 L -150 -110 L 150 -110 L 150 0 Z" fill="#e9e1d2" stroke={GOLD} strokeWidth={2} /><path d="M -150 -110 L -120 -150 L 180 -150 L 150 -110 Z" fill="#cfc6b4" stroke={GOLD} strokeWidth={2} /><path d="M 150 0 L 180 -40 L 180 -150 L 150 -110 Z" fill="#b9b09e" stroke={GOLD} strokeWidth={2} /></g>
    <g transform="translate(1420 780) rotate(-8)"><rect x={-160} y={-24} width={320} height={24} fill="#e9e1d2" stroke={GOLD} strokeWidth={2} /></g>
    <Bag2D x={700} y={780} s={1.0} look="A" id="s6" leather="#4a1216" />
    {/* the lamp, turned low */}
    <g transform="translate(330 780)"><rect x={-8} y={-260} width={16} height={260} fill={GOLD_D} /><path d="M -90 -260 L 90 -260 L 60 -360 L -60 -360 Z" fill="#2a2016" stroke={GOLD} strokeWidth={2} /><ellipse cx={0} cy={-250} rx={70} ry={10} fill={GOLD_L} opacity={0.35} /></g>
  </>
);

/* ------------------------------------------------------------------ 07 the unsold */
export const Flame: React.FC<{ x: number; s: number }> = ({ x, s }) => (
  <g transform={`translate(${x} 900) scale(${s})`}>
    <path d="M 0 0 C -60 -40, -40 -120, -10 -170 C 0 -120, 30 -110, 20 -60 C 50 -90, 60 -40, 40 0 Z" fill="#e0782a" />
    <path d="M 0 0 C -30 -30, -20 -80, 0 -110 C 4 -80, 24 -70, 16 -36 C 30 -50, 32 -20, 22 0 Z" fill={GOLD_L} />
  </g>
);
const S07: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill="#0c0a09" />
    <Sunburst cx={960} cy={900} r0={120} r1={1000} n={40} o={0.12} color="#e0782a" />
    {/* the shutter, a third of the way up */}
    <rect x={420} y={140} width={1080} height={600} fill="#1e1d1c" stroke={GOLD} strokeWidth={3} />
    {Array.from({ length: 20 }, (_, i) => <line key={i} x1={420} y1={170 + i * 30} x2={1500} y2={170 + i * 30} stroke="#3a3836" strokeWidth={6} />)}
    <rect x={420} y={740} width={1080} height={160} fill="#2a1206" />
    {[600, 760, 900, 1040, 1180, 1320].map((x, i) => <Flame key={x} x={x} s={0.8 + (i % 3) * 0.25} />)}
    <rect x={0} y={900} width={1920} height={180} fill="#0f0d0b" />
    <line x1={0} y1={900} x2={1920} y2={900} stroke={GOLD} strokeWidth={2} opacity={0.6} />
    {/* boxes waiting their turn */}
    {[[200, 900, 0], [300, 900, 0], [250, 790, 0], [1620, 900, 0], [1730, 900, 0]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><rect x={-60} y={-110} width={120} height={110} fill="#e2d8c6" stroke={GOLD} strokeWidth={2} /><rect x={-60} y={-60} width={120} height={10} fill={GOLD} opacity={0.8} /></g>)}
    <text x={960} y={112} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={64} fill={GOLD}>£ 28,600,000</text>
  </>
);

/* ------------------------------------------------------------------ 08 the fakes under UV */
const S08: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill="#07050d" />
    <Sunburst cx={960} cy={60} r0={60} r1={1200} n={40} a0={Math.PI * 0.15} a1={Math.PI * 0.85} o={0.16} color={VIOLET} />
    <rect x={840} y={40} width={240} height={34} rx={6} fill="#c9b2ff" /><rect x={830} y={30} width={260} height={14} fill="#2a2240" stroke={VIOLET} strokeWidth={2} />
    <rect x={0} y={860} width={1920} height={220} fill="#0d0a18" /><line x1={0} y1={860} x2={1920} y2={860} stroke={VIOLET} strokeWidth={2} opacity={0.6} />
    <Bag2D x={640} y={860} s={1.15} look="A" id="s8a" leather="#3a1a52" outline={VIOLET} stitch="#6a5a8a" />
    <Bag2D x={1280} y={860} s={1.15} look="A" id="s8b" leather="#3a1a52" outline={VIOLET} stitch={UV} />
    {/* the fake's thread fluoresces: a glow over its stitches */}
    <g transform="translate(1280 860) scale(1.15)" style={{ filter: 'drop-shadow(0 0 8px #9ef0ff) drop-shadow(0 0 18px #6ad8ff)' }}>
      <path d="M -126 -212 L -127 -150 Q -114 -100 0 -96 Q 114 -100 127 -150 L 126 -212" fill="none" stroke={UV} strokeWidth={3} strokeDasharray="7 6" />
    </g>
    <text x={640} y={980} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={34} fill="rgba(243,237,226,0.7)">A</text>
    <text x={1280} y={980} textAnchor="middle" fontFamily={font.sans} fontWeight={700} fontSize={34} fill={UV}>B</text>
  </>
);

/* ------------------------------------------------------------------ 09 the reveal: what the 2,600 is made of */
const S09: React.FC = () => {
  const H = 640, base = 920, scale = H / 2600;
  const layers: [string, number, string][] = [['皮 · 五金 · 工时（代工价）', 53, '#c9b9a0'], ['排队 · 等待 · 价格 · logo', 2547, GOLD]];
  let y = base;
  return (
    <>
      <rect width={1920} height={1080} fill={BG} />
      <Sunburst cx={1180} cy={base} r0={100} r1={1000} n={44} o={0.1} />
      <Bag2D x={560} y={base} s={1.3} look="A" id="s9" />
      <line x1={900} y1={base} x2={1700} y2={base} stroke={GOLD} strokeWidth={2} />
      {layers.map(([name, v, col], i) => { const h = v * scale; y -= h; return (
        <g key={i}>
          <rect x={1000} y={y} width={220} height={Math.max(h, 3)} fill={col} stroke={BG} strokeWidth={2} />
          <text x={1250} y={y + Math.max(h, 3) / 2 + 12} fontFamily={font.sans} fontWeight={700} fontSize={i === 0 ? 30 : 38} fill={i === 0 ? INK : GOLD}>{name}</text>
          {i === 1 && <text x={1110} y={y + h / 2 + 20} textAnchor="middle" fontFamily={font.latin} fontWeight={700} fontSize={64} fill={BG}>€2,547</text>}
          {i === 0 && <text x={970} y={y + 12} textAnchor="end" fontFamily={font.latin} fontWeight={700} fontSize={38} fill={INK}>€53</text>}
        </g>); })}
      <text x={970} y={y + 14} textAnchor="end" fontFamily={font.latin} fontWeight={700} fontSize={44} fill={GOLD}>€2,600</text>
      <text x={1110} y={210} textAnchor="middle" fontFamily={font.serif} fontWeight={900} fontSize={58} fill={GOLD}>多出来的2547欧元，是被设计出来的欲望</text>
    </>
  );
};

/* ------------------------------------------------------------------ the board */
type F = { name: string; C: React.FC; sub?: string; svg: boolean };
export const DECO: F[] = [
  { name: '00 钩子 · 53 → 2600', C: S00, svg: true, sub: '同一只包：出厂53欧元，店里2600欧元。' },
  { name: '01 工坊', C: S01, svg: true, sub: '2024年，米兰法院的文件里，写着它的代工价。' },
  { name: '02 精品店 · 标题', C: AHero, svg: false },
  { name: '03 门口 · 排队', C: S03, svg: true, sub: '我们想要的，往往是别人想要的。' },
  { name: '04 等待 · 买不到', C: S04, svg: true, sub: '欲望最强的时候，是"快要得到"之前。' },
  { name: '05 价格 · 同一杯酒', C: S05, svg: true, sub: '标90美元的那杯，大脑真的觉得更好喝。' },
  { name: '06 到手以后', C: S06, svg: true, sub: '拿到以后，那股劲，很快就退了。' },
  { name: '07 卖不掉的', C: S07, svg: true, sub: '2018年，一个品牌销毁了2860万英镑的存货。' },
  { name: '08 假的 · 紫外灯下', C: S08, svg: true, sub: '全球假货贸易：4670亿美元。' },
  { name: '09 揭晓 · 差价是什么', C: S09, svg: true },
  { name: '10 全家福', C: ALineup, svg: false },
];

export const Deco: React.FC = () => {
  const f = useCurrentFrame(), F = DECO[Math.min(DECO.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <style>{`@font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        @font-face { font-family: "Cormorant Garamond"; src: url(${staticFile('fonts/cormorant-garamond-latin-700-normal.woff2')}) format("woff2"); font-weight: 700; }`}</style>
      {F.svg ? <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, fontVariantNumeric: 'lining-nums' }}><F.C /><Frame /></svg> : <F.C />}
      <Grain f={f} o={0.05} />
      {F.sub && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 86, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 68, color: INK, WebkitTextStroke: '2px rgba(0,0,0,0.85)', paintOrder: 'stroke fill', textShadow: '0 4px 18px rgba(0,0,0,0.9)', fontVariantNumeric: 'lining-nums' }}>{F.sub}</div>}
      <div style={{ position: 'absolute', top: 44, right: 56, opacity: F.name.includes('标题') ? 0 : 0.55, fontFamily: font.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}><span style={{ color: GOLD }}>◆ </span>{JUNO.mark}</div>
    </AbsoluteFill>
  );
};
export const DECO_FRAMES = DECO.length;

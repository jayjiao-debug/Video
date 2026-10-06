import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/* ep13 "高级的漫画风": monochrome manga page language — ink panels, screentone gradients, hatching,
   narration boxes, restrained speed lines — with one vermilion accent. Code-drawn, no AI images. */
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif', NUM = '"Cormorant Garamond", serif';
const INK = '#111111', PAPER = '#F4F1EA', RED = '#D7261E';
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

const Defs: React.FC = () => (
  <defs>
    <pattern id="dot1" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx={4.5} cy={4.5} r={2.1} fill={INK} /></pattern>
    <pattern id="dot2" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx={3.5} cy={3.5} r={1.1} fill={INK} /></pattern>
    <pattern id="hatch" width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1={0} y1={0} x2={0} y2={10} stroke={INK} strokeWidth={1.6} /></pattern>
    <pattern id="hatch2" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(55)"><line x1={0} y1={0} x2={0} y2={7} stroke={INK} strokeWidth={1.2} /></pattern>
    <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity="1" /></linearGradient>
    <linearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
    <mask id="mDown" maskContentUnits="objectBoundingBox"><rect width={1} height={1} fill="url(#fadeDown)" /></mask>
    <mask id="mUp" maskContentUnits="objectBoundingBox"><rect width={1} height={1} fill="url(#fadeUp)" /></mask>
    <filter id="inkF" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="paperF" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0 0.24  0 0 0 0.07 0" />
    </filter>
  </defs>
);
const Paper: React.FC = () => <><rect width={1920} height={1080} fill={PAPER} /><rect width={1920} height={1080} filter="url(#paperF)" /></>;
/** a panel: clip + thick ink border */
const Panel: React.FC<{ d: string; id: string; children: React.ReactNode; bw?: number }> = ({ d, id, children, bw = 6 }) => (
  <g>
    <defs><clipPath id={id}><path d={d} /></clipPath></defs>
    <g clipPath={`url(#${id})`}>{children}</g>
    <path d={d} fill="none" stroke={INK} strokeWidth={bw} strokeLinejoin="miter" filter="url(#inkF)" />
  </g>
);
const Narr: React.FC<{ x: number; y: number; w: number; lines: string[]; s?: number }> = ({ x, y, w, lines, s = 30 }) => (
  <g>
    <rect x={x} y={y} width={w} height={lines.length * s * 1.5 + s * 0.8} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
    {lines.map((l, i) => <text key={i} x={x + s * 0.7} y={y + s * 1.35 + i * s * 1.5} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: s }} fill={INK}>{l}</text>)}
  </g>
);
const radial = (cx: number, cy: number, r0: number, n: number, seed: number, len = 1600, wmax = 0.01) => {
  const r = rng(seed); const out: string[] = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r() * 0.03, w = 0.002 + r() * wmax, ri = r0 * (0.85 + r() * 0.5); out.push(`M${cx + ri * Math.cos(a)},${cy + ri * Math.sin(a)} L${cx + len * Math.cos(a - w)},${cy + len * Math.sin(a - w)} L${cx + len * Math.cos(a + w)},${cy + len * Math.sin(a + w)} Z`); }
  return out.join(' ');
};
/** line-art cloud with hatched underside */
const InkCloud: React.FC<{ x: number; y: number; s: number; seed: number }> = ({ x, y, s, seed }) => {
  const r = rng(seed); const b: [number, number, number][] = [];
  for (let i = 0; i < 9; i++) { const t = i / 8; b.push([(t - 0.5) * 480 + (r() - 0.5) * 40, -Math.sin(Math.PI * t) * 120 * (0.6 + r() * 0.5), 55 + Math.sin(Math.PI * t) * 70 * (0.7 + r() * 0.4)]); }
  const id = `ic${seed}`;
  const shape = <>{b.map(([bx, by, br], i) => <circle key={i} cx={bx} cy={by} r={br} />)}<rect x={-290} y={-30} width={580} height={70} rx={35} /></>;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs><clipPath id={id}>{shape}</clipPath></defs>
      <g fill={PAPER} stroke={INK} strokeWidth={3.2 / s}>{shape}</g>
      <g fill={PAPER}>{b.map(([bx, by, br], i) => <circle key={i} cx={bx} cy={by} r={br - 2.5 / s} />)}<rect x={-287} y={-27} width={574} height={64} rx={32} /></g>
      <g clipPath={`url(#${id})`}><rect x={-320} y={-10} width={640} height={60} fill="url(#hatch2)" opacity={0.75} /><rect x={-320} y={-60} width={640} height={50} fill="url(#dot2)" opacity={0.4} /></g>
    </g>
  );
};

/* ---- 1: the hook page ---- */
const P1: React.FC = () => {
  const A = 'M40,40 L1150,40 L1060,1040 L40,1040 Z';
  const B = 'M1180,40 L1880,40 L1880,520 L1138,520 Z';
  const Cc = 'M1135,550 L1880,550 L1880,1040 L1090,1040 Z';
  const r = rng(4);
  return (
    <svg width={1920} height={1080}>
      <Defs /><Paper />
      <Panel d={A} id="pa">
        <rect width={1200} height={1080} fill={INK} />
        {/* city through the window, white on black */}
        {Array.from({ length: 14 }, (_, i) => { const x = 60 + i * 80, h = 140 + r() * 260; return <g key={i}><rect x={x} y={760 - h} width={66} height={h + 400} fill="#1C1C1C" stroke="#2A2A2A" strokeWidth={2} />{Array.from({ length: 10 }, (_, j) => r() > 0.78 ? <rect key={j} x={x + 10 + (j % 3) * 18} y={780 - h + 30 + Math.floor(j / 3) * 34} width={10} height={14} fill={PAPER} opacity={0.85} /> : null)}</g>; })}
        {/* screen light: a white burst with speed lines */}
        <path d={radial(560, 640, 120, 160, 11, 1400, 0.008)} fill={PAPER} opacity={0.75} />
        <rect x={360} y={520} width={400} height={250} fill={PAPER} />
        <rect x={380} y={540} width={360} height={210} fill="url(#dot1)" mask="url(#mUp)" />
        {/* silhouette from behind, rim-lit */}
        <path d="M420,1080 C420,900 480,840 560,840 C640,840 700,900 700,1080 Z" fill={INK} stroke={PAPER} strokeWidth={4} />
        <circle cx={560} cy={790} r={84} fill={INK} stroke={PAPER} strokeWidth={4} />
        <path d="M500,730 C530,700 600,700 625,735" fill="none" stroke={PAPER} strokeWidth={3} opacity={0.6} />
        <rect x={70} y={50} width={470} height={220} fill={INK} />
        <text x={110} y={180} style={{ fontFamily: NUM, fontStyle: 'italic', fontWeight: 700, fontSize: 150 }} fill={PAPER}>02:47</text>
        <text x={116} y={240} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em' }} fill={PAPER} opacity={0.75}>AM · 打游戏</text>
      </Panel>
      <Panel d={B} id="pb">
        <rect x={1100} width={800} height={600} fill={PAPER} />
        <rect x={1100} y={300} width={800} height={260} fill="url(#dot1)" mask="url(#mDown)" opacity={0.7} />
        {/* close-up clock */}
        <circle cx={1500} cy={300} r={190} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
        {Array.from({ length: 60 }, (_, i) => { const t = i * Math.PI / 30; const L = i % 5 ? 10 : 26; return <line key={i} x1={1500 + (178 - L) * Math.cos(t)} y1={300 + (178 - L) * Math.sin(t)} x2={1500 + 176 * Math.cos(t)} y2={300 + 176 * Math.sin(t)} stroke={INK} strokeWidth={i % 5 ? 2 : 6} />; })}
        <line x1={1500} y1={300} x2={1500} y2={160} stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <line x1={1500} y1={300} x2={1572} y2={340} stroke={RED} strokeWidth={5} strokeLinecap="round" />
        <circle cx={1500} cy={300} r={12} fill={INK} />
        <path d="M1740,140 l40,-30 M1760,180 l50,-10 M1745,100 l25,-40" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </Panel>
      <Panel d={Cc} id="pc">
        <rect x={1080} y={540} width={820} height={520} fill={PAPER} />
        <rect x={1080} y={540} width={820} height={520} fill="url(#hatch)" opacity={0.25} />
        <text x={1820} y={760} textAnchor="end" style={{ fontFamily: NUM, fontStyle: 'italic', fontWeight: 700, fontSize: 150 }} fill={INK}>20:10</text>
        <text x={1820} y={820} textAnchor="end" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em' }} fill={INK} opacity={0.7}>PM · 写作业</text>
        <path d="M1180,930 q40,-34 80,0 q40,34 80,0 q40,-34 80,0" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      </Panel>
      <Narr x={1150} y={880} w={420} lines={['同一个脑子，', '为什么差这么多？']} s={34} />
      <rect x={70} y={300} width={14} height={120} fill={RED} />
    </svg>
  );
};

/* ---- 2: 85% ---- */
const P2: React.FC = () => (
  <svg width={1920} height={1080}>
    <Defs /><Paper />
    <Panel d="M40,40 L1880,40 L1880,1040 L40,1040 Z" id="p2">
      <rect width={1920} height={1080} fill={PAPER} />
      <path d={radial(1020, 520, 300, 300, 21, 1700, 0.006)} fill={INK} />
      <ellipse cx={1020} cy={520} rx={430} ry={300} fill={PAPER} />
      <rect x={40} y={760} width={1840} height={300} fill="url(#dot1)" mask="url(#mDown)" opacity={0.85} />
      <text x={1020} y={610} textAnchor="middle" style={{ fontFamily: NUM, fontWeight: 700, fontStyle: 'italic', fontSize: 330, letterSpacing: '-0.02em' }} fill={INK} filter="url(#inkF)">85%</text>
      <rect x={830} y={650} width={380} height={10} fill={RED} />
      <text x={1020} y={720} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, letterSpacing: '0.2em' }} fill={INK}>学得最快的正确率</text>
    </Panel>
    <Narr x={90} y={90} w={520} lines={['2019年，几位科学家', '用数学模型算出——']} s={34} />
  </svg>
);

/* ---- 3: flow — a wide sky panel ---- */
const P3: React.FC = () => {
  const ribbon = (k: number) => { const p: string[] = []; for (let i = 0; i <= 80; i++) { const t = i / 80, x = -80 + 2100 * t, y = 820 - 560 * t + 70 * Math.sin(t * 6 + k * 0.35) + k * 9; p.push(`${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`); } return p.join(' '); };
  return (
    <svg width={1920} height={1080}>
      <Defs /><Paper />
      <Panel d="M40,40 L1880,40 L1880,1040 L40,1040 Z" id="p3">
        <rect width={1920} height={1080} fill={PAPER} />
        <rect x={0} y={0} width={1920} height={380} fill="url(#dot2)" mask="url(#mUp)" opacity={0.55} />
        <InkCloud x={420} y={330} s={0.9} seed={3} />
        <InkCloud x={1500} y={230} s={0.7} seed={5} />
        <InkCloud x={1250} y={650} s={1.2} seed={8} />
        {Array.from({ length: 14 }, (_, k) => <path key={k} d={ribbon(k)} stroke={k === 7 ? RED : INK} strokeWidth={k === 7 ? 4 : k % 4 === 0 ? 3 : 1.4} fill="none" strokeLinecap="round" opacity={k === 7 ? 1 : 0.85} filter="url(#inkF)" />)}
        {/* rooftop + small figure */}
        <path d="M40,930 L1880,900 L1880,1040 L40,1040 Z" fill={INK} />
        <line x1={40} y1={915} x2={1880} y2={885} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 24 }, (_, i) => <line key={i} x1={60 + i * 78} y1={928 - i * 1.3} x2={60 + i * 78} y2={890 - i * 1.3} stroke={INK} strokeWidth={4} />)}
        <path d="M300,930 C300,850 318,826 340,826 C362,826 380,850 380,930 Z" fill={INK} />
        <circle cx={340} cy={804} r={24} fill={INK} />
      </Panel>
      <g>
        {[...'心流'].map((c, i) => <text key={c} x={1700} y={330 + i * 190} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 180 }} fill={INK} stroke={PAPER} strokeWidth={10} paintOrder="stroke">{c}</text>)}
        <rect x={1655} y={680} width={90} height={90} fill={RED} />
        <text x={1700} y={738} textAnchor="middle" style={{ fontFamily: NUM, fontStyle: 'italic', fontWeight: 700, fontSize: 40 }} fill={PAPER}>flow</text>
      </g>
      <Narr x={90} y={90} w={600} lines={['目标清楚，马上反馈，难度刚好——', '时间，就消失了。']} s={30} />
    </svg>
  );
};

const FR = [P1, P2, P3];
export const LooksManga: React.FC = () => { const f = useCurrentFrame(); const C = FR[Math.min(2, f)]; return <AbsoluteFill><C /></AbsoluteFill>; };

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/* ep13 "anime vibe" in code: manga panels, concentration lines, impact frames, cel-shaded skies,
   outlined title type, screentone. No AI images. */
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif', MONO = '"DejaVu Sans Mono", monospace';
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

/** concentration lines (集中線) around a centre */
const Shuchu: React.FC<{ cx: number; cy: number; r0: number; n: number; seed: number; col: string; o?: number }> = ({ cx, cy, r0, n, seed, col, o = 1 }) => {
  const r = rng(seed); const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.02, w = 0.004 + r() * 0.012, ri = r0 * (0.8 + r() * 0.6), ro = 1500;
    out.push(`M${cx + ri * Math.cos(a)},${cy + ri * Math.sin(a)} L${cx + ro * Math.cos(a - w)},${cy + ro * Math.sin(a - w)} L${cx + ro * Math.cos(a + w)},${cy + ro * Math.sin(a + w)} Z`);
  }
  return <path d={out.join(' ')} fill={col} opacity={o} />;
};
/** horizontal speed lines */
const Speed: React.FC<{ x0: number; x1: number; y0: number; y1: number; n: number; seed: number; col: string; o?: number }> = ({ x0, x1, y0, y1, n, seed, col, o = 1 }) => {
  const r = rng(seed); const out: string[] = [];
  for (let i = 0; i < n; i++) { const y = y0 + (y1 - y0) * r(), l = 200 + r() * 700, x = x0 + (x1 - x0 - l) * r(), h = 1 + r() * 4; out.push(`M${x},${y} L${x + l},${y - h / 2} L${x + l},${y + h / 2} Z`); }
  return <path d={out.join(' ')} fill={col} opacity={o} />;
};
/** cel-shaded cumulus cloud: light body, shadow underside, rim highlight */
const Cloud: React.FC<{ x: number; y: number; s: number; seed: number; lit?: string; mid?: string; sh?: string }> = ({ x, y, s, seed, lit = '#FFFFFF', mid = '#EAF2FB', sh = '#B9CBE6' }) => {
  const r = rng(seed); const blobs: [number, number, number][] = [];
  for (let i = 0; i < 11; i++) { const t = i / 10; blobs.push([(t - 0.5) * 520 + (r() - 0.5) * 50, -Math.sin(Math.PI * t) * 170 * (0.6 + r() * 0.5), 70 + Math.sin(Math.PI * t) * 90 * (0.7 + r() * 0.5)]); }
  const id = `cl${seed}`;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs><clipPath id={id}>{blobs.map(([bx, by, br], i) => <circle key={i} cx={bx} cy={by} r={br} />)}<rect x={-330} y={-40} width={660} height={90} rx={45} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={-400} y={-400} width={800} height={600} fill={sh} />
        {blobs.map(([bx, by, br], i) => <circle key={i} cx={bx - 14} cy={by - 26} r={br * 0.92} fill={mid} />)}
        {blobs.map(([bx, by, br], i) => <circle key={`l${i}`} cx={bx - 26} cy={by - 44} r={br * 0.72} fill={lit} />)}
      </g>
    </g>
  );
};
const Tone: React.FC<{ id: string; col: string; r?: number; gap?: number }> = ({ id, col, r = 2.4, gap = 10 }) => (
  <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx={gap / 2} cy={gap / 2} r={r} fill={col} /></pattern>
);
/** outlined anime title text */
const Out: React.FC<{ x: number; y: number; s: number; fill: string; stroke: string; sw: number; children: React.ReactNode; a?: 'start' | 'middle' | 'end'; f?: string; w?: number; rot?: number; shadow?: string; ls?: string }> = ({ x, y, s, fill, stroke, sw, children, a = 'middle', f = SANS, w = 900, rot = 0, shadow, ls }) => {
  const st: React.CSSProperties = { fontFamily: f, fontSize: s, fontWeight: w, letterSpacing: ls, fontFeatureSettings: "'tnum' 1", paintOrder: 'stroke' };
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      {shadow && <text x={x + s * 0.06} y={y + s * 0.07} textAnchor={a} style={st} fill={shadow} stroke={shadow} strokeWidth={sw} strokeLinejoin="round">{children}</text>}
      <text x={x} y={y} textAnchor={a} style={st} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round">{children}</text>
    </g>
  );
};

/* ---- 1: hook, two manga panels split by a slanted gutter ---- */
const V1: React.FC = () => {
  const cut = 'M1010,0 L1920,0 L1920,1080 L870,1080 Z', left = 'M0,0 L990,0 L850,1080 L0,1080 Z';
  return (
    <svg width={1920} height={1080}>
      <defs>
        <clipPath id="L"><path d={left} /></clipPath><clipPath id="R"><path d={cut} /></clipPath>
        <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1033" /><stop offset="0.6" stopColor="#1B2A6B" /><stop offset="1" stopColor="#3A2A7A" /></linearGradient>
        <linearGradient id="day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5FB0F0" /><stop offset="1" stopColor="#CFE8FA" /></linearGradient>
        <Tone id="tone" col="#7C93B5" r={2.2} gap={11} />
        <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#7FF0FF" stopOpacity="0.95" /><stop offset="0.4" stopColor="#4C7CFF" stopOpacity="0.45" /><stop offset="1" stopColor="#4C7CFF" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="#FFFFFF" />
      {/* left: night, the game */}
      <g clipPath="url(#L)">
        <rect width={1000} height={1080} fill="url(#night)" />
        {Array.from({ length: 70 }, (_, i) => { const r = rng(i + 3); return <circle key={i} cx={r() * 1000} cy={r() * 560} r={r() * 2.4 + 0.6} fill="#FFFFFF" opacity={0.4 + r() * 0.6} />; })}
        <circle cx={430} cy={560} r={420} fill="url(#glow)" />
        <Speed x0={-200} x1={1100} y0={420} y1={720} n={70} seed={5} col="#BFF6FF" o={0.55} />
        {/* the screen, from behind a silhouette */}
        <rect x={190} y={380} width={480} height={290} rx={14} fill="#AFF3FF" />
        <rect x={204} y={394} width={452} height={262} rx={8} fill="#2B5BFF" />
        <Shuchu cx={430} cy={525} r0={30} n={60} seed={77} col="#9FF3FF" o={0.9} />
        <path d="M250,610 L610,440 L622,456 L262,628 Z" fill="#FFFFFF" />
        <path d="M300,470 L560,640" stroke="#FF4FA3" strokeWidth={10} strokeLinecap="round" />
        <Out x={530} y={480} s={40} fill="#FFF36B" stroke="#0B1033" sw={7} f={MONO} w={700}>-9999</Out>
        <rect x={224} y={410} width={160} height={14} rx={7} fill="#0B1033" opacity={0.5} /><rect x={224} y={410} width={120} height={14} rx={7} fill="#5CFF9A" />
        <path d="M300,1080 C300,860 360,780 430,780 C500,780 560,860 560,1080 Z" fill="#05061A" />
        <circle cx={430} cy={735} r={78} fill="#05061A" />
        <path d="M352,712 C360,640 500,640 508,712" fill="none" stroke="#7FF0FF" strokeWidth={6} opacity={0.8} />
        <Out x={470} y={250} s={150} fill="#FFFFFF" stroke="#0B1033" sw={14} f={MONO} w={700} shadow="#4C7CFF">02:47</Out>
        <Out x={150} y={120} s={44} fill="#FFFFFF" stroke="#0B1033" sw={8} a="start">打游戏</Out>
        <text x={330} y={330} style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700 }} fill="#9FE9FF">23:00 →</text>
      </g>
      {/* right: day, homework */}
      <g clipPath="url(#R)">
        <rect x={860} width={1060} height={1080} fill="url(#day)" />
        <Cloud x={1560} y={360} s={1.1} seed={4} />
        <Cloud x={1150} y={230} s={0.6} seed={9} />
        <rect x={860} y={700} width={1060} height={380} fill="url(#tone)" opacity={0.55} />
        {/* wall clock */}
        <circle cx={1500} cy={640} r={150} fill="#FFFFFF" stroke="#20304F" strokeWidth={10} />
        {Array.from({ length: 12 }, (_, i) => { const t = i * Math.PI / 6; return <line key={i} x1={1500 + 118 * Math.cos(t)} y1={640 + 118 * Math.sin(t)} x2={1500 + 134 * Math.cos(t)} y2={640 + 134 * Math.sin(t)} stroke="#20304F" strokeWidth={i % 3 ? 4 : 8} />; })}
        <line x1={1500} y1={640} x2={1500} y2={540} stroke="#20304F" strokeWidth={8} strokeLinecap="round" />
        <line x1={1500} y1={640} x2={1555} y2={672} stroke="#FF5A5A" strokeWidth={5} strokeLinecap="round" />
        {/* sweat drop + sigh mark */}
        <path d="M1720,470 C1700,500 1700,520 1720,525 C1740,520 1740,500 1720,470 Z" fill="#8FD0FF" stroke="#20304F" strokeWidth={4} />
        <path d="M1090,880 q30,-30 60,0 q30,30 60,0 q30,-30 60,0" fill="none" stroke="#20304F" strokeWidth={6} strokeLinecap="round" />
        <Out x={1500} y={960} s={120} fill="#FFFFFF" stroke="#20304F" sw={12} f={MONO} w={700}>20:10</Out>
        <Out x={1840} y={120} s={44} fill="#FFFFFF" stroke="#20304F" sw={8} a="end">写作业</Out>
        <text x={1340} y={1035} style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700 }} fill="#20304F">20:00 →</text>
      </g>
      {/* gutter */}
      <path d="M990,0 L1010,0 L870,1080 L850,1080 Z" fill="#FFFFFF" />
      <path d="M990,0 L850,1080 M1010,0 L870,1080" stroke="#111" strokeWidth={5} />
      <rect x={4} y={4} width={1912} height={1072} fill="none" stroke="#111" strokeWidth={8} />
    </svg>
  );
};

/* ---- 2: impact frame for 85% ---- */
const V2: React.FC = () => (
  <svg width={1920} height={1080}>
    <defs><radialGradient id="hit" cx="50%" cy="50%" r="60%"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.35" stopColor="#FFF4C2" /><stop offset="1" stopColor="#FFD23F" /></radialGradient></defs>
    <rect width={1920} height={1080} fill="url(#hit)" />
    <Shuchu cx={960} cy={520} r0={430} n={240} seed={7} col="#111111" />
    <Shuchu cx={960} cy={520} r0={520} n={90} seed={13} col="#E63946" o={0.85} />
    {/* burst */}
    <path d={Array.from({ length: 28 }, (_, i) => { const a = i / 28 * Math.PI * 2, rr = i % 2 ? 300 : 380; return `${i ? 'L' : 'M'}${960 + rr * Math.cos(a)},${520 + rr * 0.72 * Math.sin(a)}`; }).join(' ') + ' Z'} fill="#FFFFFF" stroke="#111" strokeWidth={10} strokeLinejoin="round" />
    <Out x={960} y={610} s={300} fill="#E63946" stroke="#111" sw={22} f={MONO} w={700} shadow="#111" rot={-4}>85%</Out>
    <Out x={960} y={850} s={64} fill="#FFFFFF" stroke="#111" sw={12} rot={-4}>学得最快的正确率！</Out>
    <Out x={260} y={180} s={40} fill="#111" stroke="#FFFFFF" sw={8} a="start" rot={-8}>2019 · 数学模型</Out>
  </svg>
);

/* ---- 3: the flow sky (eyecatch / title) ---- */
const V3: React.FC = () => {
  const ribbon = (k: number) => {
    const p: string[] = []; for (let i = 0; i <= 60; i++) { const t = i / 60, x = -100 + 2120 * t, y = 760 - 520 * t + 90 * Math.sin(t * 5.5 + k * 0.4) + k * 16; p.push(`${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`); } return p.join(' ');
  };
  return (
    <svg width={1920} height={1080}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E5BD8" /><stop offset="0.55" stopColor="#5AA9F5" /><stop offset="1" stopColor="#D8F0FF" /></linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <rect width={1920} height={1080} fill="url(#sky)" />
      <Cloud x={360} y={980} s={1.1} seed={21} />
      <Cloud x={1560} y={1010} s={1.3} seed={22} />
      <Cloud x={1600} y={300} s={0.7} seed={23} />
      <Cloud x={300} y={300} s={0.55} seed={24} />
      {/* the stream */}
      {Array.from({ length: 9 }, (_, k) => <path key={`g${k}`} d={ribbon(k)} stroke="#FFF6C8" strokeWidth={46} fill="none" opacity={0.3} filter="url(#soft)" />)}
      {Array.from({ length: 9 }, (_, k) => <path key={k} d={ribbon(k)} stroke={k % 3 === 0 ? '#FFFFFF' : k % 3 === 1 ? '#FFE27A' : '#9FF3FF'} strokeWidth={k % 3 === 0 ? 8 : 5} fill="none" strokeLinecap="round" />)}
      {Array.from({ length: 40 }, (_, i) => { const r = rng(i + 40); const t = r(), x = -100 + 2120 * t, y = 760 - 520 * t + 90 * Math.sin(t * 5.5 + 2) + (r() - 0.5) * 160, s = 6 + r() * 14; return <path key={i} d={`M${x},${y - s} L${x + s * 0.25},${y - s * 0.25} L${x + s},${y} L${x + s * 0.25},${y + s * 0.25} L${x},${y + s} L${x - s * 0.25},${y + s * 0.25} L${x - s},${y} L${x - s * 0.25},${y - s * 0.25} Z`} fill="#FFFFFF" opacity={0.6 + r() * 0.4} />; })}
      <Speed x0={-100} x1={2000} y0={80} y1={250} n={20} seed={31} col="#FFFFFF" o={0.5} />
      <Out x={960} y={560} s={230} fill="#FFFFFF" stroke="#16337A" sw={18} f={SERIF} w={700} shadow="#16337A" ls="0.1em">心流</Out>
      <Out x={960} y={660} s={44} fill="#FFFFFF" stroke="#16337A" sw={8} ls="0.6em">F L O W</Out>
    </svg>
  );
};

const FR = [V1, V2, V3];
export const LooksVibe: React.FC = () => { const f = useCurrentFrame(); const C = FR[Math.min(2, f)]; return <AbsoluteFill><C /></AbsoluteFill>; };

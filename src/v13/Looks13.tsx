import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/* ep13 《心流》 gate 2a: three 2D looks × two style frames (hook, key visual = challenge × skill channel).
   frame 0..5 = A1 A2 B1 B2 C1 C2. */
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif', BRUSH = '"Ma Shan Zheng", serif';
const MONO = '"DejaVu Sans Mono", monospace', LATIN = '"Cormorant Garamond", serif';
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const pts = (p: [number, number][]) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const smooth = (p: [number, number][]) => {
  if (p.length < 3) return pts(p);
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
    d += ` Q${p[i][0].toFixed(1)},${p[i][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const l = p[p.length - 1];
  return d + ` L${l[0].toFixed(1)},${l[1].toFixed(1)}`;
};

/* ============ A · 水墨 ink wash on rice paper, one cinnabar accent ============ */
const PAPER = '#F1ECE2', INKC = '#191816', CINNABAR = '#B5332A';
const InkDefs: React.FC = () => (
  <defs>
    <filter id="paperTex" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0.09 0" />
    </filter>
    <filter id="fibers" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.06" numOctaves="2" seed="8" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.34  0 0 0 0 0.26  0 0 0 0.07 0" />
    </filter>
    <filter id="brush" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="11" result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale="16" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="dry" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="4" result="t" />
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.55" result="m" />
      <feComposite in="SourceGraphic" in2="m" operator="in" result="c" />
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="12" result="t2" />
      <feDisplacementMap in="c" in2="t2" scale="10" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="soft" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="15" result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale="5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="wash" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="21" result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale="40" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="d" stdDeviation="5" />
    </filter>
    <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={INKC} stopOpacity="0.95" /><stop offset="0.55" stopColor={INKC} stopOpacity="0.35" /><stop offset="1" stopColor={INKC} stopOpacity="0" /></linearGradient>
    <radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#3a2a18" stopOpacity="0.22" /></radialGradient>
  </defs>
);
const Paper: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill={PAPER} />
    <rect width={1920} height={1080} filter="url(#paperTex)" />
    <rect width={1920} height={1080} filter="url(#fibers)" />
  </>
);
const ridge = (seed: number, x0: number, x1: number, base: number, amp: number, n: number) => {
  const r = rng(seed); const p: [number, number][] = [[x0, base + 200]];
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n, env = Math.sin(Math.PI * i / n);
    p.push([x, base - amp * env * (0.45 + 0.55 * r()) - (i % 2 ? amp * 0.18 * r() : 0)]);
  }
  p.push([x1, base + 200]);
  return smooth(p) + ' Z';
};
const Seal: React.FC<{ x: number; y: number; s?: number; txt: string }> = ({ x, y, s = 84, txt }) => (
  <g transform={`translate(${x},${y})`} filter="url(#brush)">
    <rect x={0} y={0} width={s} height={s} rx={6} fill={CINNABAR} />
    <text x={s / 2} y={s * 0.47} textAnchor="middle" style={{ fontFamily: BRUSH, fontSize: s * 0.42 }} fill={PAPER}>{txt[0]}</text>
    <text x={s / 2} y={s * 0.88} textAnchor="middle" style={{ fontFamily: BRUSH, fontSize: s * 0.42 }} fill={PAPER}>{txt[1]}</text>
  </g>
);
/** a dry-brush circle (enso) built from many offset arcs */
const Enso: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => {
  const R = rng(5); const arcs: React.ReactNode[] = [];
  for (let k = 0; k < 26; k++) {
    const a0 = -1.1 + R() * 0.12, a1 = a0 + Math.PI * 2 * (0.84 + R() * 0.05);
    const p: [number, number][] = [];
    for (let i = 0; i <= 90; i++) {
      const a = a0 + (a1 - a0) * i / 90, wob = (R() - 0.5) * 1.5 + (k - 13) * 0.9 * (1 - 0.6 * i / 90);
      p.push([cx + (r + wob) * Math.cos(a), cy + (r + wob) * Math.sin(a)]);
    }
    arcs.push(<path key={k} d={smooth(p)} stroke={INKC} strokeWidth={2.4 + R() * 3} fill="none" opacity={0.35 + R() * 0.5} strokeLinecap="round" />);
  }
  return <g filter="url(#dry)">{arcs}</g>;
};
const A1: React.FC = () => (
  <svg width={1920} height={1080}>
    <InkDefs /><Paper />
    {/* inside the enso: dawn behind far mountains */}
    <defs><clipPath id="ensoClip"><circle cx={760} cy={540} r={318} /></clipPath></defs>
    <g clipPath="url(#ensoClip)">
      <circle cx={850} cy={555} r={74} fill={CINNABAR} opacity={0.82} filter="url(#wash)" />
      <path d={ridge(31, 380, 1150, 640, 150, 9)} fill="url(#mtn)" opacity={0.28} filter="url(#wash)" />
      <path d={ridge(32, 400, 1120, 700, 180, 7)} fill="url(#mtn)" opacity={0.5} filter="url(#wash)" />
      <path d={ridge(33, 360, 1160, 790, 160, 11)} fill="url(#mtn)" opacity={0.85} filter="url(#brush)" />
      {/* mist band */}
      <rect x={380} y={690} width={780} height={60} fill={PAPER} opacity={0.6} filter="url(#wash)" />
    </g>
    <Enso cx={760} cy={540} r={330} />
    {/* vertical text, right to left */}
    <g style={{ fontFamily: BRUSH, fontSize: 150 }} fill={INKC}>
      {[...'一抬头'].map((c, i) => <text key={c} x={1470} y={300 + i * 158} textAnchor="middle">{c}</text>)}
      {[...'天亮了'].map((c, i) => <text key={c} x={1290} y={420 + i * 158} textAnchor="middle">{c}</text>)}
    </g>
    <Seal x={1530} y={790} txt="心流" />
    <text x={1215} y={940} style={{ fontFamily: LATIN, fontStyle: 'italic', fontSize: 34, letterSpacing: '0.08em' }} fill={INKC} opacity={0.6}>23:12 — 05:47</text>
    <rect width={1920} height={1080} fill="url(#vig)" />
  </svg>
);
const A2: React.FC = () => {
  const O: [number, number] = [330, 930], X1 = 1650, Y1 = 130;
  const R = rng(9);
  // the river: a bundle of water lines along the diagonal
  const water = Array.from({ length: 13 }, (_, k) => {
    const off = (k - 6) * 9 + (R() - 0.5) * 4, p: [number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, x = O[0] + (1560 - O[0]) * t, y = O[1] - (O[1] - 170) * t;
      const w = Math.sin(t * 6.5 + k * 0.9) * 9 + Math.sin(t * 17 + k * 2.1) * 3, sp = 1 + 0.35 * Math.sin(t * 4 + 1.3);
      p.push([x - off * sp * 0.6 + w * 0.6, y - off * sp * 0.8 + w * 0.8]);
    }
    return <path key={k} d={smooth(p)} stroke={INKC} strokeWidth={k % 4 === 0 ? 3.2 : 1.6} fill="none" opacity={0.2 + 0.6 * (1 - Math.abs(k - 6) / 7)} strokeLinecap="round" strokeDasharray={k % 3 === 1 ? '140 18 60 12' : undefined} />;
  });
  const dotT = 0.62, dx = O[0] + (1560 - O[0]) * dotT, dy = O[1] - (O[1] - 170) * dotT;
  return (
    <svg width={1920} height={1080}>
      <InkDefs /><Paper />
      {/* anxiety: dense crags in the upper-left */}
      <defs><clipPath id="hard"><path d={`M${O[0] + 8},${Y1 - 40} L${O[0] + 8},${O[1] - 60} L${1500},${Y1 - 40} Z`} /></clipPath></defs>
      <g clipPath="url(#hard)">
        <path d={ridge(41, 300, 1300, 560, 300, 14)} fill="url(#mtn)" opacity={0.3} filter="url(#wash)" />
        <path d={ridge(42, 300, 1100, 650, 420, 12)} fill="url(#mtn)" opacity={0.55} filter="url(#brush)" />
        <path d={ridge(43, 300, 900, 800, 470, 10)} fill="url(#mtn)" opacity={0.9} filter="url(#brush)" />
        <path d={ridge(44, 300, 700, 900, 380, 8)} fill={INKC} opacity={0.92} filter="url(#dry)" />
      </g>
      {/* boredom: almost nothing, a few flat wash lines */}
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${880 + i * 60},${860 - i * 62} L${1640},${860 - i * 62}`} stroke={INKC} strokeWidth={3} opacity={0.22} filter="url(#brush)" />)}
      <path d={`M${O[0] - 30},${O[1] - 10} L1560,150 L1600,210 L${O[0] + 40},${O[1] + 20} Z`} fill={INKC} opacity={0.07} filter="url(#wash)" />
      <g filter="url(#soft)">{water}</g>
      {/* you */}
      <circle cx={dx} cy={dy} r={15} fill={CINNABAR} filter="url(#brush)" />
      {/* axes, one brush stroke each */}
      <g filter="url(#dry)" stroke={INKC} strokeLinecap="round" fill="none">
        <path d={`M${O[0]},${O[1]} L${O[0] + 3},${Y1}`} strokeWidth={6} />
        <path d={`M${O[0]},${O[1]} L${X1},${O[1] - 4}`} strokeWidth={6} />
      </g>
      <g style={{ fontFamily: BRUSH }} fill={INKC}>
        <text x={O[0] - 42} y={Y1 + 60} textAnchor="middle" style={{ fontSize: 46 }}>挑</text>
        <text x={O[0] - 42} y={Y1 + 110} textAnchor="middle" style={{ fontSize: 46 }}>战</text>
        <text x={X1 - 40} y={O[1] + 64} textAnchor="middle" style={{ fontSize: 46 }}>能力</text>
        <text x={1010} y={250} style={{ fontSize: 96 }} fill={PAPER} stroke={INKC} strokeWidth={0}>{''}</text>
        <text x={560} y={250} textAnchor="middle" style={{ fontSize: 110 }} fill={INKC}>焦虑</text>
        <text x={1360} y={780} textAnchor="middle" style={{ fontSize: 96 }} opacity={0.42}>无聊</text>
      </g>
      <g transform={`translate(${dx + 70},${dy - 40}) rotate(-35)`}>
        <text style={{ fontFamily: BRUSH, fontSize: 110 }} fill={CINNABAR}>心流</text>
      </g>
      <rect width={1920} height={1080} fill="url(#vig)" />
    </svg>
  );
};

/* ============ B · 流线 thousands of lines on deep ink; the chart is made of line behaviour ============ */
const BG_B = '#07090D';
const B1: React.FC = () => {
  const R = rng(17); const lines: React.ReactNode[] = [];
  for (let i = 0; i < 420; i++) {
    let x = -60 + R() * 260, y = R() * 1080; const tgt = 560 + (R() - 0.5) * 120 * (0.3 + R());
    const p: [number, number][] = [[x, y]]; let ang = (R() - 0.5) * 2.6;
    for (let s = 0; s < 150 && x < 1990; s++) {
      const focus = Math.min(1, Math.max(0, (x - 150) / 900)) ** 1.4;
      const want = Math.atan2(tgt - y, 260);
      ang += (Math.sin(x * 0.011 + i) * 0.3 + (R() - 0.5) * 0.45) * (1 - focus) * 0.8;
      ang = ang * (1 - 0.08 - 0.18 * focus) + want * 0.18 * focus;
      x += 14 * Math.cos(ang); y += 14 * Math.sin(ang); p.push([x, y]);
    }
    lines.push(<path key={i} d={smooth(p)} stroke="url(#gB1)" strokeWidth={0.7 + R() * 1.1} fill="none" opacity={0.18 + R() * 0.45} />);
  }
  return (
    <svg width={1920} height={1080}>
      <defs>
        <linearGradient id="gB1" x1="0" x2="1920" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5A6475" /><stop offset="0.45" stopColor="#A9B2BF" /><stop offset="0.72" stopColor="#FFD08A" /><stop offset="1" stopColor="#FFF4E0" /></linearGradient>
        <radialGradient id="bgB" cx="62%" cy="52%" r="70%"><stop offset="0" stopColor="#141A24" /><stop offset="1" stopColor={BG_B} /></radialGradient>
        <filter id="glowB"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width={1920} height={1080} fill="url(#bgB)" />
      <g style={{ mixBlendMode: 'screen' }} filter="url(#glowB)">{lines}</g>
      <text x={120} y={820} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: '0.04em' }} fill="#F4F1EA">一抬头，</text>
      <text x={120} y={940} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 104, letterSpacing: '0.04em' }} fill="#FFD08A">天亮了。</text>
      <text x={124} y={690} style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.3em' }} fill="#8B95A5">23:12 → 05:47</text>
    </svg>
  );
};
const B2: React.FC = () => {
  const O: [number, number] = [330, 930], E: [number, number] = [1640, 140];
  const R = rng(23);
  const L = Math.hypot(E[0] - O[0], E[1] - O[1]), ux = (E[0] - O[0]) / L, uy = (E[1] - O[1]) / L, nx = uy, ny = -ux; // n points to lower-right
  const flow = Array.from({ length: 150 }, (_, k) => {
    const off = (R() - 0.5) * 120, ph = R() * 6, p: [number, number][] = [];
    for (let i = 0; i <= 80; i++) { const t = -0.05 + 1.1 * i / 80, w = Math.sin(t * 9 + ph) * 4; p.push([O[0] + ux * L * t + nx * (off + w), O[1] + uy * L * t + ny * (off + w)]); }
    return <path key={k} d={smooth(p)} stroke="url(#gFlow)" strokeWidth={0.6 + R() * 1.2} fill="none" opacity={0.25 + R() * 0.6 * (1 - Math.abs(off) / 70)} />;
  });
  const tangled = Array.from({ length: 90 }, (_, k) => {
    let x = O[0] + 40 + R() * 900, y = 160 + R() * 700, a = R() * 6.28; const p: [number, number][] = [[x, y]];
    for (let s = 0; s < 70; s++) { a += Math.sin(s * 0.5 + k) * 0.7 + (R() - 0.5) * 1.4; x += 9 * Math.cos(a); y += 9 * Math.sin(a); p.push([x, y]); }
    return <path key={k} d={smooth(p)} stroke="#FF5A3C" strokeWidth={0.8 + R()} fill="none" opacity={0.18 + R() * 0.4} />;
  });
  const slack = Array.from({ length: 22 }, (_, k) => {
    const y = 300 + k * 30 + R() * 6, x0 = Math.max(O[0] + 60, 1640 - (930 - y) * 1.66 + 120);
    return <path key={k} d={`M${x0},${y} L1700,${y + 2}`} stroke="#4C5563" strokeWidth={1.2} opacity={0.55} />;
  });
  const dt = 0.6, dx = O[0] + ux * L * dt, dy = O[1] + uy * L * dt;
  return (
    <svg width={1920} height={1080}>
      <defs>
        <linearGradient id="gFlow" x1={O[0]} y1={O[1]} x2={E[0]} y2={E[1]} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#B98B4E" /><stop offset="0.6" stopColor="#FFD08A" /><stop offset="1" stopColor="#FFF4E0" /></linearGradient>
        <radialGradient id="bgB2" cx="50%" cy="50%" r="75%"><stop offset="0" stopColor="#121722" /><stop offset="1" stopColor={BG_B} /></radialGradient>
        <clipPath id="upL"><path d={`M${O[0]},${O[1]} L${O[0]},${E[1]} L${E[0]},${E[1]} Z`} transform={`translate(${-nx * 80},${-ny * 80})`} /></clipPath>
        <clipPath id="loR"><path d={`M${O[0]},${O[1]} L${E[0]},${O[1]} L${E[0]},${E[1]} Z`} transform={`translate(${nx * 80},${ny * 80})`} /></clipPath>
        <filter id="glowB2"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <radialGradient id="dotB"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.25" stopColor="#FFE2B0" stopOpacity="0.9" /><stop offset="1" stopColor="#FFB060" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#bgB2)" />
      <g clipPath="url(#upL)" style={{ mixBlendMode: 'screen' }}>{tangled}</g>
      <g clipPath="url(#loR)">{slack}</g>
      <g style={{ mixBlendMode: 'screen' }} filter="url(#glowB2)">{flow}</g>
      <circle cx={dx} cy={dy} r={60} fill="url(#dotB)" />
      <g stroke="#C9CED6" strokeWidth={2} opacity={0.75}>
        <line x1={O[0]} y1={O[1]} x2={O[0]} y2={110} /><line x1={O[0]} y1={O[1]} x2={1700} y2={O[1]} />
      </g>
      <g style={{ fontFamily: SANS, fontWeight: 700 }}>
        <text x={O[0] - 24} y={150} textAnchor="end" style={{ fontSize: 30 }} fill="#C9CED6">挑战</text>
        <text x={1700} y={O[1] + 52} textAnchor="end" style={{ fontSize: 30 }} fill="#C9CED6">能力</text>
        <text x={520} y={330} style={{ fontSize: 64 }} fill="#FF7A5C">焦虑</text>
        <text x={524} y={372} style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.5em' }} fill="#FF7A5C" opacity={0.7}>ANXIETY</text>
        <text x={1330} y={800} style={{ fontSize: 64 }} fill="#7C8696">无聊</text>
        <text x={1334} y={842} style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.5em' }} fill="#7C8696" opacity={0.8}>BOREDOM</text>
        <g transform={`translate(${dx + 60},${dy + 90}) rotate(-31)`}>
          <text style={{ fontSize: 64 }} fill="#FFE2B0">心流</text>
          <text y={40} style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.5em' }} fill="#FFE2B0" opacity={0.8}>FLOW</text>
        </g>
      </g>
    </svg>
  );
};

/* ============ C · 版式 Swiss poster: huge type, flat fields, one signal orange ============ */
const BONE = '#ECE8DF', INK_C = '#121212', ORANGE = '#FF4D17', GREY_C = '#C9C4BA';
const C1: React.FC = () => (
  <svg width={1920} height={1080}>
    <rect width={1920} height={1080} fill={BONE} />
    <circle cx={1530} cy={430} r={250} fill={ORANGE} />
    <text x={-30} y={780} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 560, letterSpacing: '-0.04em', fontFeatureSettings: "'tnum' 1" }} fill={INK_C}>05:47</text>
    <line x1={120} y1={200} x2={1800} y2={200} stroke={INK_C} strokeWidth={3} />
    <text x={120} y={170} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: '0.12em' }} fill={INK_C}>23:12 开了一局</text>
    <text x={1800} y={170} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.3em' }} fill={INK_C}>FLOW / 心流</text>
    <text x={120} y={960} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 92, letterSpacing: '0.02em' }} fill={INK_C}>一抬头，天亮了。</text>
  </svg>
);
const C2: React.FC = () => {
  const zig: [number, number][] = [];
  for (let i = 0; i <= 18; i++) { const t = i / 18; zig.push([0 + t * 1920 * 0.98 + (i % 2 ? 26 : -26), 1080 - t * 1080 * 1.05 + (i % 2 ? -30 : 30)]); }
  // diagonal band from bottom-left to top-right
  const band = 'M-40,1170 L-40,1000 L1920,-120 L2000,-120 L2000,40 Z';
  return (
    <svg width={1920} height={1080}>
      <rect width={1920} height={1080} fill={GREY_C} />
      {/* anxiety: black field with a jagged edge */}
      <path d={`M0,0 L1920,0 L${zig.map(([x, y]) => `${x - 140},${y - 150}`).reverse().join(' L')} Z`} fill={INK_C} />
      {/* flow band */}
      <path d={band} fill={ORANGE} transform="translate(0,40)" />
      <text x={110} y={330} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 260 }} fill={BONE}>焦虑</text>
      <text x={1810} y={990} textAnchor="end" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 260 }} fill="#B2ACA1">无聊</text>
      <g transform="translate(860,700) rotate(-29.5)">
        <text x={0} y={0} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: '0.1em' }} fill={INK_C}>心流</text>
      </g>
      <circle cx={1180} cy={402} r={22} fill={INK_C} />
      <line x1={1180 - 160} y1={402 + 92} x2={1180 - 30} y2={402 + 17} stroke={INK_C} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
      <text x={60} y={1040} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em' }} fill={INK_C}>能力 →</text>
      <text x={1860} y={60} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em' }} fill={BONE}>↑ 挑战</text>
    </svg>
  );
};

const FR = [A1, A2, B1, B2, C1, C2];
export const Looks13: React.FC = () => {
  const f = useCurrentFrame();
  const C = FR[Math.min(5, f)];
  return <AbsoluteFill><C /></AbsoluteFill>;
};

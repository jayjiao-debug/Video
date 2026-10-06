import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';

/* ep13 direction A in a magazine / collage look: newsprint, torn photo cut-outs, serif headlines,
   red marker annotations, tape. Three style frames: 0 hook · 1 the 85% · 2 the work paradox. */
const SERIF = '"Noto Serif CJK SC", serif', NUM = '"Cormorant Garamond", serif', HAND = '"Ma Shan Zheng", serif', TYPE = '"DejaVu Sans Mono", monospace';
const P = { paper: '#EEE8DA', paper2: '#E4DCCB', ink: '#141414', red: '#D52B1E', grey: '#6E675C' };
const rng = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
/** rectangle with torn edges (as a path), local coords 0..w, 0..h */
const torn = (w: number, h: number, seed: number, a = 9, step = 14) => {
  const r = rng(seed); const pts: string[] = [];
  for (let x = 0; x <= w; x += step) pts.push(`${x},${(r() - 0.5) * a}`);
  for (let y = 0; y <= h; y += step) pts.push(`${w + (r() - 0.5) * a},${y}`);
  for (let x = w; x >= 0; x -= step) pts.push(`${x},${h + (r() - 0.5) * a}`);
  for (let y = h; y >= 0; y -= step) pts.push(`${(r() - 0.5) * a},${y}`);
  return 'M' + pts.join(' L') + ' Z';
};
/** a marker loop around a box, slightly overshooting like a real pen */
const loop = (cx: number, cy: number, rx: number, ry: number, seed: number) => {
  const r = rng(seed); const pts: string[] = [];
  for (let i = 0; i <= 64; i++) { const t = -0.4 + (Math.PI * 2 + 0.7) * i / 64, k = 1 + (r() - 0.5) * 0.05 + 0.04 * i / 64; pts.push(`${(cx + rx * k * Math.cos(t)).toFixed(1)},${(cy + ry * k * Math.sin(t)).toFixed(1)}`); }
  return 'M' + pts.join(' L');
};
const Defs: React.FC = () => (
  <defs>
    <filter id="paperN" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="2" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.26  0 0 0 0 0.2  0 0 0 0.12 0" />
    </filter>
    <filter id="blotch" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="9" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0.16 0" />
    </filter>
    <filter id="bw"><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncR type="gamma" amplitude="1.25" exponent="0.75" offset="-0.02" /><feFuncG type="gamma" amplitude="1.25" exponent="0.75" offset="-0.02" /><feFuncB type="gamma" amplitude="1.25" exponent="0.75" offset="-0.02" /></feComponentTransfer></filter>
    <filter id="duo"><feColorMatrix type="saturate" values="0" /><feComponentTransfer>
      <feFuncR type="table" tableValues="0.08 0.42 1.0" /><feFuncG type="table" tableValues="0.11 0.55 0.97" /><feFuncB type="table" tableValues="0.22 0.8 0.92" />
    </feComponentTransfer></filter>
    <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="marker" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale="6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#3a2a10" floodOpacity="0.28" /></filter>
    <filter id="grainF" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3" />
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0" />
    </filter>
  </defs>
);
const Paper: React.FC = () => (
  <>
    <rect width={1920} height={1080} fill={P.paper} />
    <rect width={1920} height={1080} filter="url(#blotch)" />
    <rect width={1920} height={1080} filter="url(#paperN)" />
    <line x1={962} y1={0} x2={958} y2={1080} stroke="#000" strokeOpacity={0.05} strokeWidth={3} />
  </>
);
const Masthead: React.FC<{ right: string }> = ({ right }) => (
  <g>
    <line x1={70} y1={64} x2={1850} y2={64} stroke={P.ink} strokeWidth={3} />
    <line x1={70} y1={72} x2={1850} y2={72} stroke={P.ink} strokeWidth={1} />
    <text x={70} y={48} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em' }} fill={P.ink}>VIBE 知识大赏</text>
    <text x={1850} y={48} textAnchor="end" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em' }} fill={P.ink}>{right}</text>
  </g>
);
/** a torn photo print with optional tape */
const Photo: React.FC<{ href: string; x: number; y: number; w: number; h: number; rot: number; seed: number; filter: string; crop?: { x: number; y: number; w: number; h: number }; tape?: boolean }> = ({ href, x, y, w, h, rot, seed, filter, crop = { x: 0, y: 0, w: 1536, h: 1024 }, tape = true }) => {
  const id = `ph${seed}`;
  const sx = w / crop.w, sy = h / crop.h, s = Math.max(sx, sy);
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      <defs><clipPath id={id}><path d={torn(w, h, seed)} /></clipPath></defs>
      <path d={torn(w + 24, h + 24, seed + 1, 7)} transform="translate(-12,-12)" fill="#F7F3EA" filter="url(#shadow)" />
      <g clipPath={`url(#${id})`}>
        <image href={staticFile(href)} x={-crop.x * s} y={-crop.y * s} width={1536 * s} height={1024 * s} filter={filter} preserveAspectRatio="none" />
        <rect width={w} height={h} filter="url(#grainF)" />
      </g>
      {tape && <rect x={w * 0.12} y={-26} width={150} height={46} fill="#F3E9C6" opacity={0.78} transform={`rotate(-6 ${w * 0.12} -26)`} />}
      {tape && <rect x={w * 0.78} y={-22} width={150} height={46} fill="#F3E9C6" opacity={0.78} transform={`rotate(5 ${w * 0.78} -22)`} />}
    </g>
  );
};
const Hand: React.FC<{ x: number; y: number; s: number; rot?: number; children: React.ReactNode; a?: 'start' | 'middle' | 'end' }> = ({ x, y, s, rot = 0, children, a = 'middle' }) =>
  <text x={x} y={y} textAnchor={a} transform={`rotate(${rot} ${x} ${y})`} style={{ fontFamily: HAND, fontSize: s }} fill={P.red} filter="url(#marker)">{children}</text>;

const M1: React.FC = () => (
  <svg width={1920} height={1080}>
    <Defs /><Paper /><Masthead right="第 13 期 · 心流" />
    <Photo href="ep13/game.jpg" x={95} y={150} w={820} h={540} rot={-2.2} seed={11} filter="url(#duo)" />
    <Photo href="ep13/homework.jpg" x={1005} y={190} w={820} h={520} rot={1.8} seed={23} filter="url(#bw)" crop={{ x: 640, y: 0, w: 896, h: 570 }} />
    {/* headlines */}
    <g style={{ fontFamily: SERIF, fontWeight: 700 }} fill={P.ink} filter="url(#ink)">
      <text x={110} y={800} style={{ fontSize: 40, letterSpacing: '0.2em' }}>打游戏</text>
      <text x={104} y={960} style={{ fontFamily: NUM, fontWeight: 700, fontSize: 168, fontStyle: 'italic' }}>3 h</text>
      <text x={330} y={950} style={{ fontSize: 64 }}>像</text>
      <text x={420} y={960} style={{ fontFamily: NUM, fontWeight: 700, fontSize: 168, fontStyle: 'italic' }}>10 min</text>
      <text x={1010} y={800} style={{ fontSize: 40, letterSpacing: '0.2em' }}>写作业</text>
      <text x={1004} y={960} style={{ fontFamily: NUM, fontWeight: 700, fontSize: 168, fontStyle: 'italic' }}>10 min</text>
      <text x={1428} y={950} style={{ fontSize: 64 }}>像</text>
      <text x={1520} y={960} style={{ fontFamily: NUM, fontWeight: 700, fontSize: 168, fontStyle: 'italic' }}>3 h</text>
    </g>
    <path d={loop(1610, 905, 120, 82, 4)} stroke={P.red} strokeWidth={7} fill="none" strokeLinecap="round" filter="url(#marker)" />
    <path d={loop(610, 905, 200, 82, 6)} stroke={P.red} strokeWidth={7} fill="none" strokeLinecap="round" filter="url(#marker)" />
    <Hand x={960} y={1036} s={64} rot={-2}>同一个脑子？</Hand>
  </svg>
);

const M2: React.FC = () => {
  // graph paper scrap with a hand-drawn learning curve
  const gx = 140, gy = 220, gw = 760, gh = 600;
  const curve = Array.from({ length: 60 }, (_, i) => {
    const a = 0.5 + 0.5 * i / 59; let lo = 0, hi = 6; const Phi = (z: number) => 0.5 * (1 + Math.tanh(0.7978845608 * (z + 0.044715 * z ** 3)));
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (Phi(m) < a) lo = m; else hi = m; }
    const d = (lo + hi) / 2, y = d * Math.exp(-d * d / 2) / Math.exp(-0.5);
    return `${(70 + (gw - 140) * i / 59).toFixed(1)},${(gh - 90 - (gh - 200) * y).toFixed(1)}`;
  });
  const pk = 70 + (gw - 140) * (0.8413 - 0.5) / 0.5, pky = 110;
  return (
    <svg width={1920} height={1080}>
      <Defs /><Paper /><Masthead right="为什么偏偏是 85%" />
      <g transform={`translate(${gx},${gy}) rotate(-2.5)`} filter="url(#shadow)">
        <path d={torn(gw, gh, 31, 10)} fill="#F8F6EE" />
        <g opacity={0.35}>{Array.from({ length: 30 }, (_, i) => <line key={`v${i}`} x1={i * 26} y1={0} x2={i * 26} y2={gh} stroke="#7FA3C7" strokeWidth={1} />)}{Array.from({ length: 24 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 26} x2={gw} y2={i * 26} stroke="#7FA3C7" strokeWidth={1} />)}</g>
        <g filter="url(#ink)" stroke={P.ink} fill="none" strokeLinecap="round">
          <path d={`M70,${gh - 90} L${gw - 50},${gh - 90}`} strokeWidth={4} />
          <path d={`M70,${gh - 90} L70,60`} strokeWidth={4} />
          <path d={'M' + curve.join(' L')} strokeWidth={6} />
          <path d={`M${pk},${pky} L${pk},${gh - 90}`} strokeWidth={2.5} strokeDasharray="10 10" />
        </g>
        <text x={gw - 50} y={gh - 8} textAnchor="end" style={{ fontFamily: HAND, fontSize: 36 }} fill={P.ink}>正确率</text>
        <text x={90} y={60} style={{ fontFamily: HAND, fontSize: 36 }} fill={P.ink}>学得多快</text>
        <text x={70} y={gh - 44} textAnchor="middle" style={{ fontFamily: NUM, fontSize: 30, fontWeight: 700 }} fill={P.ink}>50%</text>
        <text x={gw - 70} y={gh - 44} textAnchor="middle" style={{ fontFamily: NUM, fontSize: 30, fontWeight: 700 }} fill={P.ink}>100%</text>
        <path d={loop(pk, pky, 46, 40, 8)} stroke={P.red} strokeWidth={6} fill="none" filter="url(#marker)" />
        <text x={70 + 30} y={gh - 120} style={{ fontFamily: HAND, fontSize: 40 }} fill={P.red}>瞎猜</text>
        <text x={gw - 200} y={gh - 120} style={{ fontFamily: HAND, fontSize: 40 }} fill={P.red}>太简单</text>
      </g>
      {/* headline column */}
      <g filter="url(#ink)">
        <text x={1010} y={250} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.24em' }} fill={P.red}>2019 · NATURE COMMUNICATIONS</text>
        <text x={990} y={540} style={{ fontFamily: NUM, fontWeight: 700, fontSize: 360, fontStyle: 'italic', letterSpacing: '-0.02em' }} fill={P.ink}>85%</text>
        <text x={1010} y={700} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 70 }} fill={P.ink}>学得最快的正确率</text>
        <line x1={1010} y1={730} x2={1840} y2={730} stroke={P.ink} strokeWidth={2} />
        <text x={1010} y={790} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32 }} fill={P.grey}>全对，学不到新东西；只对一半，跟瞎猜差不多。</text>
        <text x={1010} y={842} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32 }} fill={P.grey}>数学模型算出：最好的点在中间偏右。</text>
      </g>
      <path d="M1000,600 C1200,628 1500,582 1830,606" stroke={P.red} strokeWidth={14} strokeOpacity={0.85} fill="none" strokeLinecap="round" filter="url(#marker)" />
      <Hand x={1640} y={980} s={58} rot={-4}>错一两成，刚刚好</Hand>
    </svg>
  );
};

const M3: React.FC = () => (
  <svg width={1920} height={1080}>
    <Defs /><Paper /><Masthead right="上班 vs 下班" />
    <Photo href="ep13/pager.jpg" x={110} y={150} w={700} h={460} rot={-3} seed={41} filter="url(#bw)" crop={{ x: 200, y: 200, w: 1100, h: 720 }} />
    <Photo href="ep13/tv.jpg" x={1180} y={590} w={620} h={410} rot={2.4} seed={57} filter="url(#bw)" crop={{ x: 200, y: 180, w: 1150, h: 760 }} />
    {/* typed tag */}
    <g transform="translate(150,670) rotate(-1.5)" filter="url(#shadow)">
      <rect width={600} height={74} fill="#F6F1E4" />
      <text x={24} y={48} style={{ fontFamily: TYPE, fontSize: 26, fontWeight: 700 }} fill={P.ink}>芝加哥 · 78 位上班族 · 传呼机 · 一周</text>
    </g>
    <g filter="url(#ink)">
      <text x={900} y={250} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, letterSpacing: '0.2em' }} fill={P.ink}>上班时，处在心流里</text>
      <text x={880} y={470} style={{ fontFamily: NUM, fontWeight: 700, fontSize: 270, fontStyle: 'italic' }} fill={P.ink}>54%</text>
      <text x={130} y={850} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, letterSpacing: '0.2em' }} fill={P.ink}>下班后</text>
      <text x={110} y={1030} style={{ fontFamily: NUM, fontWeight: 700, fontSize: 220, fontStyle: 'italic' }} fill={P.grey}>17%</text>
    </g>
    <path d={loop(1100, 400, 250, 105, 12)} stroke={P.red} strokeWidth={7} fill="none" strokeLinecap="round" filter="url(#marker)" />
    <Hand x={1560} y={300} s={60} rot={6}>反而更高？</Hand>
    <path d="M1520,320 C1470,360 1420,380 1370,385" stroke={P.red} strokeWidth={6} fill="none" strokeLinecap="round" filter="url(#marker)" />
    <path d="M1385,368 L1366,386 L1392,394" stroke={P.red} strokeWidth={6} fill="none" strokeLinecap="round" filter="url(#marker)" />
    <Hand x={620} y={960} s={52} rot={-3}>很放松，也很被动</Hand>
  </svg>
);

const FR = [M1, M2, M3];
export const LooksM: React.FC = () => { const f = useCurrentFrame(); const C = FR[Math.min(2, f)]; return <AbsoluteFill><C /></AbsoluteFill>; };

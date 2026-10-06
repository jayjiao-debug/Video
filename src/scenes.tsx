import React from 'react';
import { rnd, lerp } from './lib';

/* Hand-built sets for 《没走的路》 (no generated images): every plate is drawn here in SVG, 1920×1080, in one grade
   (teal shadows, amber light). Key points match the overlays in shots.tsx: walker figure (811, 700), hourglass neck
   (628, 400), fork junction (922, 600), corridor door (662, 540), spotlight pool (941, 740), sun on the earth limb
   (1354, 331). Each set takes T for small life (fog, rain, flicker, sand) — never acted actions. */

type S = React.FC<{ T: number; id: string }>;
const W = 1920, H = 1080;

/** a tree silhouette: trunk + a canopy of overlapping blobs */
const Tree: React.FC<{ x: number; y: number; h: number; seed: number; fill: string; conifer?: boolean }> = ({ x, y, h, seed, fill, conifer }) => {
  if (conifer) {
    const tiers = 7;
    return (
      <g fill={fill}>
        <rect x={x - h * 0.02} y={y - h * 0.15} width={h * 0.04} height={h * 0.15} />
        {Array.from({ length: tiers }, (_, i) => {
          const t = i / tiers, w = h * (0.34 - 0.27 * t) * (0.9 + 0.2 * rnd(seed, i));
          const ty = y - h * 0.1 - t * h * 0.88;
          return <path key={i} d={`M ${x - w} ${ty} L ${x} ${ty - h * 0.24} L ${x + w} ${ty} Z`} />;
        })}
      </g>
    );
  }
  return (
    <g fill={fill}>
      <path d={`M ${x - h * 0.025} ${y} L ${x - h * 0.012} ${y - h * 0.55} L ${x + h * 0.012} ${y - h * 0.55} L ${x + h * 0.025} ${y} Z`} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = rnd(seed, i) * Math.PI * 2, r = h * (0.08 + 0.18 * rnd(seed, i + 30));
        return <circle key={i} cx={x + Math.cos(a) * h * 0.2 * rnd(seed, i + 60)} cy={y - h * 0.68 + Math.sin(a) * h * 0.18 * rnd(seed, i + 90)} r={r} />;
      })}
    </g>
  );
};

const Rays: React.FC<{ x: number; y: number; n: number; len: number; spread: number; dir: number; color: string; o: number; seed: number }> = ({ x, y, n, len, spread, dir, color, o, seed }) => (
  <g style={{ mixBlendMode: 'screen' }}>
    {Array.from({ length: n }, (_, i) => {
      const a = dir + (i / (n - 1) - 0.5) * spread + (rnd(seed, i) - 0.5) * 0.05, w = 0.012 + 0.03 * rnd(seed, i + 9);
      const p1 = [x + Math.cos(a - w) * len, y + Math.sin(a - w) * len], p2 = [x + Math.cos(a + w) * len, y + Math.sin(a + w) * len];
      return <path key={i} d={`M ${x} ${y} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} Z`} fill={color} opacity={o * (0.4 + 0.6 * rnd(seed, i + 20))} />;
    })}
  </g>
);

// ------------------------------------------------------------------ 1. a figure on a foggy road
export const Walker: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8d9690" /><stop offset="0.45" stopColor="#cfc6a6" /><stop offset="0.62" stopColor="#7c8780" /><stop offset="1" stopColor="#151c1e" /></linearGradient>
      <radialGradient id={`${id}-sun`} cx="0.12" cy="0.36" r="0.45"><stop offset="0" stopColor="#fff2c8" stopOpacity="0.95" /><stop offset="0.25" stopColor="#f4c879" stopOpacity="0.5" /><stop offset="1" stopColor="#f4c879" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-road`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a8f88" /><stop offset="1" stopColor="#262b2c" /></linearGradient>
      <linearGradient id={`${id}-fog`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6dcc0" stopOpacity="0" /><stop offset="0.5" stopColor="#e6dcc0" stopOpacity="0.55" /><stop offset="1" stopColor="#e6dcc0" stopOpacity="0" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-sky)`} />
    <rect width={W} height={H} fill={`url(#${id}-sun)`} />
    {/* far trees (pale) */}
    {Array.from({ length: 12 }, (_, i) => <Tree key={`f${i}`} x={500 + i * 110 + rnd(i, 1) * 60} y={700} h={260 + rnd(i, 2) * 120} seed={i + 40} fill="rgba(110,120,112,0.55)" />)}
    <rect x={0} y={520} width={W} height={260} fill={`url(#${id}-fog)`} />
    {/* ground */}
    <path d={`M 0 690 L ${W} 700 L ${W} ${H} L 0 ${H} Z`} fill="#1f2826" />
    <path d={`M 0 690 L 780 700 L 0 760 Z`} fill="#3b3e2c" opacity={0.6} />
    {/* road, curving into the fog */}
    <path d={`M 360 ${H} C 520 900, 700 760, 800 705 L 905 700 C 980 760, 1200 900, 1580 ${H} Z`} fill={`url(#${id}-road)`} />
    <path d={`M 360 ${H} C 520 900, 700 760, 800 705`} stroke="#c9b27a" strokeOpacity={0.35} strokeWidth={6} fill="none" />
    {/* near trees */}
    {[[-40, 1020, 980, 1], [180, 980, 760, 2], [330, 900, 520, 3], [1500, 990, 900, 4], [1720, 1030, 1050, 5], [1260, 900, 600, 6], [1880, 960, 800, 7]].map(([x, y, h, s]) => (
      <Tree key={s} x={x} y={y} h={h} seed={s * 13} fill="#141b1c" />
    ))}
    <Rays x={230} y={390} n={9} len={1500} spread={0.7} dir={0.32} color="#f6dca0" o={0.12 + 0.03 * Math.sin(T * 0.7)} seed={5} />
    <rect x={0} y={600 + Math.sin(T * 0.3) * 8} width={W} height={200} fill={`url(#${id}-fog)`} opacity={0.6} />
    {/* the figure, standing */}
    <g transform={`translate(811 700) scale(1, ${1 + 0.004 * Math.sin(T * 2.2)})`} fill="#121718">
      <circle cx={0} cy={-170} r={17} />
      <path d="M -26 -150 Q 0 -160 26 -150 L 30 -75 L 18 -70 L 15 0 L 4 0 L 0 -62 L -4 0 L -15 0 L -18 -70 L -30 -75 Z" />
    </g>
    <ellipse cx={811} cy={702} rx={40} ry={5} fill="#0c1112" opacity={0.5} />
  </svg>
);

// ------------------------------------------------------------------ 2. an hourglass on a table
export const Hourglass: S = ({ T, id }) => {
  const cx = 628;
  const bulb = (top: boolean) => {
    const y0 = top ? 140 : 400, y1 = top ? 400 : 660, s = top ? 1 : -1;
    const yA = top ? y0 : y1, yB = top ? y1 : y0;
    return `M ${cx - 150} ${yA} C ${cx - 160} ${yA + s * 120}, ${cx - 30} ${yB - s * 60}, ${cx - 8} ${yB} L ${cx + 8} ${yB} C ${cx + 30} ${yB - s * 60}, ${cx + 160} ${yA + s * 120}, ${cx + 150} ${yA} Z`;
  };
  const sandTop = 0.55 - 0.02 * ((T * 0.05) % 1);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2a2e" /><stop offset="0.6" stopColor="#0f1a1c" /><stop offset="1" stopColor="#0a0f10" /></linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2414" /><stop offset="1" stopColor="#1a0f08" /></linearGradient>
        <radialGradient id={`${id}-win`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#d8e6e2" stopOpacity="0.75" /><stop offset="0.6" stopColor="#9fb8b8" stopOpacity="0.25" /><stop offset="1" stopColor="#9fb8b8" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#cfe6ea" stopOpacity="0.35" /><stop offset="0.2" stopColor="#cfe6ea" stopOpacity="0.06" /><stop offset="0.8" stopColor="#cfe6ea" stopOpacity="0.04" /><stop offset="1" stopColor="#cfe6ea" stopOpacity="0.25" /></linearGradient>
        <linearGradient id={`${id}-sand`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2d39a" /><stop offset="1" stopColor="#b98a4a" /></linearGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5a4320" /><stop offset="0.35" stopColor="#d9b26a" /><stop offset="0.6" stopColor="#8a6a32" /><stop offset="1" stopColor="#3a2a12" /></linearGradient>
        <clipPath id={`${id}-top`}><path d={bulb(true)} /></clipPath>
        <clipPath id={`${id}-bot`}><path d={bulb(false)} /></clipPath>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      {/* window bokeh behind */}
      <rect x={280} y={-60} width={760} height={420} rx={40} fill={`url(#${id}-win)`} />
      <rect x={1150} y={-40} width={600} height={380} rx={40} fill={`url(#${id}-win)`} opacity={0.8} />
      {/* table */}
      <path d={`M 0 600 L ${W} 600 L ${W} ${H} L 0 ${H} Z`} fill={`url(#${id}-wood)`} />
      {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M 0 ${620 + i * 26 + i * i * 0.6} C 600 ${612 + i * 26 + i * i * 0.6}, 1300 ${628 + i * 26 + i * i * 0.6}, ${W} ${618 + i * 26 + i * i * 0.6}`} stroke="#5a3a20" strokeOpacity={0.25} strokeWidth={2} fill="none" />)}
      <ellipse cx={cx + 40} cy={700} rx={420} ry={60} fill="#e9c27a" opacity={0.12} />
      {/* frame + glass */}
      <rect x={cx - 200} y={100} width={16} height={580} fill={`url(#${id}-brass)`} />
      <rect x={cx + 184} y={100} width={16} height={580} fill={`url(#${id}-brass)`} />
      <g clipPath={`url(#${id}-top)`}>
        <path d={`M ${cx - 160} ${140 + 260 * (1 - sandTop)} L ${cx + 160} ${140 + 260 * (1 - sandTop)} L ${cx} 400 Z`} fill={`url(#${id}-sand)`} />
      </g>
      <g clipPath={`url(#${id}-bot)`}>
        <path d={`M ${cx - 170} 660 L ${cx - 120} 640 Q ${cx} 520 ${cx + 120} 640 L ${cx + 170} 660 Z`} fill={`url(#${id}-sand)`} />
      </g>
      <path d={bulb(true)} fill={`url(#${id}-glass)`} stroke="rgba(220,240,240,0.5)" strokeWidth={2.5} />
      <path d={bulb(false)} fill={`url(#${id}-glass)`} stroke="rgba(220,240,240,0.5)" strokeWidth={2.5} />
      <path d={`M ${cx - 120} 170 C ${cx - 130} 240, ${cx - 90} 300, ${cx - 50} 340`} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d={`M ${cx - 118} 630 C ${cx - 128} 560, ${cx - 90} 500, ${cx - 50} 460`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* caps */}
      <ellipse cx={cx} cy={104} rx={235} ry={22} fill={`url(#${id}-brass)`} />
      <rect x={cx - 235} y={80} width={470} height={24} fill={`url(#${id}-brass)`} />
      <ellipse cx={cx} cy={80} rx={235} ry={22} fill="#e2bd76" />
      <rect x={cx - 250} y={668} width={500} height={40} fill={`url(#${id}-brass)`} />
      <ellipse cx={cx} cy={668} rx={250} ry={24} fill="#e2bd76" />
      <ellipse cx={cx} cy={708} rx={250} ry={24} fill="#4a3618" />
    </svg>
  );
};

// ------------------------------------------------------------------ 3. a fork in the road, from above
export const Fork: S = ({ T, id }) => {
  const J = [922, 600];
  const branch = (ex: number, ey: number, wNear: number, wFar: number) => {
    const c1 = [J[0] + (ex - J[0]) * 0.25, J[1] - 120], c2 = [ex + (J[0] - ex) * 0.15, ey + 60];
    // a ribbon: offset the centre line by ±w
    return `M ${J[0] - wNear} ${J[1]} C ${c1[0] - wNear} ${c1[1]}, ${c2[0] - wFar} ${c2[1]}, ${ex - wFar} ${ey} L ${ex + wFar} ${ey} C ${c2[0] + wFar} ${c2[1]}, ${c1[0] + wNear} ${c1[1]}, ${J[0] + wNear} ${J[1]} Z`;
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`${id}-land`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d8478" /><stop offset="0.3" stopColor="#4a4a36" /><stop offset="1" stopColor="#1e1c14" /></linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.05" cy="0.2" r="0.7"><stop offset="0" stopColor="#ffe9b8" stopOpacity="0.9" /><stop offset="0.3" stopColor="#e9b46a" stopOpacity="0.45" /><stop offset="1" stopColor="#e9b46a" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9c8c4" stopOpacity="0.95" /><stop offset="0.35" stopColor="#b9c8c4" stopOpacity="0.35" /><stop offset="0.6" stopColor="#b9c8c4" stopOpacity="0" /></linearGradient>
        <linearGradient id={`${id}-asph`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6c706c" /><stop offset="1" stopColor="#2a2c2c" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-land)`} />
      {/* fields texture */}
      {Array.from({ length: 46 }, (_, i) => { const y = 300 + Math.pow(i / 46, 1.4) * 780; return <path key={i} d={`M 0 ${y} C 500 ${y - 20 - rnd(i, 2) * 30}, 1400 ${y + 20 + rnd(i, 3) * 30}, ${W} ${y - 10}`} stroke={i % 3 ? '#2e2a1a' : '#6a5e3a'} strokeOpacity={0.35} strokeWidth={6 + i * 0.5} fill="none" />; })}
      {/* verges catching the light */}
      <path d={`M 860 ${H} C 880 820, 900 700, 905 600`} stroke="#c9a253" strokeOpacity={0.55} strokeWidth={26} fill="none" />
      {/* roads */}
      <path d={`M 860 ${H} L 990 ${H} L ${J[0] + 32} ${J[1]} L ${J[0] - 32} ${J[1]} Z`} fill={`url(#${id}-asph)`} />
      <path d={branch(430, 320, 32, 12)} fill={`url(#${id}-asph)`} />
      <path d={branch(1480, 320, 32, 12)} fill={`url(#${id}-asph)`} />
      <path d={branch(1480, 320, 40, 16)} fill="none" stroke="#e8b866" strokeOpacity={0.35} strokeWidth={4} />
      <path d={branch(430, 320, 40, 16)} fill="none" stroke="#9fb8c0" strokeOpacity={0.25} strokeWidth={3} />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={922 + (1 - i / 8) * 3 - 3} y={1040 - i * 55} width={6} height={26 - i * 2} fill="#e8c35a" opacity={0.85} />)}
      <rect width={W} height={H} fill={`url(#${id}-haze)`} />
      <rect width={W} height={H} fill={`url(#${id}-sun)`} style={{ mixBlendMode: 'screen' }} />
      <rect x={0} y={280 + Math.sin(T * 0.25) * 10} width={W} height={120} fill="#c9d4d0" opacity={0.18} />
    </svg>
  );
};

// ------------------------------------------------------------------ 4. an unsent letter on a desk
export const Letter: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <linearGradient id={`${id}-desk`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2c1c12" /><stop offset="0.6" stopColor="#1c130c" /><stop offset="1" stopColor="#0e0a08" /></linearGradient>
      <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe2a8" stopOpacity="0" /><stop offset="0.3" stopColor="#ffe2a8" stopOpacity="0.32" /><stop offset="0.7" stopColor="#ffd28a" stopOpacity="0.28" /><stop offset="1" stopColor="#ffd28a" stopOpacity="0" /></linearGradient>
      <linearGradient id={`${id}-env`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3ecdc" /><stop offset="1" stopColor="#b9b2a2" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-desk)`} />
    {Array.from({ length: 26 }, (_, i) => <path key={i} d={`M -100 ${i * 50 - 200} L ${W + 100} ${i * 50 + 500}`} stroke="#4a2e18" strokeOpacity={0.22} strokeWidth={2 + rnd(i, 1) * 3} />)}
    <rect width={W} height={H} fill="#1c3a44" opacity={0.25} />
    {/* the beam */}
    <path d="M -100 120 L 380 -40 L 1900 900 L 1500 1180 Z" fill={`url(#${id}-beam)`} style={{ mixBlendMode: 'screen' }} />
    {/* the pen */}
    <g transform="rotate(-18 380 380)">
      <rect x={20} y={360} width={620} height={46} rx={23} fill="#1d2a34" />
      <rect x={20} y={364} width={620} height={10} rx={5} fill="#5b7182" opacity={0.6} />
      <rect x={300} y={358} width={26} height={50} fill="#c9a253" />
      <path d="M 640 362 L 720 383 L 640 404 Z" fill="#c9a253" />
    </g>
    {/* the envelope, closed */}
    <g transform="translate(330 330) rotate(-6)">
      <rect x={0} y={0} width={1360} height={600} rx={8} fill="#0a0806" opacity={0.45} transform="translate(26 30)" />
      <rect x={0} y={0} width={1360} height={600} rx={8} fill={`url(#${id}-env)`} />
      <path d="M 0 0 L 680 330 L 1360 0" fill="none" stroke="#8f887a" strokeWidth={4} />
      <path d="M 0 600 L 560 260 M 1360 600 L 800 260" fill="none" stroke="#a49d8e" strokeWidth={2.5} strokeOpacity={0.6} />
    </g>
    <rect width={W} height={H} fill="#0c1a20" opacity={0.18} />
    {Array.from({ length: 40 }, (_, i) => {
      const f = (rnd(i, 3) + T * 0.02 * (0.5 + rnd(i, 4))) % 1;
      return <circle key={i} cx={lerp(100, 1700, f)} cy={lerp(60, 1000, f) + Math.sin(T + i) * 20 - 200 + rnd(i, 5) * 300} r={1 + rnd(i, 6) * 2} fill="#ffe6b8" opacity={0.35} />;
    })}
  </svg>
);

// ------------------------------------------------------------------ 5. a single road to the horizon
export const Road: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f6266" /><stop offset="0.7" stopColor="#8aa09a" /><stop offset="1" stopColor="#b8b08e" /></linearGradient>
      <linearGradient id={`${id}-field`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b5a32" /><stop offset="1" stopColor="#2a2010" /></linearGradient>
      <linearGradient id={`${id}-road`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7b7d78" /><stop offset="1" stopColor="#1f2122" /></linearGradient>
      <radialGradient id={`${id}-sun`} cx="0" cy="0.45" r="0.6"><stop offset="0" stopColor="#ffe3a6" stopOpacity="0.8" /><stop offset="1" stopColor="#ffe3a6" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={W} height={560} fill={`url(#${id}-sky)`} />
    <rect width={W} height={H} fill={`url(#${id}-sun)`} />
    {/* forest on the right horizon */}
    {Array.from({ length: 26 }, (_, i) => <Tree key={i} x={1000 + i * 40} y={560} h={120 + rnd(i, 3) * 170 + i * 6} seed={i + 200} fill="#16211f" conifer />)}
    {Array.from({ length: 16 }, (_, i) => <Tree key={`l${i}`} x={i * 60} y={560} h={60 + rnd(i, 4) * 50} seed={i + 300} fill="rgba(40,52,48,0.7)" />)}
    <path d={`M 0 556 L ${W} 556 L ${W} ${H} L 0 ${H} Z`} fill={`url(#${id}-field)`} />
    {Array.from({ length: 40 }, (_, i) => {
      const y = 570 + Math.pow(i / 40, 1.8) * 510;
      return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke={i % 2 ? '#8a7440' : '#3a2e16'} strokeOpacity={0.35} strokeWidth={1 + i * 0.12} />;
    })}
    <path d={`M 930 556 L 990 556 L 1520 ${H} L 400 ${H} Z`} fill={`url(#${id}-road)`} />
    <path d={`M 930 556 L 400 ${H}`} stroke="#d9b45c" strokeOpacity={0.6} strokeWidth={10} />
    <path d={`M 990 556 L 1520 ${H}`} stroke="#9a8a5a" strokeOpacity={0.4} strokeWidth={8} />
    <path d={`M 955 600 L 940 ${H}`} stroke="#f0d79a" strokeOpacity={0.18} strokeWidth={80} />
    <rect x={0} y={480 + Math.sin(T * 0.3) * 6} width={W} height={120} fill="#c9d4c8" opacity={0.25} />
  </svg>
);

// ------------------------------------------------------------------ 6. a corridor, one door open at the end
export const Corridor: S = ({ T, id }) => {
  const V = [900, 480]; // vanishing point
  const far = { x0: 760, x1: 1040, y0: 330, y1: 650 };
  const wallL = `M 0 0 L ${far.x0} ${far.y0} L ${far.x0} ${far.y1} L 0 ${H} Z`, wallR = `M ${W} 0 L ${far.x1} ${far.y0} L ${far.x1} ${far.y1} L ${W} ${H} Z`;
  const door = (side: number, t: number, key: string) => {
    // a door on a side wall between depth t (0 near … 1 far)
    const xA = side < 0 ? lerp(0, far.x0, t) : lerp(W, far.x1, t), xB = side < 0 ? lerp(0, far.x0, t + 0.12) : lerp(W, far.x1, t + 0.12);
    const top = (x: number) => lerp(0, far.y0, side < 0 ? x / far.x0 : (W - x) / (W - far.x1)) + 120 * (1 - (side < 0 ? x / far.x0 : (W - x) / (W - far.x1)));
    const bot = (x: number) => lerp(H, far.y1, side < 0 ? x / far.x0 : (W - x) / (W - far.x1));
    return <path key={key} d={`M ${xA} ${top(xA)} L ${xB} ${top(xB)} L ${xB} ${bot(xB)} L ${xA} ${bot(xA)} Z`} fill="#0d1416" stroke="#3a4a4c" strokeWidth={3} />;
  };
  const D = { x: 600, y: 380, w: 130, h: 285 }; // the open door (left wall, far end), centre ≈ (662, 540)
  const flick = 0.92 + 0.08 * Math.sin(T * 7) * Math.sin(T * 2.3);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`${id}-wl`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0f1d22" /><stop offset="1" stopColor="#3c5458" /></linearGradient>
        <linearGradient id={`${id}-wr`} x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#0c171a" /><stop offset="1" stopColor="#33494c" /></linearGradient>
        <linearGradient id={`${id}-fl`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#0a1012" /><stop offset="1" stopColor="#3a4644" /></linearGradient>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe2a2" stopOpacity="0.85" /><stop offset="1" stopColor="#ffb860" stopOpacity="0" /></linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffd590" stopOpacity="0.6" /><stop offset="1" stopColor="#ffd590" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#0b1214" />
      <path d={`M 0 0 L ${W} 0 L ${far.x1} ${far.y0} L ${far.x0} ${far.y0} Z`} fill="#121c1f" />
      <path d={`M 0 ${H} L ${W} ${H} L ${far.x1} ${far.y1} L ${far.x0} ${far.y1} Z`} fill={`url(#${id}-fl)`} />
      <path d={wallL} fill={`url(#${id}-wl)`} />
      <path d={wallR} fill={`url(#${id}-wr)`} />
      <rect x={far.x0} y={far.y0} width={far.x1 - far.x0} height={far.y1 - far.y0} fill="#4a5e60" />
      {[0.1, 0.42].map((t, i) => door(-1, t, `l${i}`))}
      {[0.08, 0.36, 0.62].map((t, i) => door(1, t, `r${i}`))}
      {/* the open door: warm room behind, the leaf swung in */}
      <rect x={D.x} y={D.y} width={D.w} height={D.h} fill="#ffe4b0" opacity={flick} />
      <rect x={D.x} y={D.y} width={D.w} height={D.h} fill={`url(#${id}-glow)`} />
      <path d={`M ${D.x + D.w} ${D.y} L ${D.x + D.w + 70} ${D.y - 18} L ${D.x + D.w + 70} ${D.y + D.h + 22} L ${D.x + D.w} ${D.y + D.h} Z`} fill="#b08a58" />
      <path d={`M ${D.x - 6} ${D.y - 6} h ${D.w + 12} v ${D.h + 6} h -6 v ${-D.h} h ${-D.w} v ${D.h} h -6 Z`} fill="#2a2a24" />
      {/* light spilling on the floor */}
      <path d={`M ${D.x} ${D.y + D.h} L ${D.x + D.w} ${D.y + D.h} L 1180 ${H} L 380 ${H} Z`} fill={`url(#${id}-light)`} opacity={0.55 * flick} style={{ mixBlendMode: 'screen' }} />
      <ellipse cx={D.x + D.w / 2} cy={D.y + D.h / 2} rx={260} ry={300} fill={`url(#${id}-glow)`} opacity={0.6 * flick} style={{ mixBlendMode: 'screen' }} />
      <rect x={850} y={22} width={120} height={20} rx={4} fill="#cfd8d6" opacity={0.25} />
      <circle cx={V[0]} cy={V[1]} r={2} fill="#000" opacity={0} />
    </svg>
  );
};

// ------------------------------------------------------------------ 7. someone sitting by a window at dusk
export const Window: S = ({ T, id }) => {
  const breathe = 1 + 0.006 * Math.sin(T * 1.6);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fa6ac" /><stop offset="0.55" stopColor="#c9c8b2" /><stop offset="0.85" stopColor="#f2c49a" /><stop offset="1" stopColor="#e8a878" /></linearGradient>
        <linearGradient id={`${id}-room`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2224" /><stop offset="1" stopColor="#0e1214" /></linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3420" /><stop offset="1" stopColor="#1e140c" /></linearGradient>
        <linearGradient id={`${id}-patch`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd9a8" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd9a8" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-room)`} />
      {/* window */}
      <rect x={340} y={0} width={1320} height={650} fill={`url(#${id}-sky)`} />
      {Array.from({ length: 30 }, (_, i) => {
        const x = 340 + i * 44, h = 30 + rnd(i, 7) * 110;
        return <rect key={i} x={x} y={650 - h} width={40 + rnd(i, 8) * 30} height={h} fill="#5c6a70" opacity={0.6} />;
      })}
      {Array.from({ length: 14 }, (_, i) => <circle key={`l${i}`} cx={360 + rnd(i, 9) * 1280} cy={560 + rnd(i, 10) * 80} r={2} fill="#ffe2a0" opacity={0.6 + 0.4 * Math.sin(T * 2 + i)} />)}
      <path d="M 340 0 h 1320 v 650 h -1320 Z M 360 20 v 610 h 1280 v -610 Z" fill="#ece0cc" fillRule="evenodd" opacity={0.85} />
      {[670, 990, 1310].map((x) => <rect key={x} x={x - 9} y={0} width={18} height={650} fill="#ece0cc" opacity={0.85} />)}
      <rect x={300} y={640} width={1400} height={22} fill="#d8ccb8" opacity={0.7} />
      {/* floor with window light */}
      <path d={`M 0 790 L ${W} 790 L ${W} ${H} L 0 ${H} Z`} fill={`url(#${id}-floor)`} />
      <path d={`M 0 662 L ${W} 662 L ${W} 790 L 0 790 Z`} fill="#2a2420" />
      <path d="M 420 790 L 1600 790 L 1820 1080 L 260 1080 Z" fill={`url(#${id}-patch)`} style={{ mixBlendMode: 'screen' }} />
      {[700, 1020, 1340].map((x) => <path key={x} d={`M ${x - 8} 790 L ${x + 8} 790 L ${x + 60} 1080 L ${x + 20} 1080 Z`} fill="#1e140c" opacity={0.7} />)}
      {/* the chair and the sitter (still) */}
      <g fill="#14100e">
        <path d="M 500 560 Q 500 500 550 498 L 880 498 Q 930 500 930 560 L 940 860 L 490 860 Z" />
        <rect x={500} y={860} width={14} height={110} transform="rotate(8 507 860)" />
        <rect x={910} y={860} width={14} height={110} transform="rotate(-8 917 860)" />
        <g transform={`translate(700 470) scale(1 ${breathe}) translate(-700 -470)`}>
          <ellipse cx={712} cy={372} rx={40} ry={48} />
          <path d="M 690 416 L 735 416 L 740 438 Z" />
          <path d="M 618 470 Q 640 430 712 428 Q 790 432 808 476 L 826 640 L 600 640 Z" />
          <path d="M 686 330 Q 712 318 744 334 Q 752 350 748 362 Q 724 344 690 352 Z" fill="#2a2420" />
        </g>
        <path d="M 820 700 L 1100 760 L 1150 830 L 1090 840 L 1050 790 L 820 780 Z" />
        <path d="M 1050 790 L 1080 960 L 1160 975 L 1150 940 L 1110 930 L 1090 800 Z" />
      </g>
      <rect width={W} height={H} fill="#ffb070" opacity={0.05} />
    </svg>
  );
};

// ------------------------------------------------------------------ 8. an empty stage, one spotlight
export const Stage: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <linearGradient id={`${id}-cur`} x1="0" y1="0" x2="1" y2="0">
        {Array.from({ length: 24 }, (_, i) => <stop key={i} offset={i / 23} stopColor={i % 2 ? '#1c1a18' : '#2c2622'} />)}
      </linearGradient>
      <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2614" /><stop offset="1" stopColor="#5a3c20" /></linearGradient>
      <linearGradient id={`${id}-cone`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dff0f4" stopOpacity="0.55" /><stop offset="1" stopColor="#dff0f4" stopOpacity="0.18" /></linearGradient>
      <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#f2fbff" stopOpacity="0.95" /><stop offset="0.7" stopColor="#d8ecf2" stopOpacity="0.6" /><stop offset="1" stopColor="#d8ecf2" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={W} height={720} fill={`url(#${id}-cur)`} />
    <rect width={W} height={720} fill="#000" opacity={0.35} />
    <path d={`M 0 700 L ${W} 700 L ${W} 840 L 0 840 Z`} fill={`url(#${id}-floor)`} />
    {Array.from({ length: 30 }, (_, i) => <line key={i} x1={i * 70 - 100} y1={700} x2={(i * 70 - 100 - 960) * 1.3 + 960} y2={840} stroke="#22160a" strokeOpacity={0.5} strokeWidth={2} />)}
    <rect x={0} y={836} width={W} height={20} fill="#120c08" />
    {/* cone + pool */}
    <path d={`M 900 0 L 982 0 L 1230 740 L 652 740 Z`} fill={`url(#${id}-cone)`} style={{ mixBlendMode: 'screen' }} opacity={0.85 + 0.05 * Math.sin(T * 3)} />
    <ellipse cx={941} cy={742} rx={300} ry={42} fill={`url(#${id}-pool)`} />
    {Array.from({ length: 60 }, (_, i) => {
      const y = ((rnd(i, 1) * 740 + T * 12 * (0.5 + rnd(i, 2))) % 740);
      const span = lerp(40, 290, y / 740);
      return <circle key={i} cx={941 + (rnd(i, 3) - 0.5) * 2 * span} cy={y} r={1 + rnd(i, 4) * 1.8} fill="#ffffff" opacity={0.35} />;
    })}
    {/* seats */}
    {[860, 920, 990].map((y, r) => Array.from({ length: 14 - r }, (_, i) => {
      const w = 120 + r * 14, x = (i - (13 - r) / 2) * (w + 18) + 960;
      return <rect key={`${r}-${i}`} x={x - w / 2} y={y} width={w} height={90} rx={26} fill={['#4a1214', '#56161a', '#621a1e'][r]} stroke="#2a080a" strokeWidth={3} />;
    }))}
    <rect x={0} y={850} width={W} height={230} fill="#000" opacity={0.25} />
  </svg>
);

// ------------------------------------------------------------------ 9. a night platform, a train leaving
export const Train: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1a24" /><stop offset="1" stopColor="#1d3442" /></linearGradient>
      <linearGradient id={`${id}-plat`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3a34" /><stop offset="1" stopColor="#0e1012" /></linearGradient>
      <radialGradient id={`${id}-lamp`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe6b0" stopOpacity="0.9" /><stop offset="1" stopColor="#ffe6b0" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-streak`} x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#ffffff" stopOpacity="0.9" /><stop offset="1" stopColor="#ffe0a0" stopOpacity="0" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-sky)`} />
    {/* parked train (left), receding */}
    <path d="M 0 140 L 600 420 L 600 600 L 0 900 Z" fill="#33424a" />
    <path d="M 0 140 L 600 420 L 600 432 L 0 170 Z" fill="#5c6e78" />
    <path d="M 0 250 L 600 470 L 600 520 L 0 400 Z" fill="#d8e8e4" opacity={0.42} />
    {Array.from({ length: 10 }, (_, i) => { const x = i * 62; return <line key={i} x1={x} y1={250 + x * 0.367} x2={x} y2={400 + x * 0.2} stroke="#33424a" strokeWidth={8 - i * 0.5} />; })}
    <path d="M 0 560 L 600 560 L 600 566 L 0 600 Z" fill="#c9a253" opacity={0.6} />
    {/* platform */}
    <path d={`M 0 900 L 600 600 L 1000 600 L 1500 ${H} L 0 ${H} Z`} fill={`url(#${id}-plat)`} />
    <path d="M 600 600 L 0 900" stroke="#d8b24a" strokeWidth={8} opacity={0.6} />
    <path d={`M 1000 600 L 1500 ${H}`} stroke="#d8b24a" strokeWidth={10} opacity={0.6} />
    {/* lamps */}
    {[0, 1, 2, 3, 4].map((k) => {
      const s = Math.pow(0.68, k), x = 760 + (1 - s) * 60 - s * 120, top = 600 - 560 * s;
      return (
        <g key={k}>
          <rect x={x} y={top} width={10 * s + 2} height={560 * s} fill="#1a1e20" />
          <ellipse cx={x + 5} cy={top} rx={180 * s + 20} ry={180 * s + 20} fill={`url(#${id}-lamp)`} />
          <ellipse cx={x + 5} cy={600 + (600 - top) * 0.6} rx={30 * s + 6} ry={140 * s + 10} fill="#ffdca0" opacity={0.18} />
        </g>
      );
    })}
    {/* the moving train: light streaks */}
    <path d={`M 1000 600 L ${W} 360 L ${W} 820 L 1000 640 Z`} fill="#26323a" opacity={0.85} />
    {Array.from({ length: 16 }, (_, i) => {
      const f = ((T * 1.8 + rnd(i, 2)) % 1), y = 380 + rnd(i, 3) * 420;
      const x1 = W - f * 1400;
      return <path key={i} d={`M ${x1} ${y} L ${x1 + 700} ${y - 30} L ${x1 + 700} ${y - 24} L ${x1} ${y + 4} Z`} fill={`url(#${id}-streak)`} opacity={0.35 + 0.4 * rnd(i, 4)} />;
    })}
    {/* rain */}
    {Array.from({ length: 120 }, (_, i) => {
      const x = rnd(i, 5) * W, y = ((rnd(i, 6) * H + T * 900) % (H + 100)) - 50;
      return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 26} stroke="#b8d0dc" strokeOpacity={0.25} strokeWidth={1.5} />;
    })}
    {/* reflections on the wet platform */}
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={700 + i * 40} y={760 + i * 30} width={14} height={120 + i * 20} fill="#ffdca0" opacity={0.08} />)}
  </svg>
);

// ------------------------------------------------------------------ 10. the night side of the earth
const CITIES = Array.from({ length: 520 }, (_, i) => {
  const cluster = Math.floor(rnd(i, 1) * 14);
  const cx = 160 + rnd(cluster, 2) * 1600, cy = 520 + rnd(cluster, 3) * 480;
  const r = 30 + rnd(i, 4) * 140 * (rnd(i, 5) < 0.3 ? 2 : 1);
  const a = rnd(i, 6) * Math.PI * 2;
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.6, s: 0.6 + rnd(i, 7) * 2.4 };
});
export const Earth: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <radialGradient id={`${id}-planet`} cx="0.5" cy="0.06" r="0.9"><stop offset="0" stopColor="#1c3346" /><stop offset="0.3" stopColor="#0c1824" /><stop offset="1" stopColor="#04080c" /></radialGradient>
      <radialGradient id={`${id}-flare`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffffff" stopOpacity="1" /><stop offset="0.15" stopColor="#ffe6b0" stopOpacity="0.9" /><stop offset="0.5" stopColor="#ffb860" stopOpacity="0.25" /><stop offset="1" stopColor="#ffb860" stopOpacity="0" /></radialGradient>
      <clipPath id={`${id}-clip`}><circle cx={960} cy={2700} r={2420} /></clipPath>
    </defs>
    <rect width={W} height={H} fill="#020305" />
    {Array.from({ length: 140 }, (_, i) => <circle key={i} cx={rnd(i, 11) * W} cy={rnd(i, 12) * 330} r={0.6 + rnd(i, 13) * 1.2} fill="#ffffff" opacity={0.3 + 0.5 * rnd(i, 14)} />)}
    <circle cx={960} cy={2700} r={2440} fill="none" stroke="#5aa8ff" strokeOpacity={0.35} strokeWidth={40} />
    <circle cx={960} cy={2700} r={2425} fill="none" stroke="#8fd0ff" strokeOpacity={0.7} strokeWidth={8} />
    <g clipPath={`url(#${id}-clip)`}>
      <circle cx={960} cy={2700} r={2420} fill={`url(#${id}-planet)`} />
      {Array.from({ length: 18 }, (_, i) => <ellipse key={i} cx={rnd(i, 21) * W} cy={330 + rnd(i, 22) * 300} rx={120 + rnd(i, 23) * 300} ry={20 + rnd(i, 24) * 40} fill="#9fb4c4" opacity={0.08} />)}
      {CITIES.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.s} fill="#ffc870" opacity={0.55 + 0.35 * Math.sin(T * 0.8 + i)} />)}
      {CITIES.filter((_, i) => i % 9 === 0).map((c, i) => <circle key={`g${i}`} cx={c.x} cy={c.y} r={c.s * 6} fill="#ffb050" opacity={0.08} />)}
    </g>
    <circle cx={1354} cy={331} r={260} fill={`url(#${id}-flare)`} style={{ mixBlendMode: 'screen' }} />
    {[0, 1, 2, 3].map((k) => <rect key={k} x={1354 - 260} y={329} width={520} height={4} fill="#fff4d8" opacity={0.6} transform={`rotate(${k * 45 + T * 2} 1354 331)`} />)}
  </svg>
);

// ------------------------------------------------------------------ 11. a pier at blue hour, one lamp
export const Pier: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c4a52" /><stop offset="1" stopColor="#7c968e" /></linearGradient>
      <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a6a6c" /><stop offset="1" stopColor="#0e2026" /></linearGradient>
      <radialGradient id={`${id}-lamp`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff0c8" stopOpacity="1" /><stop offset="0.2" stopColor="#ffd890" stopOpacity="0.5" /><stop offset="1" stopColor="#ffd890" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={W} height={650} fill={`url(#${id}-sky)`} />
    <rect y={640} width={W} height={440} fill={`url(#${id}-sea)`} />
    {Array.from({ length: 30 }, (_, i) => <line key={i} x1={0} y1={660 + i * i * 0.45 + i * 6} x2={W} y2={660 + i * i * 0.45 + i * 6} stroke="#a8c4c0" strokeOpacity={0.06 + 0.04 * Math.sin(T + i)} strokeWidth={1 + i * 0.1} />)}
    {/* pier */}
    <rect x={390} y={642} width={1530} height={12} fill="#1a2426" />
    <rect x={390} y={630} width={1530} height={4} fill="#1a2426" />
    {Array.from({ length: 34 }, (_, i) => <rect key={i} x={400 + i * 46} y={634} width={3} height={10} fill="#1a2426" />)}
    {Array.from({ length: 22 }, (_, i) => { const x = 405 + i * 72 + rnd(i, 3) * 20; return <rect key={i} x={x} y={652} width={9 + i * 0.3} height={50 + i * 2.2} fill="#152022" />; })}
    {/* lamp + reflection */}
    <rect x={508} y={590} width={4} height={50} fill="#1a2426" />
    <circle cx={510} cy={588} r={7} fill="#fff4d8" />
    <circle cx={510} cy={588} r={90} fill={`url(#${id}-lamp)`} opacity={0.9 + 0.1 * Math.sin(T * 5)} />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={500 + Math.sin(T * 1.5 + i) * 6} y={700 + i * 22} width={20 - i * 0.6} height={8} rx={4} fill="#ffd890" opacity={0.5 - i * 0.03} />)}
    <rect y={560 + Math.sin(T * 0.3) * 5} width={W} height={140} fill="#b8ccc6" opacity={0.12} />
  </svg>
);

export const SETS: Record<string, S> = { walker: Walker, hourglass: Hourglass, fork: Fork, letter: Letter, road: Road, corridor: Corridor, window: Window, stage: Stage, train: Train, earth: Earth, pier: Pier };

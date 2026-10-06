import React from 'react';
import { rnd, lerp, prog, easeOut, easeIn, easeInOut, expoInOut, clamp, hit } from './lib';

/* Sets for 《冰下捉鬼》, all drawn in code (no generated images). Polar night palette: navy black, ice cyan,
   Cherenkov blue, Juno gold for the prize and the numbers. Each set receives the global time T. */

type S = React.FC<{ T: number; id: string }>;
const W = 1920, H = 1080;
export const ICE = '#8fdcff', CHER = '#4fb4ff', GOLD = '#f1c56d';

// ------------------------------------------------------------------ the detector geometry (shared)
/** 86 strings: 78 on a triangular grid (125 m spacing) + 8 DeepCore strings in the middle; 60 DOMs each */
export const STRINGS: [number, number][] = (() => {
  const out: [number, number][] = [];
  const d = 125;
  for (let r = -5; r <= 5; r++) for (let c = -6; c <= 6; c++) {
    const x = c * d + (r % 2 ? d / 2 : 0), z = r * d * 0.866;
    if (Math.hypot(x / 1.05, z) < 560) out.push([x, z]);
  }
  out.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));
  const main = out.slice(0, 78);
  const core = Array.from({ length: 8 }, (_, i) => [Math.cos(i / 8 * Math.PI * 2) * 45, Math.sin(i / 8 * Math.PI * 2) * 45] as [number, number]);
  return [...main, ...core];
})();
export const DOMS_PER = 20; // drawn per string (each drawn DOM stands for 3)
export const Y_TOP = -500, Y_BOT = 500; // 1450 m … 2450 m, centred

/** perspective projection of (x, y, z) metres → screen */
export const project = (x: number, y: number, z: number, yaw: number, pitch: number, dist: number, cx = 960, cy = 540, f = 1100) => {
  const cy1 = Math.cos(yaw), sy1 = Math.sin(yaw);
  let X = x * cy1 - z * sy1, Z = x * sy1 + z * cy1;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const Y = y * cp - Z * sp; Z = y * sp + Z * cp;
  const k = f / (Z + dist);
  return { x: cx + X * k, y: cy + Y * k, k, z: Z };
};

/** the lattice: strings + DOMs, optional per-DOM light function */
export const Lattice: React.FC<{ yaw: number; pitch: number; dist: number; cx?: number; cy?: number; f?: number; o?: number; light?: (x: number, y: number, z: number) => [number, string] | null; strings?: number }> = ({ yaw, pitch, dist, cx = 960, cy = 540, f = 1100, o = 1, light, strings = 86 }) => {
  const items: { z: number; el: React.ReactNode }[] = [];
  STRINGS.slice(0, strings).forEach(([sx, sz], i) => {
    const a = project(sx, Y_TOP - 60, sz, yaw, pitch, dist, cx, cy, f), b = project(sx, Y_BOT, sz, yaw, pitch, dist, cx, cy, f);
    items.push({ z: (a.z + b.z) / 2 + 1, el: <line key={`s${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(170,220,255,0.16)" strokeWidth={Math.max(0.6, a.k * 2)} /> });
    for (let j = 0; j < DOMS_PER; j++) {
      const y = lerp(Y_TOP, Y_BOT, j / (DOMS_PER - 1));
      const p = project(sx, y, sz, yaw, pitch, dist, cx, cy, f);
      const L = light ? light(sx, y, sz) : null;
      const r = Math.max(0.8, p.k * 7);
      items.push({ z: p.z, el: L
        ? <circle key={`d${i}-${j}`} cx={p.x} cy={p.y} r={r * (1 + 3.2 * L[0])} fill={L[1]} opacity={0.35 + 0.65 * L[0]} />
        : <circle key={`d${i}-${j}`} cx={p.x} cy={p.y} r={r} fill="#cfeaff" opacity={0.18 + 0.5 * clamp(p.k)} /> });
    }
  });
  items.sort((a, b) => b.z - a.z);
  return <g opacity={o}>{items.map((it) => it.el)}</g>;
};

const Stars: React.FC<{ n: number; seed: number; h?: number; T?: number }> = ({ n, seed, h = H, T = 0 }) => (
  <g>{Array.from({ length: n }, (_, i) => <circle key={i} cx={rnd(i, seed) * W} cy={rnd(i, seed + 1) * h} r={0.5 + rnd(i, seed + 2) * 1.3} fill="#ffffff" opacity={(0.25 + 0.6 * rnd(i, seed + 3)) * (0.75 + 0.25 * Math.sin(T * 1.7 + i))} />)}</g>
);

// ------------------------------------------------------------------ 1. a body in the neutrino rain
const STREAKS = Array.from({ length: 150 }, (_, i) => ({ y0: rnd(i, 1) * 1500 - 300, sp: 0.5 + rnd(i, 2) * 0.9, ph: rnd(i, 3), w: 0.6 + rnd(i, 4) * 1.6, len: 120 + rnd(i, 5) * 260 }));
export const Body: S = ({ T, id }) => {
  const body = 'M 960 260 m -46 0 a 46 52 0 1 0 92 0 a 46 52 0 1 0 -92 0 M 896 336 Q 960 318 1024 336 L 1060 520 L 1040 600 L 1028 540 L 1022 760 L 1010 900 L 978 900 L 966 660 L 954 660 L 942 900 L 910 900 L 898 760 L 892 540 L 880 600 L 860 520 Z';
  const breathe = 1 + 0.005 * Math.sin(T * 1.8);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.45" r="0.75"><stop offset="0" stopColor="#0f2240" /><stop offset="0.55" stopColor="#071226" /><stop offset="1" stopColor="#020610" /></radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8fdcff" stopOpacity="0.55" /><stop offset="0.2" stopColor="#0a1426" stopOpacity="1" /><stop offset="0.8" stopColor="#0a1426" stopOpacity="1" /><stop offset="1" stopColor="#8fdcff" stopOpacity="0.4" /></linearGradient>
        <clipPath id={`${id}-clip`}><path d={body} /></clipPath>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <Stars n={120} seed={7} T={T} />
      <ellipse cx={960} cy={905} rx={260} ry={26} fill="#4fb4ff" opacity={0.12} />
      <g transform={`translate(960 900) scale(1 ${breathe}) translate(-960 -900)`}>
        <path d={body} fill={`url(#${id}-rim)`} />
        <path d={body} fill="none" stroke="#8fdcff" strokeOpacity={0.35} strokeWidth={2} />
      </g>
      {/* the rain: straight lines from upper left to lower right, passing through everything */}
      {STREAKS.map((s, i) => {
        const f = ((T * s.sp + s.ph) % 1);
        const x = lerp(-400, W + 400, f), y = s.y0 + lerp(-200, 500, f);
        return <line key={i} x1={x} y1={y} x2={x - s.len} y2={y - s.len * 0.32} stroke="#bfe8ff" strokeWidth={s.w} strokeOpacity={0.22} strokeLinecap="round" />;
      })}
      <g clipPath={`url(#${id}-clip)`}>
        {STREAKS.map((s, i) => {
          const f = ((T * s.sp + s.ph) % 1);
          const x = lerp(-400, W + 400, f), y = s.y0 + lerp(-200, 500, f);
          return <line key={i} x1={x} y1={y} x2={x - s.len} y2={y - s.len * 0.32} stroke="#e8f8ff" strokeWidth={s.w * 1.4} strokeOpacity={0.6} strokeLinecap="round" />;
        })}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ 2. the prize: a gold medallion in the dark
export const Prize: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <radialGradient id={`${id}-bg`} cx="0.32" cy="0.5" r="0.7"><stop offset="0" stopColor="#1c1608" /><stop offset="0.5" stopColor="#0a0a0c" /><stop offset="1" stopColor="#030306" /></radialGradient>
      <radialGradient id={`${id}-gold`} cx="0.38" cy="0.32" r="0.75"><stop offset="0" stopColor="#fff2c8" /><stop offset="0.35" stopColor="#f1c56d" /><stop offset="0.75" stopColor="#b8862e" /><stop offset="1" stopColor="#6e4a14" /></radialGradient>
      <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      <clipPath id={`${id}-disc`}><circle cx={600} cy={540} r={300} /></clipPath>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-bg)`} />
    <circle cx={600} cy={540} r={420} fill="#f1c56d" opacity={0.06} />
    <circle cx={600} cy={540} r={300} fill={`url(#${id}-gold)`} />
    <circle cx={600} cy={540} r={268} fill="none" stroke="#8a6020" strokeWidth={4} opacity={0.6} />
    {/* laurel ring */}
    {Array.from({ length: 28 }, (_, i) => {
      const side = i < 14 ? -1 : 1, k = (i % 14) / 13, a = Math.PI / 2 + side * (0.35 + k * 2.3);
      const x = 600 + Math.cos(a) * 205, y = 540 + Math.sin(a) * 205;
      return <ellipse key={i} cx={x} cy={y} rx={24} ry={10} fill="#a77428" opacity={0.75} transform={`rotate(${(a * 180) / Math.PI + 90 + side * 25} ${x} ${y})`} />;
    })}
    <text x={600} y={530} textAnchor="middle" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 700, fontSize: 96, fill: '#7a5418' }}>2026</text>
    <text x={600} y={590} textAnchor="middle" style={{ fontFamily: '"JunoMono", monospace', fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', fill: '#7a5418' }}>PHYSICS</text>
    <g clipPath={`url(#${id}-disc)`}>
      <rect x={lerp(0, 1000, ((T * 0.18) % 1))} y={200} width={160} height={700} fill={`url(#${id}-sheen)`} transform="rotate(20 600 540)" />
    </g>
  </svg>
);

// ------------------------------------------------------------------ 3. the earth in cross-section, a neutrino straight through
export const EarthCut: S = ({ T, id }) => {
  const f = ((T - 15.4) * 0.22) % 1;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.5" r="0.7"><stop offset="0" stopColor="#0a1830" /><stop offset="1" stopColor="#02050c" /></radialGradient>
        <radialGradient id={`${id}-core`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff0b0" /><stop offset="0.5" stopColor="#ffb040" /><stop offset="1" stopColor="#c05010" /></radialGradient>
        <radialGradient id={`${id}-mantle`} cx="0.5" cy="0.5" r="0.5"><stop offset="0.45" stopColor="#c04818" /><stop offset="0.75" stopColor="#7a2a10" /><stop offset="1" stopColor="#3a1408" /></radialGradient>
        <clipPath id={`${id}-cut`}><path d="M 960 540 L 960 160 A 380 380 0 0 1 1340 540 Z" /></clipPath>
        <clipPath id={`${id}-globe`}><circle cx={960} cy={540} r={380} /></clipPath>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <Stars n={160} seed={11} T={T} />
      {/* the globe */}
      <circle cx={960} cy={540} r={380} fill="#14406a" />
      <g clipPath={`url(#${id}-globe)`}>
        {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={640 + rnd(i, 1) * 560} cy={240 + rnd(i, 2) * 560} rx={50 + rnd(i, 3) * 110} ry={30 + rnd(i, 4) * 70} fill="#2e6a3c" opacity={0.8} />)}
        <circle cx={1060} cy={420} r={420} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={260} transform="translate(-180 120)" />
      </g>
      <circle cx={960} cy={540} r={380} fill="none" stroke="#8fdcff" strokeOpacity={0.5} strokeWidth={5} />
      <circle cx={960} cy={540} r={398} fill="none" stroke="#4fb4ff" strokeOpacity={0.15} strokeWidth={26} />
      {/* the cut-away quarter */}
      <g clipPath={`url(#${id}-cut)`}>
        <circle cx={960} cy={540} r={380} fill="#5a2a14" />
        <circle cx={960} cy={540} r={356} fill={`url(#${id}-mantle)`} />
        <circle cx={960} cy={540} r={206} fill="#d8701c" />
        <circle cx={960} cy={540} r={116} fill={`url(#${id}-core)`} />
      </g>
      {/* the neutrino: a straight line through everything, never deflected */}
      <line x1={lerp(200, 1720, f) - 300} y1={lerp(140, 940, f) - 158} x2={lerp(200, 1720, f)} y2={lerp(140, 940, f)} stroke="#e8f8ff" strokeWidth={5} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #8fdcff)' }} />
      <circle cx={lerp(200, 1720, f)} cy={lerp(140, 940, f)} r={8} fill="#ffffff" style={{ filter: 'drop-shadow(0 0 14px #8fdcff)' }} />
      <line x1={200} y1={140} x2={1720} y2={940} stroke="#8fdcff" strokeOpacity={0.15} strokeWidth={2} strokeDasharray="6 10" />
    </svg>
  );
};

// ------------------------------------------------------------------ 4. four lives, one hit
export const Lives: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs><radialGradient id={`${id}-bg`} cx="0.5" cy="0.5" r="0.8"><stop offset="0" stopColor="#0c1a30" /><stop offset="1" stopColor="#02050c" /></radialGradient></defs>
    <rect width={W} height={H} fill={`url(#${id}-bg)`} />
    <Stars n={90} seed={21} T={T} />
    {Array.from({ length: 160 }, (_, i) => {
      const f = ((T * (0.7 + rnd(i, 2)) + rnd(i, 3)) % 1), x = rnd(i, 1) * W;
      return <line key={i} x1={x} y1={lerp(-100, H + 100, f)} x2={x} y2={lerp(-100, H + 100, f) - 90} stroke="#bfe8ff" strokeOpacity={0.12} strokeWidth={1.2} />;
    })}
  </svg>
);

// ------------------------------------------------------------------ 5. the South Pole: surface at polar night, then down into the ice
export const Pole: S = ({ T, id }) => {
  const dive = expoInOut(prog(T, 48.95, 50.5));
  const dy = -lerp(0, 1150, dive);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020814" /><stop offset="0.7" stopColor="#0c2240" /><stop offset="1" stopColor="#2a4c6e" /></linearGradient>
        <linearGradient id={`${id}-snow`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fc0d8" /><stop offset="1" stopColor="#3a5a78" /></linearGradient>
        <linearGradient id={`${id}-ice`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a6a90" /><stop offset="0.3" stopColor="#123456" /><stop offset="1" stopColor="#040e1e" /></linearGradient>
        <linearGradient id={`${id}-aur`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#40ffb0" stopOpacity="0" /><stop offset="0.6" stopColor="#40ffb0" stopOpacity="0.35" /><stop offset="1" stopColor="#40ffb0" stopOpacity="0" /></linearGradient>
      </defs>
      <g transform={`translate(0 ${dy})`}>
        <rect width={W} height={700} fill={`url(#${id}-sky)`} />
        <Stars n={200} seed={31} h={600} T={T} />
        {/* aurora curtains */}
        {Array.from({ length: 5 }, (_, k) => (
          <path key={k} d={`M ${-100 + k * 60} ${200 + k * 20} C 500 ${120 + 60 * Math.sin(T * 0.4 + k)}, 1100 ${300 + 50 * Math.sin(T * 0.3 + k * 2)}, ${W + 100} ${160 + k * 30} L ${W + 100} ${420 + k * 30} C 1100 ${520 + 50 * Math.sin(T * 0.3 + k)}, 500 ${380 + 60 * Math.sin(T * 0.5 + k)}, ${-100 + k * 60} ${460 + k * 20} Z`} fill={`url(#${id}-aur)`} opacity={0.5 - k * 0.07} />
        ))}
        <rect y={640} width={W} height={60} fill={`url(#${id}-snow)`} />
        {/* the lab on stilts, lit windows */}
        <g transform="translate(1180 560)">
          <rect x={0} y={0} width={360} height={90} fill="#1c2a3a" />
          <rect x={60} y={-60} width={110} height={60} fill="#1c2a3a" />
          <rect x={200} y={-40} width={90} height={40} fill="#1c2a3a" />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={20 + i * 37} y={30} width={22} height={14} fill="#ffd890" opacity={0.75 + 0.25 * Math.sin(T * 2 + i)} />)}
          {[30, 160, 300].map((x) => <rect key={x} x={x} y={90} width={10} height={40} fill="#14202c" />)}
          <circle cx={115} cy={-74} r={4} fill="#ff5040" opacity={0.5 + 0.5 * Math.sin(T * 4)} />
        </g>
        <ellipse cx={1360} cy={690} rx={300} ry={14} fill="#ffd890" opacity={0.12} />
        {/* below: the ice, the strings */}
        <rect y={700} width={W} height={1700} fill={`url(#${id}-ice)`} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={0} y1={720 + i * 46} x2={W} y2={724 + i * 46} stroke="#8fdcff" strokeOpacity={0.04} strokeWidth={2} />)}
        {Array.from({ length: 23 }, (_, i) => {
          const x = 140 + i * 75, depth = easeOut(prog(T, 50.6 + i * 0.04, 52.2 + i * 0.04));
          return (
            <g key={i}>
              <line x1={x} y1={700} x2={x} y2={700 + 1620 * depth} stroke="#8fdcff" strokeOpacity={0.25} strokeWidth={2} />
              {Array.from({ length: 12 }, (_, j) => (1560 + j * 62 < 700 + 1620 * depth) ? <circle key={j} cx={x} cy={1560 + j * 62} r={7} fill="#cfeaff" opacity={0.85} style={{ filter: 'drop-shadow(0 0 6px #4fb4ff)' }} /> : null)}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ 6. the cubic kilometre in 3D, a Cherenkov flash
export const Cube: S = ({ T, id }) => {
  const yaw = 0.5 + (T - 56.98) * 0.07, pitch = 0.32;
  const flash = hit(T, 60.2, 0.9);
  const dirK = prog(T, 62.4, 64.2);
  const P = { x: 120, y: 80, z: -60 };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs><radialGradient id={`${id}-bg`} cx="0.5" cy="0.5" r="0.75"><stop offset="0" stopColor="#0c2442" /><stop offset="1" stopColor="#020812" /></radialGradient></defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={rnd(i, 41) * W} cy={((rnd(i, 42) * H - T * 6) % H + H) % H} r={1 + rnd(i, 43) * 2} fill="#cfeaff" opacity={0.15} />)}
      <Lattice yaw={yaw} pitch={pitch} dist={2100} cy={560} light={(x, y, z) => {
        if (dirK > 0) {
          const A = [-420, -380, 260], Bq = [420, 420, -300];
          const D = [Bq[0] - A[0], Bq[1] - A[1], Bq[2] - A[2]], L2 = D[0] * D[0] + D[1] * D[1] + D[2] * D[2];
          const sP = ((x - A[0]) * D[0] + (y - A[1]) * D[1] + (z - A[2]) * D[2]) / L2;
          if (sP >= 0 && sP <= dirK) {
            const d = Math.hypot(A[0] + D[0] * sP - x, A[1] + D[1] * sP - y, A[2] + D[2] * sP - z);
            const k = Math.exp(-d / 120);
            if (k > 0.06) return [k, `hsl(${lerp(0, 230, sP)} 95% 60%)`];
          }
        }
        if (flash < 0.01) return null;
        const d = Math.hypot(x - P.x, y - P.y, z - P.z);
        const k = flash * Math.exp(-d / 240);
        return k > 0.04 ? [k, '#8fdcff'] : null;
      }} />
      {flash > 0.01 && (() => {
        const c = project(P.x, P.y, P.z, yaw, pitch, 2100, 960, 560);
        return <circle cx={c.x} cy={c.y} r={40 + 360 * (1 - flash)} fill="#4fb4ff" opacity={0.35 * flash} style={{ filter: 'blur(14px)' }} />;
      })()}
    </svg>
  );
};

// ------------------------------------------------------------------ 7. the event display: a track lights the DOMs in time order
const EV = { a: [-480, -420, 300], b: [460, 380, -260] }; // track from a to b (metres)
const timeColor = (u: number) => `hsl(${lerp(0, 230, u)} 95% 60%)`; // early red → late blue
export const Event: S = ({ T, id }) => {
  const yaw = 0.9 + (T - 65.1) * 0.04, pitch = 0.22;
  const bursts = Array.from({ length: 28 }, (_, i) => ({ t: 71.0 + i * 0.08, p: [STRINGS[(i * 29) % 86][0], lerp(Y_TOP, Y_BOT, rnd(i, 51)), STRINGS[(i * 29) % 86][1]] }));
  const tr = prog(T, 74.0, 75.5);
  const dir = [EV.b[0] - EV.a[0], EV.b[1] - EV.a[1], EV.b[2] - EV.a[2]], len = Math.hypot(dir[0], dir[1], dir[2]);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs><radialGradient id={`${id}-bg`} cx="0.5" cy="0.5" r="0.75"><stop offset="0" stopColor="#0a1c34" /><stop offset="1" stopColor="#02060e" /></radialGradient></defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <Lattice yaw={yaw} pitch={pitch} dist={2000} cx={1000} cy={560} light={(x, y, z) => {
        // ordinary flashes: muons from the atmosphere, billions a year
        if (T > 65.2 && T < 71.0) {
          const n = Math.floor(T * 12);
          for (let q = 0; q < 3; q++) {
            const sIdx = Math.floor(rnd(n, q) * 86), sy = lerp(Y_TOP, Y_BOT, rnd(n, q + 7));
            const [qx, qz] = STRINGS[sIdx];
            const d = Math.hypot(x - qx, y - sy, z - qz);
            if (d < 120) return [0.5 * (1 - d / 120), '#ffffff'];
          }
        }
        // the 28 bursts (2013)
        let best: [number, string] | null = null;
        for (const b of bursts) {
          const h = hit(T, b.t, 0.5);
          if (h < 0.03) continue;
          const d = Math.hypot(x - b.p[0], y - b.p[1], z - b.p[2]);
          const k = h * Math.exp(-d / 150);
          if (k > 0.05 && (!best || k > best[0])) best = [k, '#f1c56d'];
        }
        if (best) return best;
        // the 2017 track
        if (tr <= 0) return null;
        const rel = [x - EV.a[0], y - EV.a[1], z - EV.a[2]];
        const s = (rel[0] * dir[0] + rel[1] * dir[1] + rel[2] * dir[2]) / (len * len);
        if (s < 0 || s > 1 || s > tr) return null;
        const px = EV.a[0] + dir[0] * s - x, py = EV.a[1] + dir[1] * s - y, pz = EV.a[2] + dir[2] * s - z;
        const d = Math.hypot(px, py, pz);
        const k = Math.exp(-d / 110) * (1 - 0.3 * prog(T, 78, 81.4));
        return k > 0.06 ? [k, timeColor(s)] : null;
      }} />
      {tr > 0 && (() => {
        const a = project(EV.a[0], EV.a[1], EV.a[2], yaw, pitch, 2000, 1000, 560), b = project(EV.a[0] + dir[0] * tr, EV.a[1] + dir[1] * tr, EV.a[2] + dir[2] * tr, yaw, pitch, 2000, 1000, 560);
        return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffffff" strokeWidth={2} strokeOpacity={0.6} strokeDasharray="10 8" />;
      })()}
    </svg>
  );
};

// ------------------------------------------------------------------ 8. the blazar: a black hole whose jet points at us
export const Blazar: S = ({ T, id }) => {
  const pulse = 0.85 + 0.15 * Math.sin(T * 9);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <radialGradient id={`${id}-core`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffffff" /><stop offset="0.12" stopColor="#d8f0ff" /><stop offset="0.4" stopColor="#6aa8ff" stopOpacity="0.5" /><stop offset="1" stopColor="#2040a0" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-disk`} cx="0.5" cy="0.5" r="0.5"><stop offset="0.25" stopColor="#ffd080" stopOpacity="0" /><stop offset="0.4" stopColor="#ffb050" stopOpacity="0.9" /><stop offset="0.7" stopColor="#c05020" stopOpacity="0.5" /><stop offset="1" stopColor="#601808" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#010208" />
      <Stars n={300} seed={61} T={T} />
      {/* host galaxy */}
      {Array.from({ length: 900 }, (_, i) => {
        const r = Math.pow(rnd(i, 71), 0.6) * 520, a = rnd(i, 72) * Math.PI * 2 + r * 0.008 + T * 0.02;
        return <circle key={i} cx={1260 + Math.cos(a) * r} cy={500 + Math.sin(a) * r * 0.42} r={0.6 + rnd(i, 73) * 1.4} fill={rnd(i, 74) < 0.3 ? '#ffd8a0' : '#cfe0ff'} opacity={0.15 + 0.5 * (1 - r / 520)} />;
      })}
      <ellipse cx={1260} cy={500} rx={170} ry={70} fill={`url(#${id}-disk)`} />
      {/* the jet, end-on: a blinding core with rays toward the viewer */}
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + T * 0.1;
        return <line key={i} x1={1260} y1={500} x2={1260 + Math.cos(a) * 520 * pulse} y2={500 + Math.sin(a) * 520 * pulse} stroke="#bfe0ff" strokeWidth={2} strokeOpacity={0.12} />;
      })}
      <circle cx={1260} cy={500} r={260 * pulse} fill={`url(#${id}-core)`} style={{ mixBlendMode: 'screen' }} />
      <circle cx={1260} cy={500} r={16} fill="#ffffff" />
      {/* the path home */}
      <path d="M 1260 500 Q 700 820 180 920" stroke="#8fdcff" strokeWidth={2} strokeDasharray="4 12" strokeDashoffset={-T * 60} fill="none" opacity={0.5} />
      <circle cx={180} cy={920} r={10} fill="#4fb4ff" />
      <circle cx={180} cy={920} r={26} fill="none" stroke="#4fb4ff" strokeOpacity={0.5} strokeWidth={2} />
    </svg>
  );
};

// ------------------------------------------------------------------ 9. the Milky Way, in light and in neutrinos
export const Galaxy: S = ({ T, id }) => {
  const nu = easeInOut(prog(T, 93.6, 95.4));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity="0" /><stop offset="0.5" stopColor="#e8e0ff" stopOpacity="0.22" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></linearGradient>
        <linearGradient id={`${id}-nu`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4fb4ff" stopOpacity="0" /><stop offset="0.5" stopColor="#4fb4ff" stopOpacity="0.75" /><stop offset="1" stopColor="#4fb4ff" stopOpacity="0" /></linearGradient>
        <radialGradient id={`${id}-centre`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#8fdcff" stopOpacity="0.9" /><stop offset="1" stopColor="#4fb4ff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#02040a" />
      <Stars n={500} seed={81} T={T} />
      <g transform="rotate(-14 960 540)">
        <rect x={-200} y={380} width={2320} height={320} fill={`url(#${id}-band)`} opacity={1 - 0.6 * nu} />
        {Array.from({ length: 1400 }, (_, i) => {
          const x = -200 + rnd(i, 91) * 2320, y = 540 + (rnd(i, 92) + rnd(i, 93) - 1) * 150;
          return <circle key={i} cx={x} cy={y} r={0.5 + rnd(i, 94)} fill="#ffffff" opacity={(0.2 + 0.5 * rnd(i, 95)) * (1 - 0.7 * nu)} />;
        })}
        {Array.from({ length: 20 }, (_, i) => <ellipse key={i} cx={-100 + rnd(i, 96) * 2100} cy={540 + (rnd(i, 97) - 0.5) * 60} rx={60 + rnd(i, 98) * 160} ry={14 + rnd(i, 99) * 20} fill="#120a18" opacity={0.7 * (1 - nu)} />)}
        {/* the neutrino image: a soft blue band, brightest at the centre */}
        <rect x={-200} y={420} width={2320} height={240} fill={`url(#${id}-nu)`} opacity={nu} style={{ filter: 'blur(18px)' }} />
        <ellipse cx={960} cy={540} rx={420} ry={150} fill={`url(#${id}-centre)`} opacity={nu} style={{ filter: 'blur(10px)' }} />
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ 10. polar night again: ice plain, aurora (end card)
export const Night: S = ({ T, id }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#01040c" /><stop offset="1" stopColor="#0c2240" /></linearGradient>
      <linearGradient id={`${id}-aur`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#40ffb0" stopOpacity="0" /><stop offset="0.6" stopColor="#40ffb0" stopOpacity="0.3" /><stop offset="1" stopColor="#40ffb0" stopOpacity="0" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-sky)`} />
    <Stars n={260} seed={101} h={800} T={T} />
    {Array.from({ length: 4 }, (_, k) => (
      <path key={k} d={`M -100 ${150 + k * 30} C 600 ${60 + 50 * Math.sin(T * 0.4 + k)}, 1300 ${260 + 40 * Math.sin(T * 0.3 + k)}, 2020 ${120 + k * 20} L 2020 ${380 + k * 20} C 1300 ${480 + 40 * Math.sin(T * 0.3 + k)}, 600 ${330 + 50 * Math.sin(T * 0.5 + k)}, -100 ${420 + k * 30} Z`} fill={`url(#${id}-aur)`} opacity={0.45 - k * 0.08} />
    ))}
    <rect y={820} width={W} height={260} fill="#2a4a6a" />
    <rect y={820} width={W} height={8} fill="#8fb8d8" opacity={0.6} />
  </svg>
);


// ------------------------------------------------------------------ 0. cosmic-ray "bullets" curving into the earth (cold open)
const EARTH0 = { x: 1430, y: 560, r: 170 };
const rayPath = (i: number, u: number): [number, number] => {
  const a0 = Math.PI * (0.65 + rnd(i, 1) * 0.7); // start angle (from the left half)
  const R0 = 1300;
  const sx = EARTH0.x + Math.cos(a0) * R0, sy = EARTH0.y + Math.sin(a0) * R0 * 0.7;
  const ea = a0 + (rnd(i, 2) - 0.5) * 1.6, ex = EARTH0.x + Math.cos(ea) * (EARTH0.r + 30), ey = EARTH0.y + Math.sin(ea) * (EARTH0.r + 30);
  const x = lerp(sx, ex, u), y = lerp(sy, ey, u);
  const dx = ex - sx, dy = ey - sy, L = Math.hypot(dx, dy);
  const w = Math.sin(u * Math.PI * (2 + rnd(i, 3) * 3)) * (1 - u) * (120 + rnd(i, 4) * 160);
  return [x - (dy / L) * w, y + (dx / L) * w];
};
export const Rays: S = ({ T, id }) => {
  const hi = easeOut(prog(T, 9.95, 10.8));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.75" cy="0.5" r="0.8"><stop offset="0" stopColor="#0c1c34" /><stop offset="1" stopColor="#010309" /></radialGradient>
        <radialGradient id={`${id}-earth`} cx="0.35" cy="0.35" r="0.75"><stop offset="0" stopColor="#4a8ac8" /><stop offset="0.6" stopColor="#1a4a7a" /><stop offset="1" stopColor="#081a30" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <Stars n={260} seed={111} T={T} />
      {/* magnetic field lines: faint arcs */}
      {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M -50 ${120 + k * 110} C 500 ${40 + k * 120 + 60 * Math.sin(T * 0.3 + k)}, 900 ${200 + k * 90}, 1300 ${80 + k * 115}`} stroke="#6aa8ff" strokeOpacity={0.08} strokeWidth={2} fill="none" />)}
      {/* the unknown shooter */}
      <text x={300} y={560} textAnchor="middle" style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: 220, fill: '#ffffff', opacity: 0.18 + 0.06 * Math.sin(T * 2) }}>?</text>
      {/* the earth */}
      <circle cx={EARTH0.x} cy={EARTH0.y} r={EARTH0.r + 26} fill="#4fb4ff" opacity={0.12} />
      <circle cx={EARTH0.x} cy={EARTH0.y} r={EARTH0.r} fill={`url(#${id}-earth)`} />
      {Array.from({ length: 6 }, (_, k) => <ellipse key={k} cx={EARTH0.x - 60 + rnd(k, 5) * 120} cy={EARTH0.y - 80 + rnd(k, 6) * 160} rx={30 + rnd(k, 7) * 40} ry={18 + rnd(k, 8) * 24} fill="#2e6a3c" opacity={0.7} />)}
      {/* the bullets */}
      {Array.from({ length: 26 }, (_, i) => {
        const per = 2.2 + rnd(i, 9) * 1.6, ph = rnd(i, 10) * per;
        const u = ((T + ph) % per) / per;
        const pts = Array.from({ length: 14 }, (_, k) => rayPath(i, Math.max(0, u - k * 0.02)));
        const [hx, hy] = pts[0];
        const imp = u > 0.96;
        return (
          <g key={i} opacity={1 - 0.75 * hi}>
            <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#ffd890" strokeOpacity={0.5} strokeWidth={2} strokeLinecap="round" />
            <circle cx={hx} cy={hy} r={4} fill="#fff4d8" style={{ filter: 'drop-shadow(0 0 6px #f1c56d)' }} />
            {imp && <circle cx={hx} cy={hy} r={10 + (u - 0.96) * 600} fill="none" stroke="#ffe0a0" strokeOpacity={1 - (u - 0.96) * 25} strokeWidth={2} />}
          </g>
        );
      })}
      {/* one path, highlighted: where it really came from vs where it seems to come from */}
      {hi > 0 && (() => {
        const pts = Array.from({ length: 60 }, (_, k) => rayPath(3, k / 59));
        const n = Math.floor(60 * hi);
        const [ex, ey] = pts[59], [px, py] = pts[56];
        const dx = ex - px, dy = ey - py, L = Math.hypot(dx, dy);
        return (
          <g>
            <polyline points={pts.slice(0, Math.max(2, n)).map((p) => p.join(',')).join(' ')} fill="none" stroke="#f1c56d" strokeWidth={5} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px #f1c56d)' }} />
            <circle cx={pts[0][0]} cy={pts[0][1]} r={12} fill="#f1c56d" />
            {hi > 0.9 && <line x1={ex} y1={ey} x2={ex - (dx / L) * 900} y2={ey - (dy / L) * 900} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2} strokeDasharray="10 10" />}
          </g>
        );
      })()}
    </svg>
  );
};

// ------------------------------------------------------------------ 0b. bent bullet vs straight witness
export const Curve: S = ({ T, id }) => {
  const SRC = [330, 540], EAR = [1600, 560];
  const cr = easeInOut(prog(T, 20.6, 23.2));
  const nu = easeInOut(prog(T, 26.4, 28.2));
  const crPts = Array.from({ length: 80 }, (_, k) => {
    const u = k / 79, x = lerp(SRC[0], EAR[0], u), y = lerp(SRC[1], EAR[1], u);
    return [x + Math.sin(u * 9) * 40 * (1 - u), y - Math.sin(u * Math.PI * 3.2) * 260 * (1 - u * 0.4)];
  });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <radialGradient id={`${id}-bg`} cx="0.2" cy="0.5" r="0.9"><stop offset="0" stopColor="#141028" /><stop offset="1" stopColor="#02040a" /></radialGradient>
        <radialGradient id={`${id}-disk`} cx="0.5" cy="0.5" r="0.5"><stop offset="0.3" stopColor="#ffd080" stopOpacity="0" /><stop offset="0.45" stopColor="#ffb050" stopOpacity="0.95" /><stop offset="0.75" stopColor="#c05020" stopOpacity="0.4" /><stop offset="1" stopColor="#601808" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-earth`} cx="0.35" cy="0.35" r="0.75"><stop offset="0" stopColor="#4a8ac8" /><stop offset="1" stopColor="#081a30" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <Stars n={220} seed={121} T={T} />
      {Array.from({ length: 11 }, (_, k) => <path key={k} d={`M 500 ${-40 + k * 110} C 800 ${100 + k * 90 + 40 * Math.sin(T * 0.5 + k)}, 1100 ${k * 105}, 1450 ${60 + k * 100}`} stroke="#8a7aff" strokeOpacity={0.12} strokeWidth={3} fill="none" />)}
      {/* the source: a black hole with its disk */}
      <ellipse cx={SRC[0]} cy={SRC[1]} rx={150} ry={50} fill={`url(#${id}-disk)`} />
      <circle cx={SRC[0]} cy={SRC[1]} r={34} fill="#000" stroke="#ffcf80" strokeOpacity={0.6} strokeWidth={2} />
      {/* earth */}
      <circle cx={EAR[0]} cy={EAR[1]} r={110} fill={`url(#${id}-earth)`} />
      <circle cx={EAR[0]} cy={EAR[1]} r={126} fill="none" stroke="#4fb4ff" strokeOpacity={0.3} strokeWidth={10} />
      {/* the cosmic ray, bent */}
      {cr > 0 && <polyline points={crPts.slice(0, Math.max(2, Math.floor(80 * cr))).map((p) => p.join(',')).join(' ')} fill="none" stroke="#f1c56d" strokeWidth={5} strokeLinecap="round" opacity={1 - 0.5 * nu} style={{ filter: 'drop-shadow(0 0 10px #f1c56d)' }} />}
      {/* the neutrino, straight */}
      {nu > 0 && (
        <g>
          <line x1={SRC[0]} y1={SRC[1]} x2={lerp(SRC[0], EAR[0], nu)} y2={lerp(SRC[1], EAR[1], nu)} stroke="#8fdcff" strokeWidth={6} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 12px #4fb4ff)' }} />
          <circle cx={lerp(SRC[0], EAR[0], nu)} cy={lerp(SRC[1], EAR[1], nu)} r={10} fill="#ffffff" style={{ filter: 'drop-shadow(0 0 14px #8fdcff)' }} />
        </g>
      )}
    </svg>
  );
};

export const SETS: Record<string, S> = { rays: Rays, curve: Curve, body: Body, prize: Prize, earth: EarthCut, lives: Lives, pole: Pole, cube: Cube, event: Event, blazar: Blazar, galaxy: Galaxy, night: Night };
export { easeIn };

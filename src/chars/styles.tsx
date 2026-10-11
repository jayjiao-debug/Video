import React from 'react';
import { Style, Part } from './Figure';
import { capsule, circle, P, Fig, add } from './rig';

/* Four 2D character looks painted on the same rig, each with its own world.
   A world = a background function (camera-aware, with parallax layers) + the style's painter. */

export type Cam = { cx: number; cy: number; z: number };
export type Ctx = { t: number; cam: Cam; camEnd: Cam; prints: { x: number; t: number }[] };

const W = 1920, H = 1080;
export const Layer: React.FC<{ cam: Cam; d: number; children: React.ReactNode }> = ({ cam, d, children }) => {
  const zl = 1 + (cam.z - 1) * d;
  return <g transform={`translate(${W / 2} ${H / 2}) scale(${zl.toFixed(4)}) translate(${(-cam.cx * d).toFixed(2)} ${(-cam.cy * d).toFixed(2)})`}>{children}</g>;
};
/** layer coordinates of a point that should sit at screen (sx, sy) when the camera is at c */
export const anchor = (c: Cam, d: number, sx: number, sy: number): P => {
  const zl = 1 + (c.z - 1) * d;
  return [(sx - W / 2) / zl + c.cx * d, (sy - H / 2) / zl + c.cy * d];
};
const rng = (seed: number) => { let s = (seed * 2654435761) % 2147483647 || 1; const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; r(); r(); return r; };
const mix = (a: string, b: string, k: number) => {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const x = h(a), y = h(b);
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
/** a ridge line across [x0, x1] with peaks, filled down to y = bottom */
const ridge = (seed: number, x0: number, x1: number, step: number, y: number, amp: number, bottom = 3000) => {
  const r = rng(seed); let d = `M${x0} ${bottom} L${x0} ${y}`;
  for (let x = x0; x <= x1; x += step) d += ` L${x + step * (0.3 + r() * 0.4)} ${y - amp * (0.35 + r() * 0.65)} L${x + step} ${y - amp * r() * 0.25}`;
  return d + ` L${x1 + step} ${bottom} Z`;
};
/** an original three-masted barque, waterline at y = 0, bow toward +x */
export const ship = (s = 1) => {
  const L = (a: P, b: P, w: number) => capsule([a[0] * s, a[1] * s], [b[0] * s, b[1] * s], w * s, w * s);
  const hull = `M${-175 * s} ${-44 * s} L${150 * s} ${-30 * s} L${198 * s} ${-46 * s} L${178 * s} ${-6 * s} Q0 ${8 * s} ${-160 * s} ${-2 * s} Z`;
  const spars = [
    L([-90, -30], [-90, -290], 3.5), L([0, -30], [0, -330], 3.8), L([90, -30], [90, -280], 3.5), L([185, -42], [285, -95], 2.6),
    ...[[-90, -110, 62], [-90, -180, 52], [-90, -245, 38], [0, -120, 70], [0, -200, 58], [0, -275, 42], [90, -110, 60], [90, -180, 48], [90, -240, 34]].map(([x, y, w]) => L([x - w, y], [x + w, y], 2.2)),
    L([0, -330], [285, -95], 1.1), L([0, -330], [-175, -44], 1.1), L([-90, -290], [-175, -44], 1.1), L([90, -280], [198, -46], 1.1),
  ];
  return { hull, spars };
};

/* ========================= A · 纸偶 paper cut-out ========================= */
const PA = { coat: '#b4543c', trousers: '#3e4a5e', boots: '#2e2622', skin: '#ecc8a2', hat: '#e2a83f', scarf: '#2f6f74', glove: '#5a4334' };
const paperPiece = (d: string, fill: string, k: string, tf?: string, sh = 1) => (
  <g key={k}>
    <path d={d} transform={`translate(${2.5 * sh} ${4.5 * sh}) ${tf ?? ''}`} fill="#3b2412" opacity={0.25} />
    <path d={d} transform={tf} fill={fill} />
    <path d={d} transform={tf} fill="none" stroke="#fff4dc" strokeOpacity={0.4} strokeWidth={1.1} />
  </g>
);
export const Paper: Style = {
  id: 'A', name: '纸偶', en: 'Paper cut-out puppet',
  part: (p: Part) => paperPiece(p.d, p.far ? mix(PA[p.mat], '#24160c', 0.28) : PA[p.mat], p.k, p.tf),
  joint: (q, far, k) => (
    <g key={k}><circle cx={q[0]} cy={q[1]} r={3.6} fill={far ? '#8a6a2c' : '#c9a24a'} /><circle cx={q[0] - 0.9} cy={q[1] - 0.9} r={1.3} fill="#f6e2a4" /></g>
  ),
  face: (k) => <g key={k}><circle cx={15} cy={-3} r={3.1} fill="#2a1d16" /><circle cx={10} cy={11} r={6.5} fill="#e07f62" opacity={0.45} /></g>,
};
export const PaperBG: React.FC<{ c: Ctx; fg?: boolean }> = ({ c, fg }) => {
  const { cam, camEnd, t } = c;
  if (fg) {
    const r = rng(9);
    return (
      <>
        <Layer cam={cam} d={1.5}>{Array.from({ length: 9 }, (_, i) => { const x = -900 + i * 620 + r() * 200; return paperPiece(`M${x} 600 Q${x + 120} ${250 - r() * 80} ${x + 330} 600 Z`, '#fbf9f2', 'fg' + i, undefined, 2); })}</Layer>
        {Array.from({ length: 46 }, (_, i) => { const r2 = rng(100 + i), x0 = r2() * W, sp = 30 + r2() * 50; const y = ((r2() * H + t * sp * 2.2) % (H + 40)) - 20, x = x0 + Math.sin(t * 1.3 + i) * 14; return <g key={'s' + i}><circle cx={x + 2} cy={y + 3} r={3 + (i % 3) * 1.5} fill="#3b2412" opacity={0.18} /><circle cx={x} cy={y} r={3 + (i % 3) * 1.5} fill="#fffdf6" /></g>; })}
      </>
    );
  }
  const sp = anchor(camEnd, 0.3, 1440, 650), sh = ship(0.9);
  return (
    <>
      <defs><linearGradient id="pa-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2e3c4" /><stop offset="1" stopColor="#e8cfa6" /></linearGradient></defs>
      <rect width={W} height={H} fill="url(#pa-sky)" />
      {paperPiece(circle([1480, 290], 150), '#efc272', 'sun2')}
      {paperPiece(circle([1480, 290], 100), '#e3913a', 'sun')}
      <Layer cam={cam} d={0.12}>{paperPiece(ridge(3, -3000, 4000, 300, anchor(camEnd, 0.12, 0, 610)[1], 260), '#c4ced3', 'm1')}</Layer>
      <Layer cam={cam} d={0.2}>{paperPiece(ridge(5, -3000, 4000, 220, anchor(camEnd, 0.2, 0, 690)[1], 170), '#dde3e3', 'm2')}</Layer>
      <Layer cam={cam} d={0.3}>
        <g transform={`translate(${sp[0]} ${sp[1]}) rotate(-6)`}>
          {paperPiece(sh.hull, '#5b3b2c', 'hull')}
          {sh.spars.map((d, i) => paperPiece(d, '#4a3226', 'sp' + i, undefined, 0.5))}
        </g>
        {paperPiece(ridge(8, -3000, 4000, 160, sp[1] + 6, 30), '#e9eeec', 'ice')}
      </Layer>
      <Layer cam={cam} d={0.55}>{paperPiece(ridge(11, -3000, 5000, 380, anchor(camEnd, 0.55, 0, 840)[1], 110), '#d4dedf', 'm3')}</Layer>
      <Layer cam={cam} d={1}>
        {paperPiece(`M-3000 0 Q-1500 -18 0 -4 Q1500 10 3000 -6 Q4500 -16 7000 0 L7000 3000 L-3000 3000 Z`, '#f8f5ee', 'gr')}
        {c.prints.filter((p) => p.t <= t).map((p, i) => <ellipse key={'fp' + i} cx={p.x + 20} cy={4 + (i % 2) * 6} rx={22} ry={5} fill="#d8d3c6" />)}
      </Layer>
    </>
  );
};

/* ========================= B · 皮影 shadow puppet ========================= */
const PB = { coat: '#a3241c', trousers: '#1d5a44', boots: '#2b170c', skin: '#d6964c', hat: '#cf8a22', scarf: '#1d5a44', glove: '#2b170c' };
const pupPiece = (d: string, fill: string, k: string, tf?: string, holes = false, sw = 3) => (
  <g key={k}>
    <path d={d} transform={tf} fill={fill} fillOpacity={0.86} stroke="#26120a" strokeWidth={sw} strokeLinejoin="round" />
    {holes && <path d={d} transform={tf} fill="url(#pb-holes)" />}
  </g>
);
export const Puppet: Style = {
  id: 'B', name: '皮影', en: 'Shadow-play leather puppet',
  part: (p) => pupPiece(p.d, p.far ? mix(PB[p.mat], '#1a0c06', 0.3) : PB[p.mat], p.k, p.tf, p.mat === 'coat' || p.mat === 'hat'),
  joint: (q, far, k) => <g key={k}><circle cx={q[0]} cy={q[1]} r={5} fill="#26120a" /><circle cx={q[0]} cy={q[1]} r={2} fill={far ? '#7a4a1a' : '#d79a44'} /></g>,
  face: (k) => <g key={k}><path d="M 7 -4 Q 16 -10 24 -3 Q 16 0 7 -4 Z" fill="#26120a" /><path d="M 4 -13 Q 15 -18 26 -11" stroke="#26120a" strokeWidth={2.6} fill="none" strokeLinecap="round" /><path d="M 18 16 Q 24 18 28 15" stroke="#26120a" strokeWidth={2} fill="none" /></g>,
  filter: 'url(#pb-soft)',
  over: (f: Fig, k) => (
    <g key={k} opacity={0.82}>
      <line x1={f.wN[0]} y1={f.wN[1]} x2={f.wN[0] - 60} y2={900} stroke="#2a160c" strokeWidth={2.6} />
      <line x1={f.N[0]} y1={f.N[1]} x2={f.N[0] - 30} y2={900} stroke="#2a160c" strokeWidth={3} />
    </g>
  ),
  defs: (
    <>
      <pattern id="pb-holes" width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 9 L18 9 M9 0 L9 18" stroke="#ffd98c" strokeWidth={1.2} opacity={0.42} />
        <circle cx={9} cy={9} r={1.8} fill="#ffe2a0" opacity={0.55} />
      </pattern>
      <filter id="pb-soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx={0} dy={0} stdDeviation={2.4} floodColor="#3a1606" floodOpacity={0.55} /></filter>
    </>
  ),
};
export const PuppetBG: React.FC<{ c: Ctx; fg?: boolean }> = ({ c, fg }) => {
  const { cam, camEnd } = c;
  if (fg) return (
    <>
      <rect x={0} y={0} width={W} height={58} fill="#241008" /><rect x={0} y={58} width={W} height={3} fill="#b07a2a" />
      <rect x={0} y={1004} width={W} height={76} fill="#241008" /><rect x={0} y={1001} width={W} height={3} fill="#b07a2a" />
    </>
  );
  const sp = anchor(camEnd, 0.6, 1470, 905), sh = ship(1.05);
  return (
    <>
      <defs>
        <radialGradient id="pb-screen" cx="0.5" cy="0.47" r="0.75"><stop offset="0" stopColor="#ffe6a8" /><stop offset="0.42" stopColor="#f6ab4c" /><stop offset="0.78" stopColor="#b5501b" /><stop offset="1" stopColor="#57200a" /></radialGradient>
        <filter id="pb-fiber"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.4" numOctaves={2} seed={4} /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.15  0 0 0 0 0.05  0 0 0 0.35 0" /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#pb-screen)" />
      <rect width={W} height={H} filter="url(#pb-fiber)" opacity={0.5} />
      <Layer cam={cam} d={0.6}>
        <g transform={`translate(${sp[0]} ${sp[1]}) rotate(-5)`}>
          {pupPiece(sh.hull, '#6d3a1c', 'hull', undefined, true)}
          {sh.spars.map((d, i) => pupPiece(d, '#3a1d0c', 'sp' + i, undefined, false, 1.2))}
        </g>
        {Array.from({ length: 9 }, (_, i) => { const x = -1200 + i * 520; return pupPiece(`M${x} ${sp[1] + 30} L${x + 60} ${sp[1] - 40} L${x + 240} ${sp[1] - 52} L${x + 330} ${sp[1] - 10} L${x + 350} ${sp[1] + 40} Z`, '#2f6a74', 'floe' + i, undefined, false); })}
      </Layer>
      <Layer cam={cam} d={1}>
        {pupPiece(`M-3000 4 Q-2700 -14 -2400 2 ${Array.from({ length: 40 }, (_, i) => `Q${-2250 + i * 250} -16 ${-2100 + i * 250} 2`).join(' ')} L8000 400 L-3000 400 Z`, '#2a5560', 'ground', undefined, true)}
      </Layer>
    </>
  );
};

/* ========================= C · 水墨 ink brush ========================= */
const PC = { coat: 'rgba(26,24,22,0.82)', trousers: 'rgba(18,17,16,0.93)', boots: 'rgba(10,10,10,0.95)', skin: '#efe7d6', hat: 'rgba(34,32,30,0.62)', scarf: '#b4321e', glove: 'rgba(14,14,14,0.92)' };
const PCF = { ...PC, coat: 'rgba(26,24,22,0.4)', trousers: 'rgba(18,17,16,0.45)', boots: 'rgba(10,10,10,0.5)', glove: 'rgba(14,14,14,0.45)', scarf: '#c9705f' };
export const Ink: Style = {
  id: 'C', name: '水墨', en: 'Ink brush with one red',
  part: (p) => p.mat === 'skin'
    ? <path key={p.k} d={p.d} transform={p.tf} fill="#efe7d6" stroke="rgba(15,15,15,0.9)" strokeWidth={2.6} />
    : <path key={p.k} d={p.d} transform={p.tf} fill={(p.far ? PCF : PC)[p.mat]} />,
  face: (k) => <g key={k}><path d="M 11 -2 Q 15 -5 20 -3" stroke="#111" strokeWidth={3.2} strokeLinecap="round" fill="none" /></g>,
  filter: 'url(#ink-rough)',
  defs: (
    <filter id="ink-rough" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={2} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={6} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="d" stdDeviation={0.5} />
    </filter>
  ),
};
export const InkBG: React.FC<{ c: Ctx; fg?: boolean }> = ({ c, fg }) => {
  const { cam, camEnd } = c;
  if (fg) return (
    <>
      <Layer cam={cam} d={1.6}><g filter="url(#ink-blur8)">{[-700, 900, 2300, 3300].map((x, i) => <path key={i} d={`M${x} 700 Q${x + 60} ${330 + i * 20} ${x + 230} ${300 + i * 30} Q${x + 380} ${330} ${x + 420} 700 Z`} fill="rgba(20,20,20,0.55)" />)}</g></Layer>
      <g transform="translate(1756 868)"><rect width={86} height={86} rx={6} fill="#b4321e" /><text x={43} y={40} fontSize={30} textAnchor="middle" fill="#f3e7d6" fontFamily='"Noto Serif CJK SC", serif' fontWeight={700}>试</text><text x={43} y={74} fontSize={30} textAnchor="middle" fill="#f3e7d6" fontFamily='"Noto Serif CJK SC", serif' fontWeight={700}>墨</text></g>
    </>
  );
  const sp = anchor(camEnd, 0.3, 1450, 690), sh = ship(0.85);
  return (
    <>
      <defs>
        <filter id="ink-blur4"><feGaussianBlur stdDeviation={4} /></filter>
        <filter id="ink-blur8"><feGaussianBlur stdDeviation={9} /></filter>
        <filter id="ink-paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={11} /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0.22 0" /></filter>
        <linearGradient id="ink-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ede5d4" stopOpacity={0} /><stop offset="0.5" stopColor="#ede5d4" stopOpacity={0.95} /><stop offset="1" stopColor="#ede5d4" stopOpacity={0} /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="#ede5d4" />
      <rect width={W} height={H} filter="url(#ink-paper)" />
      {([[0.08, 21, 420, 560, 380, 0.16, 8], [0.18, 23, 300, 650, 260, 0.32, 4]] as const).map(([d, seed, step, sy, amp, a, bl], i) => {
        const y = anchor(camEnd, d, 0, sy)[1];
        return (
          <Layer key={i} cam={cam} d={d}>
            <linearGradient id={`ink-fade${i}`} gradientUnits="userSpaceOnUse" x1={0} y1={y - amp} x2={0} y2={y + 90}><stop offset="0" stopColor="#1e1e22" stopOpacity={a} /><stop offset="0.55" stopColor="#1e1e22" stopOpacity={a * 0.8} /><stop offset="1" stopColor="#1e1e22" stopOpacity={0} /></linearGradient>
            <path d={ridge(seed, -3000, 4000, step, y, amp, y + 400)} fill={`url(#ink-fade${i})`} filter={`url(#ink-blur${bl})`} />
          </Layer>
        );
      })}
      <Layer cam={cam} d={0.3}>
        <g transform={`translate(${sp[0]} ${sp[1]}) rotate(-6)`} filter="url(#ink-rough)">
          <ellipse cx={0} cy={4} rx={330} ry={22} fill="rgba(30,30,34,0.25)" filter="url(#ink-blur4)" /><path d={sh.hull} fill="rgba(15,15,15,0.78)" />{sh.spars.map((d, i) => <path key={i} d={d} fill="rgba(15,15,15,0.7)" />)}
        </g>
      </Layer>
      <Layer cam={cam} d={1}>
        <rect x={-3000} y={0} width={11000} height={3000} fill="#ede5d4" />
        <rect x={-3000} y={0} width={11000} height={3000} filter="url(#ink-paper)" />
        <path d={`M-3000 2 ${Array.from({ length: 60 }, (_, i) => `L${-3000 + i * 170} ${(i % 3) * 3 - 3}`).join(' ')} L7200 10 L7200 18 L-3000 16 Z`} fill="rgba(20,20,20,0.75)" filter="url(#ink-rough)" />
        {c.prints.filter((p) => p.t <= c.t).map((p, i) => <path key={'fp' + i} d={`M${p.x} 6 q 20 -5 40 0`} stroke="rgba(20,20,20,0.35)" strokeWidth={4} fill="none" strokeLinecap="round" />)}
      </Layer>
    </>
  );
};

/* ========================= D · 水粉 gouache storybook, back-lit ========================= */
const PD = { coat: '#b9472f', trousers: '#3a3e5e', boots: '#2c2533', skin: '#f1c7a5', hat: '#e1b04c', scarf: '#3e7f8b', glove: '#5b4036' };
export const Gouache: Style = {
  id: 'D', name: '水粉绘本', en: 'Gouache storybook, back-lit',
  part: (p) => p.far
    ? <g key={p.k}><path d={p.d} transform={p.tf} fill={mix(PD[p.mat], '#262446', 0.38)} /></g>
    : <g key={p.k}>
        <path d={p.d} transform={`translate(-2.8 -2.2) ${p.tf ?? ''}`} fill="#ffd49a" opacity={0.95} />
        <path d={p.d} transform={p.tf} fill={PD[p.mat]} />
        <path d={p.d} transform={p.tf} fill="url(#gd-shade)" />
      </g>,
  face: (k) => <g key={k}><circle cx={15} cy={-3} r={3.3} fill="#2a2030" /><circle cx={16} cy={-4.2} r={1} fill="#fff" /><circle cx={11} cy={11} r={7} fill="#e88870" opacity={0.5} /></g>,
  filter: 'url(#gd-wob)',
  defs: (
    <>
      <linearGradient id="gd-shade" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0.25" stopColor="#1e1640" stopOpacity={0} /><stop offset="1" stopColor="#1e1640" stopOpacity={0.34} /></linearGradient>
      <filter id="gd-wob" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={3} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </>
  ),
};
export const GouacheBG: React.FC<{ c: Ctx; fg?: boolean }> = ({ c, fg }) => {
  const { cam, camEnd, t } = c;
  if (fg) return (
    <>
      <Layer cam={cam} d={1.6}><g filter="url(#gd-blur)">{[-800, 1100, 2500, 3600].map((x, i) => <path key={i} d={`M${x} 700 Q${x + 200} ${280 + i * 25} ${x + 520} 700 Z`} fill={i % 2 ? '#d9d3e3' : '#bdb9d4'} />)}</g></Layer>
      {Array.from({ length: 70 }, (_, i) => { const r = rng(300 + i), x0 = r() * W, sp = 40 + r() * 70, s = 1.5 + r() * 3; const y = ((r() * H + t * sp * 1.8) % (H + 40)) - 20; return <circle key={i} cx={x0 + Math.sin(t * 1.1 + i) * 18 + t * 30} cy={y} r={s} fill="#fff7ee" opacity={0.75} />; })}
    </>
  );
  const sp = anchor(camEnd, 0.3, 1430, 655), sh = ship(0.85);
  return (
    <>
      <defs>
        <linearGradient id="gd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c2449" /><stop offset="0.38" stopColor="#4a4a7c" /><stop offset="0.6" stopColor="#c07a80" /><stop offset="0.72" stopColor="#f2ae7a" /><stop offset="0.8" stopColor="#f8d49c" /></linearGradient>
        <radialGradient id="gd-sun"><stop offset="0" stopColor="#fff2cf" stopOpacity={0.95} /><stop offset="0.25" stopColor="#ffd59a" stopOpacity={0.55} /><stop offset="1" stopColor="#ffb07a" stopOpacity={0} /></radialGradient>
        <linearGradient id="gd-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9c6dc" /><stop offset="0.3" stopColor="#e3dbe4" /><stop offset="1" stopColor="#f2ebed" /></linearGradient>
        <filter id="gd-blur"><feGaussianBlur stdDeviation={10} /></filter>
        <filter id="gd-blur2"><feGaussianBlur stdDeviation={3} /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#gd-sky)" />
      <circle cx={380} cy={640} r={560} fill="url(#gd-sun)" />
      <circle cx={380} cy={640} r={44} fill="#fff4d6" />
      <Layer cam={cam} d={0.1}>
        <path d={ridge(31, -3000, 4000, 340, anchor(camEnd, 0.1, 0, 700)[1], 210)} fill="#706c98" />
        <path d={ridge(31, -3000, 4000, 340, anchor(camEnd, 0.1, 0, 700)[1], 210)} fill="none" stroke="#f0b392" strokeWidth={2.5} opacity={0.7} />
      </Layer>
      <Layer cam={cam} d={0.3}>
        <g transform={`translate(${sp[0]} ${sp[1]}) rotate(-6)`} filter="url(#gd-wob)">
          <path d={sh.hull} fill="#3b3458" />{sh.spars.map((d, i) => <path key={i} d={d} fill="#3b3458" />)}
          <circle cx={120} cy={-38} r={26} fill="url(#gd-sun)" /><circle cx={120} cy={-38} r={4} fill="#ffd27a" />
        </g>
        <path d={ridge(34, -3000, 4000, 180, sp[1] + 8, 26)} fill="#9e9fc2" />
      </Layer>
      <Layer cam={cam} d={0.55}><path d={ridge(36, -3000, 5000, 420, anchor(camEnd, 0.55, 0, 860)[1], 90)} fill="#aeadcb" /></Layer>
      <Layer cam={cam} d={1}>
        <path d="M-3000 0 Q-1500 -16 0 -3 Q1500 10 3000 -5 Q4500 -14 7000 0 L7000 3000 L-3000 3000 Z" fill="url(#gd-snow)" />
        {Array.from({ length: 40 }, (_, i) => { const r = rng(500 + i), x = -2500 + i * 230 + r() * 100, y = 30 + r() * 300; return <path key={i} d={`M${x} ${y} q ${60 + r() * 60} ${-6} ${140 + r() * 80} 0`} stroke="#ffffff" strokeOpacity={0.45} strokeWidth={5} fill="none" strokeLinecap="round" />; })}
        {c.prints.filter((p) => p.t <= t).map((p, i) => <ellipse key={'fp' + i} cx={p.x + 20} cy={5 + (i % 2) * 6} rx={22} ry={5} fill="#a7a6c6" opacity={0.8} />)}
      </Layer>
    </>
  );
};

export const WORLDS = [
  { st: Paper, BG: PaperBG, cam0: { z: 0.95, cy: -250 }, cam1: { z: 1.62, cy: -420 }, shadow: '#3b2412', so: 0.18 },
  { st: Puppet, BG: PuppetBG, cam0: { z: 1.0, cy: -330 }, cam1: { z: 1.3, cy: -380 }, shadow: '', so: 0 },
  { st: Ink, BG: InkBG, cam0: { z: 0.92, cy: -250 }, cam1: { z: 1.55, cy: -420 }, shadow: '#141414', so: 0.15 },
  { st: Gouache, BG: GouacheBG, cam0: { z: 0.92, cy: -250 }, cam1: { z: 1.68, cy: -420 }, shadow: '#3c3a6e', so: 0.32 },
];
export { add };

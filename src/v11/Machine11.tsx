import React from 'react';
import { C, F, LNUM, Cam, Svg, PaperDiv, PageInk, Heart, Margin11, pr, eo, eio, pop, spring, swing, lerp, clamp, easeOut, easeInOut, drawOn } from './kit11';
import { Zoom } from './kit11';
import { CUT } from './time11';
import { Q_START } from './Game11';
import { b } from '../v6/ui6';

/* S12 the reply machine: the "?" seats in the lamp socket → the pigeon pecks on drop2 → key + lamp travel into the 回复机
   → the 回复机 shrinks to the page edge and two gauges show 想要 ≠ 喜欢 → "≠ → −" hands over to S13. */

const INK = C.ink;
/* ---------- the pigeon (ported from style/frame4_pigeon.html drawPigeon) ---------- */
export const pigeonBeak = (ox: number, oy: number, s: number, pk: number) => {
  const hx = 118 + 22 * pk, hy = -206 + 26 * pk, hr = 29;
  const a = ((8 + 22 * pk) * Math.PI) / 180;
  const bx = hx + hr * Math.cos(a) - 2, by = hy + hr * Math.sin(a) - 4;
  return [ox + s * (bx + 30 * Math.cos(a)), oy + s * (by + 30 * Math.sin(a))];
};
export const Pigeon: React.FC<{ ox: number; oy: number; s: number; peck: number; o?: number; id: string; bob?: number; tail?: number }> = ({ ox, oy, s, peck: pk, o = 1, id, bob = 0, tail = 0 }) => {
  const grey = '#ddd7cb', greyHead = '#cfc8ba', wingC = '#e9e3d6';
  const hx = 118 + 22 * pk, hy = -206 + 26 * pk, hr = 29;
  const nx0 = 60, ny0 = -140, nW = 70;
  const parts: [string, any][] = [
    ['path', { d: 'M-86,-80 L-164,-92 Q-184,-60 -174,-24 L-80,-40 Z', transform: `rotate(${tail} -86 -60)` }],
    ['ellipse', { cx: -4, cy: -92, rx: 104, ry: 74, transform: 'rotate(-14 -4 -92)' }],
    ['circle', { cx: 64, cy: -112, r: 62 }],
    ['ellipse', { cx: 6, cy: -138, rx: 84, ry: 46, transform: 'rotate(-10 6 -138)' }],
    ['circle', { cx: hx, cy: hy, r: hr }],
  ];
  const neckD = `M${nx0},${ny0} L${hx - 4},${hy + 6}`;
  const shape = (t: string, a: any, extra: any, k: number) => React.createElement(t, { key: k, ...a, ...extra });
  const dx = hx - 4 - nx0, dy = hy + 6 - ny0, L = Math.hypot(dx, dy), nang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const sx = (nx0 + hx) / 2 + 4, sy = (ny0 + hy) / 2 + 8, sang = (Math.atan2(hy - ny0, hx - nx0) * 180) / Math.PI;
  const wing = 'M70,-140 C30,-162 -60,-150 -146,-92 C-86,-68 -8,-66 44,-88 C64,-100 74,-120 70,-140 Z';
  const ang = 8 + 22 * pk, a = (ang * Math.PI) / 180, bx = hx + hr * Math.cos(a) - 2, by = hy + hr * Math.sin(a) - 4;
  const ex = hx + 6, ey = hy - 7;
  return (
    <g transform={`translate(${ox} ${oy + bob}) scale(${s})`} opacity={o}>
      <defs>
        <clipPath id={`${id}c`}>
          {parts.map(([t, a2], k) => shape(t, a2, {}, k))}
          <rect x={nx0} y={ny0 - nW / 2} width={L} height={nW} transform={`rotate(${nang} ${nx0} ${ny0})`} />
        </clipPath>
        <clipPath id={`${id}w`}><path d={wing} /></clipPath>
      </defs>
      <g>
        {parts.map(([t, a2], k) => shape(t, a2, { fill: INK, stroke: INK, strokeWidth: 7, strokeLinejoin: 'round' }, k))}
        <path d={neckD} stroke={INK} strokeWidth={nW + 7} strokeLinecap="round" fill="none" />
        {parts.map(([t, a2], k) => shape(t, a2, { fill: grey, stroke: 'none' }, k + 10))}
        <path d={neckD} stroke={grey} strokeWidth={nW} strokeLinecap="round" fill="none" />
      </g>
      <g clipPath={`url(#${id}c)`}>
        <circle cx={hx + 2} cy={hy - 2} r={hr - 6} fill={greyHead} opacity={0.55} filter="url(#k-softHead)" />
        <ellipse cx={-4} cy={-26} rx={150} ry={50} fill="url(#k-hatch)" opacity={0.7} />
        <ellipse cx={-140} cy={-30} rx={60} ry={26} fill="url(#k-hatch)" opacity={0.5} />
        <path d="M-156,-92 L-200,-96 L-200,-20 L-162,-26 Q-170,-58 -156,-92 Z" fill={INK} opacity={0.8} transform={`rotate(${tail} -86 -60)`} />
      </g>
      <g transform={`translate(${sx} ${sy}) rotate(${sang})`}>
        <ellipse cx={0} cy={0} rx={30} ry={15} fill="url(#k-sheen)" opacity={0.38} />
        {[-2, -1, 0, 1, 2].map((i) => <path key={i} d={`M${i * 9 - 3},9 q3,-9 8,-17`} stroke={i % 2 ? '#17706c' : '#a87a26'} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.6} />)}
      </g>
      <path d={wing} fill={wingC} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <g clipPath={`url(#${id}w)`}>
        <rect x={-160} y={-170} width={240} height={110} fill="url(#k-hatchFine)" opacity={0.35} />
        <path d="M-2,-150 C-12,-130 -20,-108 -24,-78" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d="M-44,-140 C-56,-122 -64,-102 -70,-78" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.85} />
      </g>
      <path d={`M${bx},${by - 7} L${bx + 30 * Math.cos(a)},${by + 30 * Math.sin(a)} L${bx - 2},${by + 7} Z`} fill="#4a423a" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <ellipse cx={bx - 2} cy={by - 6} rx={7.5} ry={4.8} fill="#f6f1e6" stroke={INK} strokeWidth={1.8} transform={`rotate(${ang} ${bx - 2} ${by - 6})`} />
      <circle cx={ex} cy={ey} r={8.5} fill="#e9a54a" stroke={INK} strokeWidth={2.2} />
      <circle cx={ex + 1.5} cy={ey} r={4.4} fill={INK} />
      <circle cx={ex + 3} cy={ey - 2.2} r={1.6} fill="#fff" />
      {[-4, 26].map((x) => <path key={x} d={`M${x},-28 L${x + 3},-3`} stroke="#b8493e" strokeWidth={7} strokeLinecap="round" />)}
    </g>
  );
};

/* ---------- lamp, key ---------- */
export const Lamp: React.FC<{ x: number; y: number; r: number; lit: number; ray?: number; q?: number }> = ({ x, y, r, lit, ray = 1, q = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    {lit > 0.01 && (
      <g opacity={lit}>
        <circle r={r * 3 * Math.max(ray, 0.7)} fill="url(#k-lampHalo)" />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2, r0 = r + 14 * (r / 58) + 2, r1 = r0 + ray * (i % 2 ? 20 : 36) * Math.max(0.45, r / 58);
          return <line key={i} x1={r0 * Math.cos(a)} y1={r0 * Math.sin(a)} x2={r1 * Math.cos(a)} y2={r1 * Math.sin(a)} stroke={C.gold} strokeWidth={i % 2 ? 2 : 3} strokeLinecap="round" strokeOpacity={0.85} />;
        })}
      </g>
    )}
    <circle r={r + 9 * (r / 58) + 2} fill="#e8dfcb" stroke={INK} strokeWidth={3.5} />
    <circle r={r + 9 * (r / 58) + 2} fill="url(#k-hatchV)" opacity={0.25} />
    <circle r={r} fill="#cfc8ba" stroke={INK} strokeWidth={2.5} />
    {lit > 0.01 && <circle r={r} fill="url(#k-lampLit)" opacity={lit} />}
    <path d={`M${-r * 0.55},${-r * 0.2} A${r * 0.62},${r * 0.62} 0 0 1 ${-r * 0.1},${-r * 0.6}`} stroke="#fffaf0" strokeWidth={r * 0.12} strokeLinecap="round" fill="none" opacity={0.5 + 0.4 * lit} />
    {q > 0.01 && <text y={r * 0.38} textAnchor="middle" opacity={q} style={{ fontFamily: F.lat, fontWeight: 700, fontSize: r * 1.1 }} fill="#6f685d">?</text>}
  </g>
);
export const Key: React.FC<{ x: number; y: number; r: number; pressed: number; gold?: number }> = ({ x, y, r, pressed, gold = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    {gold > 0.01 && <circle r={(r + 8 * (r / 26)) * 1.6} fill="url(#k-lampHalo)" opacity={gold} />}
    <circle r={r + 8 * (r / 26)} fill="#e8dfcb" stroke={INK} strokeWidth={3} />
    <circle r={r} fill={pressed > 0.5 ? '#d9cfba' : '#efe7d6'} stroke={INK} strokeWidth={2.5} />
    <circle r={r - 7 * (r / 26)} fill="url(#k-hatchFine)" opacity={0.2 + 0.25 * pressed} />
    {gold > 0.01 && <circle r={r + 4 * (r / 26)} fill="none" stroke={C.gold} strokeWidth={4} opacity={gold} />}
  </g>
);

/* ---------- frame-4 geometry ---------- */
const FLOOR = 690;
const [BKX, BKY] = pigeonBeak(690, FLOOR, 1.12, 1);
const KX = BKX + 30, KY = BKY;
const PX = KX - 104, PW = 280, PY = 232, PH = FLOOR - 232;
const LX = KX, LY = PY + 122;
const CX = 1500, CY = 420, CR = 124;
const RY = 766, RX0 = 500, RX1 = 1720;
/* ---------- frame-5 geometry ---------- */
export const FLOOR2 = 700;
export const MW = 360, MX = 1150, MY = 226, MH = FLOOR2 - 226, CXm = MX + MW / 2;
export const WX = MX + 34, WW = MW - 68, WH = 70, WG = 10, WY0 = MY + 156;
export const MACHINE_SMALL = { s: 0.35, cx: 1653, cy: 470 }; // where the 回复机 parks for S13
export const MCX = MX + MW / 2, MCY = MY + MH / 2;

const PECK0 = CUT.drop2;
const peckAt = (T: number) => {
  if (T < PECK0) return { peck: 0, hit: false, n: 0 };
  const f = Math.floor((T - PECK0) * 30);
  const k = f % 8;
  return { peck: k < 3 ? k / 3 : 1 - (k - 3) / 5, hit: k === 3 || k === 4, n: Math.floor(f / 8) };
};
const FLASHES = [0, 2, 3, 6, 7, 11].map((k) => PECK0 + 0.267 * k); // B2: k = 0, 2, 3 …then irregular
const flashLevel = (T: number, list: number[], d = 0.15) => list.reduce((m, t) => (T >= t && T < t + d + 0.2 ? Math.max(m, T < t + d ? 1 : Math.exp(-(T - t - d) / 0.06)) : m), 0);

/* ---------- the reels ---------- */
type Item = '已读' | '在吗' | 'dots' | 'heart';
const REEL: Item[] = ['已读', '在吗', 'dots', 'heart', '已读', 'dots', '在吗', '已读', 'heart', 'dots'];
export const Bubble: React.FC<{ cx: number; cy: number; kind: Item; w?: number; o?: number }> = ({ cx, cy, kind, w = 196, o = 1 }) => {
  const h = 46;
  return (
    <g transform={`translate(${cx} ${cy})`} opacity={o}>
      <path d={`M${-w / 2 + 24},${-h / 2} H${w / 2 - 24} A24,24 0 0 1 ${w / 2},${-h / 2 + 24} V${h / 2 - 24} A24,24 0 0 1 ${w / 2 - 24},${h / 2} H${-w / 2 + 30} L${-w / 2 + 8},${h / 2 + 10} L${-w / 2 + 12},${h / 2 - 4} A24,24 0 0 1 ${-w / 2},${h / 2 - 26} V${-h / 2 + 24} A24,24 0 0 1 ${-w / 2 + 24},${-h / 2} Z`}
        fill={kind === 'heart' ? '#fbf1d6' : '#fbf6ea'} stroke={kind === 'heart' ? C.goldD : INK} strokeWidth={2.4} strokeLinejoin="round" />
      {kind === '已读' && <text y={11} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: 4 }} fill={C.ink3}>已读</text>}
      {kind === '在吗' && <text y={11} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: 4 }} fill={C.ink4}>在吗</text>}
      {kind === 'dots' && [-22, 0, 22].map((x) => <circle key={x} cx={x} cy={0} r={6} fill={C.ink2} />)}
      {kind === 'heart' && <use href="#k-heart" x={-20} y={-22} width={40} height={40} fill="#d9a441" stroke={C.goldDD} strokeWidth={2.4} />}
    </g>
  );
};
/** reel offset (in items) for a roll from `a` to `z` that ends on item `target` */
const rollPos = (T: number, a: number, z: number, from: number, target: number, speed = 9) => {
  if (T <= a) return from;
  const dur = z - a;
  let D = Math.round(speed * dur);
  const land = ((from + D) % REEL.length + REEL.length) % REEL.length;
  D += ((target - land) % REEL.length + REEL.length) % REEL.length;
  const k = clamp((T - a) / dur);
  // fast start, eased landing with a small overshoot
  const e = 1 - Math.pow(1 - k, 2.4);
  const settle = T > z ? 0.08 * Math.exp(-(T - z) * 9) * Math.sin((T - z) * 30) : 0;
  return from + D * e - settle;
};
export const Reel: React.FC<{ i: number; pos: number; speed: number }> = ({ i, pos, speed }) => {
  const y = WY0 + i * (WH + WG), cy = y + WH / 2;
  const base = Math.floor(pos);
  const items = [];
  for (let k = base - 1; k <= base + 2; k++) {
    const kind = REEL[((k % REEL.length) + REEL.length) % REEL.length];
    const yy = cy - 2 + (k - pos) * 56;
    items.push(<Bubble key={k} cx={CXm} cy={yy} kind={kind} />);
    if (speed > 2) [1, 2].forEach((g) => items.push(<Bubble key={`${k}g${g}`} cx={CXm} cy={yy - g * 10} kind={kind} o={0.18 / g} />));
  }
  return (
    <g>
      <clipPath id={`win${i}`}><rect x={WX} y={y} width={WW} height={WH} rx={10} /></clipPath>
      <rect x={WX} y={y} width={WW} height={WH} rx={10} fill="#e3d8c1" />
      <g clipPath={`url(#win${i})`}>
        {items}
        <rect x={WX} y={y} width={WW} height={12} fill="url(#k-hatchFine)" opacity={0.55} />
      </g>
      <rect x={WX} y={y} width={WW} height={WH} rx={10} fill="none" stroke={INK} strokeWidth={3} />
    </g>
  );
};

/* ---------- the clock ---------- */
const Clock: React.FC<{ H0: number; o: number }> = ({ H0, o }) => {
  const rr = CR - 30, sweep = 150;
  const a0 = ((H0 - sweep - 90) * Math.PI) / 180, a1 = ((H0 - 90) * Math.PI) / 180;
  const ax = (rr + 16) * Math.cos(a1), ay = (rr + 16) * Math.sin(a1);
  return (
    <g transform={`translate(${CX} ${CY})`} opacity={o}>
      <circle r={CR + 12} fill="#efe6d1" stroke={INK} strokeWidth={3.5} />
      <circle r={CR + 12} fill="url(#k-hatchV)" opacity={0.18} />
      <circle r={CR} fill="#f7f1e2" stroke={INK} strokeWidth={1.6} />
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2, big = i % 5 === 0, r0 = CR - (big ? 18 : 8);
        return <line key={i} x1={r0 * Math.sin(a)} y1={-r0 * Math.cos(a)} x2={(CR - 3) * Math.sin(a)} y2={-(CR - 3) * Math.cos(a)} stroke={INK} strokeWidth={big ? 3 : 1.2} />;
      })}
      {[0, 1, 2, 3].map((q) => { const a = (q * Math.PI) / 2; return <line key={q} x1={(CR - 34) * Math.sin(a)} y1={-(CR - 34) * Math.cos(a)} x2={(CR - 3) * Math.sin(a)} y2={-(CR - 3) * Math.cos(a)} stroke={INK} strokeWidth={6} />; })}
      <path d={`M0,0 L${rr * Math.cos(a0)},${rr * Math.sin(a0)} A${rr},${rr} 0 0 1 ${rr * Math.cos(a1)},${rr * Math.sin(a1)} Z`} fill={C.gold} opacity={0.1} />
      <path d={`M${(rr + 16) * Math.cos(a0)},${(rr + 16) * Math.sin(a0)} A${rr + 16},${rr + 16} 0 0 1 ${(rr + 16) * Math.cos(a1 - 0.12)},${(rr + 16) * Math.sin(a1 - 0.12)}`} fill="none" stroke={C.goldD} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${ax - 12 * Math.cos(a1 - 1.2)},${ay - 12 * Math.sin(a1 - 1.2)} L${ax},${ay} L${ax - 12 * Math.cos(a1 + 0.6 + Math.PI / 2)},${ay - 12 * Math.sin(a1 + 0.6 + Math.PI / 2)}`} fill="none" stroke={C.goldD} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {[0.12, 0.22, 0.34].map((op, i) => <line key={i} x1={0} y1={0} x2={0} y2={-(CR - 58)} stroke={INK} strokeWidth={7} strokeLinecap="round" opacity={op} transform={`rotate(${H0 - 38 * (3 - i)})`} />)}
      <line x1={0} y1={12} x2={0} y2={-(CR - 58)} stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${H0})`} />
      <circle r={CR - 26} fill={INK} opacity={0.045} />
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={0} y1={0} x2={0} y2={-(CR - 26)} stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.05 + i * 0.03} transform={`rotate(${H0 * 12 + 300 + i * 6})`} />)}
      <circle r={8} fill={INK} />
    </g>
  );
};

/* ---------- gauges ---------- */
const GaugeBig: React.FC<{ x: number; y: number; r: number; ang: number; label: string; p: number }> = ({ x, y, r, ang, label, p }) => {
  const arc = (a0: number, a1: number, rr: number) => `M${rr * Math.cos(Math.PI - a0)},${-rr * Math.sin(Math.PI - a0)} A${rr},${rr} 0 0 1 ${rr * Math.cos(Math.PI - a1)},${-rr * Math.sin(Math.PI - a1)}`;
  const na = Math.PI - ang;
  return (
    <g transform={`translate(${x} ${y})`} opacity={clamp(p * 2)}>
      <path d={arc(0, Math.PI * 0.36, r - 12)} stroke={C.redUI} strokeWidth={18} fill="none" opacity={0.75} {...drawOn(p)} />
      <path d={arc(Math.PI * 0.64, Math.PI, r - 12)} stroke={C.gold} strokeWidth={18} fill="none" opacity={0.85} {...drawOn(p)} />
      <path d={arc(0, Math.PI, r)} stroke={INK} strokeWidth={3} fill="none" {...drawOn(p)} />
      {Array.from({ length: 11 }, (_, i) => { const t = Math.PI * (1 - i / 10); return <line key={i} x1={(r - 28) * Math.cos(t)} y1={-(r - 28) * Math.sin(t)} x2={(r + 2) * Math.cos(t)} y2={-(r + 2) * Math.sin(t)} stroke={INK} strokeWidth={i % 5 === 0 ? 3 : 1.4} opacity={clamp(p * 3 - 1)} />; })}
      <line x1={0} y1={0} x2={(r - 30) * Math.cos(na)} y2={-(r - 30) * Math.sin(na)} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={clamp(p * 3 - 1.5)} />
      <circle r={12} fill={INK} opacity={clamp(p * 3 - 1.5)} />
      <text y={64} textAnchor="middle" opacity={clamp(p * 2 - 0.6)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={INK}>{label}</text>
    </g>
  );
};

/* ---------- the scene ---------- */
export const S12: React.FC<{ T: number; layer?: 'main' | 'over' }> = ({ T, layer = 'main' }) => {
  if (T < CUT.silent - 0.6 || T > CUT.s13 + 0.8) return null;
  // 'main' draws everything until the ≠ → − hand-off; 'over' (rendered above S13) draws S12's fading ink and the travelling bar after it
  if (layer === 'main' && T >= CUT.s13) return null;
  if (layer === 'over' && T < CUT.s13) return null;
  const over = layer === 'over';
  const pb = eio(T, b(158), CUT.drop2 - b(158));       // pull-back 71.88 → 72.89
  // the "?" : tips (b155), drifts down through the silent bar, then is caught by the socket
  const tip = eio(T, b(155), 0.45);
  const fall = easeInOut(pr(T, CUT.silent, b(158) - CUT.silent));
  const qPark = { x: Q_START.x + 14 * tip, y: Q_START.y + 56 * fall + 6 * tip };
  const sCam = lerp(2.2, 1, pb);
  const P = { x: lerp(qPark.x - 40, LX, pb), y: lerp(qPark.y - 10, LY, pb) };
  const catchK = eio(T, b(158), 0.7);
  const qx = lerp(qPark.x, P.x, catchK), qy = lerp(qPark.y, P.y, catchK);
  const seated = T >= b(158) + 0.7;
  const pageIn = eo(T, b(158) + 0.24, 0.3);
  // pecking
  const pk = peckAt(T);
  const machine = CUT.machine;
  const recede = eio(T, machine, 0.6);
  const peck = T < machine ? pk.peck : 1; // B3: the thumbnail is frozen
  const lampLit = T < CUT.drop2 ? 0 : flashLevel(T, FLASHES.filter((t) => t < machine + 0.1));
  const H0 = 215 + Math.max(0, T - CUT.drop2) * 300;
  // machine build
  const travel = eio(T, machine + 0.05, 0.6);
  const cab = pr(T, machine + 0.3, 0.5);
  const plate = eo(T, machine + 0.6, 0.35);
  const winOpen = eo(T, b(164) - 0.1, 0.25);
  const r1 = T < b(167.8) ? rollPos(T, b(164), b(165), 0, 0) : rollPos(T, b(167.8), b(168.6), 10, 0, 7);
  const r2 = rollPos(T, b(164), b(166), 0, 3);
  const r3 = rollPos(T, b(164) + 0.05, b(167.5), 0, 2);
  const sp = (a: number, z: number) => (T > a && T < z - 0.15 ? 9 : 0);
  const heartFlash = flashLevel(T, [b(166), b(173.3), b(178.4), b(181)], 0.15);
  const tagIn = eo(T, b(165.5), 0.25);
  const tagAng = swing(T, b(165.5), 22, 1.3, 3.2);
  // L23+: gauges
  const g = CUT.gauges;
  const out1 = eo(T, g, 0.4);
  const shrink = eio(T, g, 0.6);
  const gp = eo(T, g + 0.3, 0.7);
  const wantA = lerp(Math.PI * 0.5, Math.PI * 0.86, clamp(spring(T, b(170), 1.3, 3.2)));
  const likeA = T < CUT.neq ? lerp(Math.PI * 0.5, Math.PI * 0.6, eo(T, g + 0.6, 0.6)) : lerp(Math.PI * 0.6, Math.PI * 0.13, clamp(spring(T, CUT.neq, 1.4, 3.4)));
  const neq = T >= CUT.neq ? pop(T, CUT.neq, 0.2) : 0;
  const nS = T >= CUT.neq ? lerp(1.5, 1, eo(T, CUT.neq, 0.17)) : 0;
  const toMinus = eio(T, CUT.s13, 0.6);
  const sceneO = 1 - eo(T, CUT.s13, 0.27);
  // the machine transform (full → parked small)
  const ms = lerp(1, MACHINE_SMALL.s, shrink);
  const mtx = lerp(MCX, MACHINE_SMALL.cx, shrink), mty = lerp(MCY, MACHINE_SMALL.cy, shrink);
  const machineT = `translate(${mtx} ${mty}) scale(${ms}) translate(${-MCX} ${-MCY})`;
  // key + lamp positions
  const kx = lerp(KX, CXm, travel), ky = lerp(KY, MY + MH - 44, travel), kr = lerp(26, 18, travel);
  const lx = lerp(LX, CXm, travel), ly = lerp(LY, MY + 64, travel), lr = lerp(58, 21, travel);
  const machineLamp = Math.max(heartFlash, flashLevel(T, [b(171), b(175.5), b(180.3)], 0.12));
  // record strip
  const scroll = Math.max(0, T - CUT.drop2) * 28;
  const presetLit = [0.07, 0.13, 0.36, 0.41, 0.43, 0.71, 0.93];
  const stripO = 1 - out1;
  const sub = T < machine ? '· 鸽子实验' : T < g ? '· 回复机' : '· 另一项研究';
  const subP = T < machine ? 1 : T < g ? eo(T, machine + 0.1, 0.3) : eo(T, g + 0.1, 0.3);
  const thumbO = lerp(1, 0.5, recede) * (1 - out1);
  const sIn = seated ? 1 : 0;
  return (
    <Zoom>
      <div style={{ position: 'absolute', inset: 0, clipPath: sCam > 1.001 ? 'inset(92px 120px 280px 120px)' : undefined }}>
      <Cam s={sCam} cx={LX} cy={LY} x={P.x - LX} y={P.y - LY} o={pageIn * sceneO}>
        {!over && <PaperDiv />}
        <Svg>
          <PageInk title="说不准的奖励" sub={sub} subP={subP} no="Ledger · No. 7" />
          {/* ---- the pigeon box (L21) ---- */}
          <g opacity={thumbO}>
            {(() => {
              // shrink to the thumbnail where it stood (frame 5: pigeon at (712, 700) s .62)
              const ts = lerp(1, 0.62 / 1.12, recede);
              const tx = lerp(0, 712 - 690 * ts, recede), ty = lerp(0, FLOOR2 - FLOOR * ts, recede);
              return (
                <g transform={`translate(${tx} ${ty}) scale(${ts})`}>
                  {T < machine + 0.65 && (
                    <>
                      <rect x={470} y={FLOOR} width={790} height={18} fill="url(#k-hatch)" opacity={0.55 * (1 - recede)} />
                      <line x1={470} y1={FLOOR} x2={1260} y2={FLOOR} stroke={INK} strokeWidth={3} opacity={1 - recede} />
                    </>
                  )}
                  <rect x={PX + PW} y={PY + 10} width={16} height={PH - 10} fill="url(#k-hatch)" opacity={0.6} />
                  <rect x={PX} y={PY} width={PW} height={PH} fill="#f1e8d4" stroke={INK} strokeWidth={3.5} />
                  <rect x={PX + 12} y={PY + 12} width={PW - 24} height={PH - 24} fill="none" stroke={INK} strokeWidth={1.2} strokeOpacity={0.55} />
                  {[[PX + 24, PY + 24], [PX + PW - 24, PY + 24], [PX + 24, PY + PH - 24], [PX + PW - 24, PY + PH - 24]].map(([x, y], i) => (
                    <g key={i}><circle cx={x} cy={y} r={6} fill="#e2d8c2" stroke={INK} strokeWidth={1.6} /><line x1={x - 4} y1={y - 3} x2={x + 4} y2={y + 3} stroke={INK} strokeWidth={1.4} /></g>
                  ))}
                  {/* the panel keeps a grey lamp + key once the originals have travelled */}
                  {travel > 0 && <><Lamp x={LX} y={LY} r={58} lit={0} /><Key x={KX} y={KY} r={26} pressed={0} /></>}
                  <Pigeon ox={690} oy={FLOOR} s={1.12} peck={peck} id="pg12" bob={T < machine && T >= CUT.drop2 ? 4 * peck : 0} tail={T < machine && T >= CUT.drop2 ? 2 * peck : 0} />
                  {/* B4: impact strokes only on peck frames */}
                  {pk.hit && T < machine && (
                    <g transform={`translate(${BKX + 6} ${BKY})`}>
                      {[[-30, -34, -18, -50], [-6, -40, -2, -58], [-30, 34, -18, 50], [-6, 40, -2, 58]].map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={3} strokeLinecap="round" />)}
                    </g>
                  )}
                </g>
              );
            })()}
          </g>
          {T < machine + 0.3 && (
            <g opacity={1 - eo(T, machine, 0.3)}>
              <text x={520} y={300} opacity={eo(T, CUT.drop2, 0.25)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 44 }} fill={C.goldD}>奖励</text>
              <text x={520} y={350} opacity={eo(T, CUT.drop2, 0.25)} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 34 }} fill={C.ink2}>说不准什么时候亮</text>
              <path d={`M624,288 C740,282 ${LX - 140},${LY - 30} ${LX - 76},${LY - 6}`} stroke={C.ink2} strokeWidth={1.8} fill="none" strokeDasharray="2 6" strokeLinecap="round" opacity={eo(T, CUT.drop2 + 0.1, 0.25)} />
              <Clock H0={H0} o={1 - eo(T, machine, 0.4)} />
            </g>
          )}
          {/* ---- the 回复机 (L22) ---- */}
          {T >= machine + 0.25 && (
            <g transform={machineT}>
              <rect x={MX + 14} y={MY + 18} width={MW} height={MH - 18} rx={52} fill="url(#k-hatch)" opacity={0.5 * clamp(cab * 2 - 0.6)} />
              <rect x={MX} y={MY} width={MW} height={MH} rx={52} fill="#efe6d1" opacity={clamp(cab * 2 - 0.5)} />
              <rect x={MX} y={MY} width={MW} height={MH} rx={52} fill="none" stroke={INK} strokeWidth={4} {...drawOn(cab)} />
              <rect x={MX + 14} y={MY + 14} width={MW - 28} height={MH - 28} rx={40} fill="none" stroke={INK} strokeWidth={1.2} strokeOpacity={0.5} opacity={clamp(cab * 2 - 1)} />
              <g opacity={plate}>
                <rect x={CXm - 92} y={MY + 98} width={184} height={44} rx={4} fill="#f6efdc" stroke={C.goldD} strokeWidth={2.2} />
                <rect x={CXm - 86} y={MY + 104} width={172} height={32} rx={2} fill="none" stroke={C.goldD} strokeWidth={0.9} />
                <text x={CXm} y={MY + 130} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28, letterSpacing: 6 }} fill={INK}>回复机</text>
              </g>
              <g opacity={winOpen}>
                <Reel i={0} pos={r1} speed={T < b(165) - 0.15 && T > b(164) ? 9 : sp(b(167.8), b(168.6))} />
                <Reel i={1} pos={r2} speed={sp(b(164), b(166))} />
                <Reel i={2} pos={r3} speed={sp(b(164), b(167.5))} />
                {heartFlash > 0.02 && T < b(167) && [-1, 1].map((d) => {
                  const x = d < 0 ? WX - 14 : WX + WW + 14, cyy = WY0 + WH + WG + WH / 2;
                  return <g key={d} opacity={heartFlash}>{[[-12], [0], [12]].map(([dy]) => <line key={dy} x1={x} y1={cyy + dy} x2={x + d * 14} y2={cyy + dy * 1.5} stroke={C.goldD} strokeWidth={2.6} strokeLinecap="round" />)}</g>;
                })}
              </g>
            </g>
          )}
          {/* key + lamp (the originals, travelling into the machine) */}
          <g transform={T >= machine + 0.25 ? machineT : undefined}>
            <Lamp x={lx} y={ly} r={lr} lit={T < machine ? lampLit : Math.max(machineLamp, 1 - pr(T, machine + 0.6, 0.25))} ray={lerp(1, 0.4, travel)} q={seated && T < CUT.drop2 ? 1 : T < CUT.drop2 + 0.15 && seated ? 1 - pr(T, CUT.drop2, 0.15) : 0} />
            <Key x={kx} y={ky} r={kr} pressed={T < machine && pk.hit ? 1 : 0} gold={T >= machine ? 1 - pr(T, machine + 0.6, 0.25) : 0} />
          </g>
          {/* the 像 tag */}
          {tagIn > 0 && (
            <g opacity={tagIn * (1 - out1)}>
              <path d={`M${MX + 2},${MY + 170} C${MX - 40},${MY + 176} ${1046 + 40},${468 - 110} ${1046 + 6},${468 - 52}`} fill="none" stroke={C.ink2} strokeWidth={1.8} />
              <g transform={`translate(1046 ${468 - 70}) rotate(${-8 + tagAng}) translate(0 70)`}>
                <path d="M-44,-40 L0,-70 L44,-40 L44,62 L-44,62 Z" fill="#f8f1e0" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
                <circle cx={0} cy={-44} r={7} fill="#efe6d1" stroke={INK} strokeWidth={2} />
                <text y={38} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 64 }} fill={INK}>像</text>
              </g>
            </g>
          )}
          {/* record strip: every peck is a tick; the light only now and then */}
          <g opacity={stripO}>
            <clipPath id="s12-strip"><rect x={RX0} y={RY - 50} width={RX1 - RX0} height={70} /></clipPath>
            <g clipPath="url(#s12-strip)">
              {Array.from({ length: 170 }, (_, i) => {
                const x = RX0 + ((i * 7.5 - scroll) % (RX1 - RX0 + 7.5) + (RX1 - RX0 + 7.5)) % (RX1 - RX0 + 7.5);
                return <line key={i} x1={x} y1={RY - 9} x2={x} y2={RY + 9} stroke={INK} strokeWidth={1.3} strokeOpacity={0.55} />;
              })}
              {[...presetLit.map((t) => RX0 + (RX1 - RX0) * t - scroll), ...FLASHES.filter((t) => T >= t).map((t) => RX1 - (T - t) * 28)].map((x, i) => {
                const heart = travel > 0.5;
                return heart ? (
                  <use key={i} href="#k-heart" x={x - 9} y={RY - 40} width={18} height={18} fill="#e2ad4c" stroke={C.goldD} strokeWidth={3} />
                ) : (
                  <circle key={i} cx={x} cy={RY - 30} r={6.5} fill="#e2ad4c" stroke={C.goldD} strokeWidth={1.5} />
                );
              })}
            </g>
            {travel < 0.5 ? (
              <g opacity={1 - travel * 2}>
                <text x={RX0 - 12} y={RY - 20} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.goldD}>亮</text>
                <text x={RX0 - 12} y={RY + 10} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.ink2}>啄</text>
              </g>
            ) : (
              <g opacity={travel * 2 - 1}>
                <use href="#k-heart" x={RX0 - 40} y={RY - 48} width={26} height={26} fill="#d9a441" stroke={C.goldDD} strokeWidth={2.4} />
                <text x={RX0 - 12} y={RY + 10} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26 }} fill={C.ink2}>看手机</text>
              </g>
            )}
          </g>
          {/* ---- gauges (L23–L24) ---- */}
          {T >= g && (
            <g>
              <GaugeBig x={700} y={600} r={170} ang={wantA} label="想要" p={gp} />
              <GaugeBig x={1250} y={600} r={170} ang={likeA} label="喜欢" p={eo(T, g + 0.45, 0.7)} />
            </g>
          )}
          {T < machine ? <Margin11 chip="示意" lines={['鸽子实验', 'B. F. Skinner', '1953']} o={eo(T, CUT.drop2, 0.3)} />
            : T < g ? <Margin11 chip="类比" lines={['回复机为示意', 'Skinner 1953']} o={eo(T, machine + 0.3, 0.3)} />
            : <Margin11 chip="另一项研究" lines={['Dai 等 2014', '已经上心时']} o={eo(T, g + 0.3, 0.3)} />}
        </Svg>
      </Cam>
      </div>
      {/* the falling "?" (screen space) until it seats */}
      {!seated && T >= b(154) && (
        <Svg>
          <g transform={`translate(${qx} ${qy}) rotate(${35 * tip * (1 - catchK)}) scale(${lerp(1.1, (58 / 24) * sCam * 0.95, catchK)})`}>
            <circle r={24} fill="#cfc8bb" fillOpacity={0.85} stroke="#9d968a" strokeWidth={2} />
            <text y={13} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 40 }} fill="#6f685d">?</text>
          </g>
        </Svg>
      )}
      {/* ≠ (and its lower bar sliding into the ledger as "−") */}
      {neq > 0 && (
        <Svg>
          <g transform={`translate(975 ${520}) scale(${nS})`} opacity={Math.min(1, neq) * (1 - eo(T, CUT.s13, 0.25))}>
            <rect x={-62} y={-34} width={124} height={18} rx={3} fill={C.red} />
            <line x1={34} y1={-74} x2={-34} y2={74} stroke={C.red} strokeWidth={16} strokeLinecap="round" />
          </g>
          {(() => {
            const x = lerp(975 - 62 * nS, 460, toMinus), y = lerp(520 + 25 * nS, 576, toMinus), w = lerp(124 * nS, 28, toMinus), h = lerp(18 * nS, 5, toMinus);
            return <rect x={x} y={y - h / 2} width={w} height={h} rx={2} fill={toMinus > 0.8 ? C.red : C.red} opacity={Math.min(1, neq) * (1 - eo(T, CUT.s13 + 0.62, 0.15))} />;
          })()}
        </Svg>
      )}
    </Zoom>
  );
};

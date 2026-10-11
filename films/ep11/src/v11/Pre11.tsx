import React from 'react';
import { C, F, LNUM, Svg, pr, eo, eio, pop, lerp, clamp, rnd } from './kit11';
import { PB } from './long11';

/* v6 cold open · the cinema before the film. The projector comes on with the track's first hit; the leader counts
   5 · 4 · 3 · 2 · 1 on the intro's accents; your seat (7排 12座, the ticket's seat) lights on its own accent;
   the leader pops, the screen goes dark, and on bar 4 we cut into v5's bad film (S01's screen sits exactly where
   this screen lands after the push). T = track seconds. */

const SX = 300, SY = 70, SW = 1320, SH = 400, CX = 960, CY = 270;
const NUMS: [number, string][] = [[PB.on, '5'], [PB.four, '4'], [PB.three, '3'], [PB.two, '2'], [PB.one, '1']];

const wedge = (r: number, p: number) => {
  // the leader's sweep: from 12 o'clock clockwise through fraction p
  if (p <= 0) return '';
  const a = -Math.PI / 2 + Math.min(p, 0.9999) * 2 * Math.PI;
  const large = p > 0.5 ? 1 : 0;
  return `M${CX},${CY} L${CX},${CY - r} A${r},${r} 0 ${large} 1 ${CX + r * Math.cos(a)},${CY + r * Math.sin(a)} Z`;
};

type Row = { y: number; h: number; w: number; gap: number; x0: number; rim: number };
const ROWS: Row[] = [
  { y: 560, h: 130, w: 98, gap: 12, x0: 40, rim: 0.75 },
  { y: 676, h: 180, w: 140, gap: 16, x0: -10, rim: 0.6 },
  { y: 826, h: 320, w: 206, gap: 20, x0: -60, rim: 0.45 },
];
const MY_ROW = 1, MY_SEAT = 8; // the lit seat (row B, the 9th back from the left ≈ just right of centre)
const HEADS: [number, number][] = [[0, 3], [0, 6], [0, 11], [0, 14], [1, 2], [1, 5], [1, 11], [2, 1], [2, 7]];

const Seat: React.FC<{ x: number; r: Row; lit?: number }> = ({ x, r, lit = 0 }) => (
  <g>
    <rect x={x} y={r.y} width={r.w} height={r.h} rx={r.w * 0.2} fill="#0b0f1a" />
    <rect x={x + r.w * 0.08} y={r.y + r.h * 0.06} width={r.w * 0.84} height={r.h * 0.34} rx={r.w * 0.16} fill="#111829" />
    <path d={`M${x + r.w * 0.2},${r.y + 1.5} H${x + r.w * 0.8}`} stroke="#4a5b82" strokeWidth={2.4} strokeLinecap="round" opacity={r.rim} />
    {lit > 0 && (
      <g opacity={lit}>
        <rect x={x} y={r.y} width={r.w} height={r.h} rx={r.w * 0.2} fill="none" stroke={C.goldHi} strokeWidth={3} />
        <path d={`M${x + r.w * 0.16},${r.y + 2} H${x + r.w * 0.84}`} stroke="#ffe3a0" strokeWidth={4} strokeLinecap="round" />
      </g>
    )}
  </g>
);

const Head: React.FC<{ x: number; r: Row; T: number; i: number }> = ({ x, r, T, i }) => {
  const s = r.w / 140, sway = 2.2 * Math.sin(T * 0.9 + i * 1.7) * s;
  const cx = x + r.w / 2 + sway, top = r.y - 64 * s;
  return (
    <g>
      <path d={`M${cx - 52 * s},${r.y + 26 * s} Q${cx - 50 * s},${r.y - 6 * s} ${cx - 18 * s},${r.y - 12 * s} H${cx + 18 * s} Q${cx + 50 * s},${r.y - 6 * s} ${cx + 52 * s},${r.y + 26 * s} Z`} fill="#070a12" />
      <ellipse cx={cx} cy={top + 30 * s} rx={27 * s} ry={33 * s} fill="#070a12" />
      <path d={`M${cx - 20 * s},${top + 6 * s} Q${cx},${top - 4 * s} ${cx + 20 * s},${top + 6 * s}`} stroke="#3c4b6e" strokeWidth={2} fill="none" opacity={0.6} />
    </g>
  );
};

export const Pre11: React.FC<{ T: number }> = ({ T }) => {
  if (T >= PB.cut) return null;
  const on = T >= PB.on ? 1 : 0;
  const fr = Math.floor(T * 24); // the projector runs at 24
  const flick = on * (0.93 + 0.07 * rnd(fr, 5));
  // camera: a slow push into the screen, a kick on every number, landing at scale 1 on the cut (S01's frame)
  let kick = 0;
  for (const [t] of NUMS) if (T >= t) kick += 0.014 * Math.exp(-(T - t) / 0.16);
  if (T >= PB.pop) kick += 0.02 * Math.exp(-(T - PB.pop) / 0.12);
  const s = lerp(0.8, 1, eio(T, PB.on, PB.cut - PB.on)) + kick;
  // the leader
  let cur = -1;
  NUMS.forEach(([t], i) => { if (T >= t) cur = i; });
  const t0 = cur >= 0 ? NUMS[cur][0] : 0, t1 = cur >= 0 ? (NUMS[cur + 1]?.[0] ?? PB.pop) : 1;
  const sweep = cur >= 0 ? clamp((T - t0) / (t1 - t0)) : 0;
  const numK = cur >= 0 ? pop(T, t0, 0.16) : 0;
  const popped = T >= PB.pop;
  const popFlash = popped ? Math.exp(-(T - PB.pop) / 0.07) : 0;
  const onFlash = T >= PB.on ? Math.exp(-(T - PB.on) / 0.12) : 0;
  // your seat
  const seatK = pop(T, PB.seat, 0.3);
  const seatGlow = eo(T, PB.seat - 0.5, 0.5);
  // dust in the beam
  const motes = Array.from({ length: 46 }, (_, i) => {
    const u = rnd(i, 1), v = rnd(i, 2), z = rnd(i, 3);
    const y = -240 + ((v * 320 + T * (6 + z * 10)) % 320);
    const spread = (y + 260) / 330; // the beam widens toward the screen
    const x = CX + (u - 0.5) * 1320 * spread + 18 * Math.sin(T * (0.4 + z) + i);
    const tw = 0.4 + 0.6 * Math.sin(T * (1.3 + z * 2) + i * 2.1) ** 2;
    return <circle key={i} cx={x} cy={y} r={1 + z * 2.2} fill="#ffeec8" opacity={0.5 * tw * on} />;
  });
  const specks = Array.from({ length: 7 }, (_, i) => {
    const x = SX + rnd(fr * 7 + i, 8) * SW, y = SY + rnd(fr * 7 + i, 9) * SH;
    return rnd(fr * 7 + i, 10) > 0.7
      ? <line key={i} x1={x} y1={y} x2={x + (rnd(i + fr, 11) - 0.5) * 6} y2={y + 30 + rnd(i, fr) * 60} stroke="#2a2620" strokeWidth={1.2} opacity={0.35} />
      : <circle key={i} cx={x} cy={y} r={1 + rnd(fr, i) * 2.5} fill="#2a2620" opacity={0.4} />;
  });
  const screenFill = popped ? '#1b2338' : '#d9cfb8';
  return (
    <Svg>
      <defs>
        <clipPath id="p11-scr"><rect x={SX} y={SY} width={SW} height={SH} rx={4} /></clipPath>
        <radialGradient id="p11-vig" cx="50%" cy="50%" r="72%"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
        <linearGradient id="p11-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff1cf" stopOpacity="0.2" /><stop offset="1" stopColor="#fff1cf" stopOpacity="0.04" /></linearGradient>
        <radialGradient id="p11-seat"><stop offset="0" stopColor="#f6cf74" stopOpacity="0.5" /><stop offset="1" stopColor="#f6cf74" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={`translate(${CX} ${CY}) scale(${s}) translate(${-CX} ${-CY})`}>
        {/* spill of the screen on the walls */}
        <rect x={SX - 60} y={SY - 40} width={SW + 120} height={SH + 80} rx={20} fill={popped ? '#5d7bb0' : '#e8dcc0'} opacity={(popped ? 0.18 : 0.22) * flick} filter="url(#k-soft)" />
        {/* the beam (overhead, from the booth behind you) */}
        <g opacity={(popped ? 0.35 : 1) * flick}>
          <path d={`M${CX - 40},-300 L${CX + 40},-300 L${SX + SW},${SY} L${SX},${SY} Z`} fill="url(#p11-beam)" />
          {[-0.28, 0.06, 0.34].map((k, i) => (
            <path key={i} d={`M${CX + k * 60},-300 L${CX + k * 60 + 8},-300 L${CX + k * SW + 30},${SY} L${CX + k * SW - 30},${SY} Z`} fill="#fff6dd" opacity={0.05 + 0.03 * Math.sin(T * 2 + i)} />
          ))}
          {motes}
        </g>
        {/* the screen */}
        <rect x={SX} y={SY} width={SW} height={SH} rx={4} fill={on ? screenFill : '#0d1220'} />
        {on > 0 && !popped && (
          <g clipPath="url(#p11-scr)" opacity={flick}>
            <path d={wedge(900, sweep)} fill="#2a2620" opacity={0.16} />
            <line x1={SX} y1={CY} x2={SX + SW} y2={CY} stroke="#2a2620" strokeWidth={3} opacity={0.55} />
            <line x1={CX} y1={SY} x2={CX} y2={SY + SH} stroke="#2a2620" strokeWidth={3} opacity={0.55} />
            <circle cx={CX} cy={CY} r={172} fill="none" stroke="#2a2620" strokeWidth={5} opacity={0.8} />
            <circle cx={CX} cy={CY} r={150} fill="#d9cfb8" opacity={0.55} />
            <circle cx={CX} cy={CY} r={150} fill="none" stroke="#2a2620" strokeWidth={2.4} opacity={0.8} />
            {cur >= 0 && (
              <text x={CX} y={CY + 84} textAnchor="middle" transform={`translate(${CX} ${CY}) scale(${lerp(1.3, 1, clamp(numK))}) translate(${-CX} ${-CY})`}
                style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 250, ...LNUM }} fill="#1e1a16">{NUMS[cur][1]}</text>
            )}
            {specks}
            <rect x={SX} y={SY} width={SW} height={SH} fill="url(#p11-vig)" />
          </g>
        )}
        {popFlash > 0.01 && <rect x={SX} y={SY} width={SW} height={SH} rx={4} fill="#fffaf0" opacity={popFlash} />}
        {/* the house: three rows of seats, a few heads; your seat lights on its accent */}
        {ROWS.map((r, ri) => {
          const n = Math.ceil((1920 + 200 - r.x0) / (r.w + r.gap));
          return (
            <g key={ri}>
              {ri === MY_ROW && seatGlow > 0 && (
                <ellipse cx={r.x0 + MY_SEAT * (r.w + r.gap) + r.w / 2} cy={r.y + 30} rx={180} ry={120} fill="url(#p11-seat)" opacity={seatGlow} />
              )}
              {Array.from({ length: n }, (_, i) => {
                const x = r.x0 + i * (r.w + r.gap);
                return <Seat key={i} x={x} r={r} lit={ri === MY_ROW && i === MY_SEAT ? seatGlow : 0} />;
              })}
              {HEADS.filter(([hr]) => hr === ri).map(([, hi]) => <Head key={hi} x={r.x0 + hi * (r.w + r.gap)} r={r} T={T} i={hi} />)}
            </g>
          );
        })}
        {seatK > 0 && (() => {
          const r = ROWS[MY_ROW], x = r.x0 + MY_SEAT * (r.w + r.gap) + r.w / 2, y = r.y - 52;
          return (
            <g transform={`translate(${x} ${y}) scale(${seatK})`}>
              <path d="M0,34 L-10,22 H10 Z" fill={C.paperLit} />
              <rect x={-100} y={-24} width={200} height={48} rx={6} fill={C.paperLit} />
              <text y={11} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 28, letterSpacing: 2, ...LNUM }} fill={C.ink}>7排 · 12座</text>
            </g>
          );
        })()}
      </g>
      {/* the projector comes on */}
      {onFlash > 0.01 && <rect width={1920} height={1080} fill="#fff4dc" opacity={0.25 * onFlash} />}
      {/* before the first hit: the house is dark */}
      {T < PB.on && <rect width={1920} height={1080} fill="#000" opacity={1 - 0.6 * pr(T, 0, PB.on)} />}
    </Svg>
  );
};

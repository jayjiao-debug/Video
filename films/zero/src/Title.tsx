import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, rnd, EN, ZH, beats } from './lib';

/* Title card (b30–b44; stamped on the drop b32 = 16.6 s). The nine sugar cubes of the cold open line up as small
   isometric icons, then burst into gold dust as the title is stamped, one character per half beat: the sugar goes,
   the sweetness stays. */
export const T_IN = b(30), T_OUT = b(44);
const half = (beats[33] - beats[32]) / 2;

export const GoldTitle: React.FC<{ text: string; T: number; at: number; size: number; y: number; x?: number; id?: string }> = ({ text, T, at, size, y, x = 960, id = 'gt' }) => {
  const chars = [...`《${text}》`];
  const width = chars.length * size * 0.98;
  const sweep = lerp(-760, 760, easeInOut(prog(T, at + chars.length * half + 0.4, at + chars.length * half + 1.4)));
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1={y - size * 0.8} x2="0" y2={y + size * 0.2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#f3cd7a" /><stop offset="0.7" stopColor="#c99140" /><stop offset="1" stopColor="#8a5a22" />
        </linearGradient>
        <linearGradient id={`${id}-sweep`} x1={x + sweep - 120} y1="0" x2={x + sweep + 120} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.8" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {([`${id}-metal`, `${id}-sweep`] as const).map((fill) => (
        <text key={fill} y={y} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: size, letterSpacing: '0.04em' }}>
          {chars.map((ch, i) => {
            const at_i = at + i * half;
            const p = easeOut(prog(T, at_i, at_i + 0.22));
            return <tspan key={i} x={x - width / 2 + (i + 0.5) * (width / chars.length)} fill={`url(#${fill})`} opacity={p}>{ch}</tspan>;
          })}
        </text>
      ))}
    </g>
  );
};

/** a small isometric sugar cube icon */
export const CubeIcon: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <path d={`M0,${-s} L${s * 0.87},${-s / 2} L0,0 L${-s * 0.87},${-s / 2} Z`} fill="#fbf7ef" />
    <path d={`M${-s * 0.87},${-s / 2} L0,0 L0,${s} L${-s * 0.87},${s / 2} Z`} fill="#d9d2c4" />
    <path d={`M${s * 0.87},${-s / 2} L0,0 L0,${s} L${s * 0.87},${s / 2} Z`} fill="#bdb5a6" />
  </g>
);

export const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T < T_IN || T > T_OUT) return null;
  const inO = easeOut(prog(T, T_IN, T_IN + 0.5));
  const out = easeInOut(prog(T, b(42), T_OUT));
  const burst = prog(T, b(32), b(32) + 1.6);
  const o = (a: number, d = 0.5) => easeOut(prog(T, a, a + d));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060b', opacity: inO * (1 - out) }}>
      <svg width={1920} height={1080}>
        <radialGradient id="title-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6cf78" stopOpacity="0.16" /><stop offset="0.6" stopColor="#f6cf78" stopOpacity="0.04" /><stop offset="1" stopColor="#f6cf78" stopOpacity="0" />
        </radialGradient>
        <ellipse cx={960} cy={560} rx={900} ry={520} fill="url(#title-glow)" opacity={o(b(32), 0.6)} />
        {/* nine cubes in a row, then dust */}
        {Array.from({ length: 9 }, (_, k) => {
          const x = 960 + (k - 4) * 64, y = 690;
          const appear = o(T_IN + 0.08 * k, 0.3);
          return <CubeIcon key={k} x={x} y={y - 12 * (1 - appear)} s={20} o={appear * (1 - easeOut(Math.min(1, burst * 4)))} />;
        })}
        {burst > 0 && burst < 1 && Array.from({ length: 140 }, (_, i) => {
          const k = i % 9, x0 = 960 + (k - 4) * 64, y0 = 680;
          const a = rnd(i, 1) * Math.PI * 2, sp = 60 + rnd(i, 2) * 220;
          const x = x0 + Math.cos(a) * sp * easeOut(burst), y = y0 + Math.sin(a) * sp * 0.6 * easeOut(burst) - 140 * burst * rnd(i, 3);
          return <circle key={i} cx={x} cy={y} r={1 + rnd(i, 4) * 2.4} fill={rnd(i, 5) < 0.7 ? '#f6cf78' : '#fff3cf'} opacity={(1 - burst) * 0.9} />;
        })}
        <text x={960} y={330} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(b(32) + 0.2)}>ZERO SUGAR · 甜 味 剂</text>
        <GoldTitle text="零糖" T={T} at={b(32)} size={150} y={530} />
        <text x={960} y={800} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 46, fill: '#f3ede2', letterSpacing: '0.06em' }} opacity={o(b(35))}>不加糖，为什么也会甜？</text>
        <text x={960} y={846} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 26, fill: 'rgba(243,237,226,0.5)' }} opacity={o(b(35) + 0.3)}>No sugar. So why is it sweet?</text>
      </svg>
    </AbsoluteFill>
  );
};

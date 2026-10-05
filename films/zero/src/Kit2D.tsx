import React from 'react';
import { AbsoluteFill } from 'remotion';
import { mulberry, EN, ZH, SANS } from './lib';

/* 2D illustrated kit for 《零糖》 v5 (no 3D): a night counter lit by a pendant lamp, unbranded cans with cylindrical
   shading, isometric sugar cubes, a tumbler of still water. Everything is drawn in SVG, statically lit (no moving
   reflections), so text on the cans never shimmers; shots change by cuts on the beat, not by zooming. */

export type CanKind = 'red' | 'black';

/** an unbranded 330 ml can standing on (cx, base); h = height in px (w = 0.574 h, the real 66:115 ratio) */
export const Can2D: React.FC<{ kind: CanKind; cx: number; base: number; h: number; id: string; o?: number; reflect?: boolean }> = ({ kind, cx, base, h, id, o = 1, reflect = true }) => {
  const w = h * 0.574, red = kind === 'red';
  const L = red ? ['#5e0a0f', '#a3141b', '#e2453f', '#c81f25', '#8c1016', '#4a070b'] : ['#050506', '#151518', '#3a3a40', '#1c1c20', '#0e0e10', '#030304'];
  const top = -h, bodyTop = -h * 0.9, bodyBot = -h * 0.1, rx = w * 0.43, ry = rx * 0.2;
  const r = mulberry(red ? 11 : 12);
  const drops = Array.from({ length: 26 }, () => ({ x: (r() - 0.5) * w * 0.8, y: bodyTop + r() * (bodyBot - bodyTop), s: 1.5 + r() * 3.2 }));
  const can = (
    <>
      {/* bottom taper */}
      <path d={`M${-w / 2},${bodyBot} L${-w / 2 + w * 0.04},${-h * 0.03} Q${-w * 0.3},0 0,0 Q${w * 0.3},0 ${w / 2 - w * 0.04},${-h * 0.03} L${w / 2},${bodyBot} Z`} fill={`url(#${id}-metal)`} />
      {/* the body with its label */}
      <rect x={-w / 2} y={bodyTop} width={w} height={bodyBot - bodyTop} fill={`url(#${id}-label)`} />
      <rect x={-w / 2} y={bodyTop + (bodyBot - bodyTop) * 0.06} width={w} height={h * 0.006} fill="#c9a35c" opacity={0.85} />
      <rect x={-w / 2} y={bodyBot - (bodyBot - bodyTop) * 0.08} width={w} height={h * 0.006} fill="#c9a35c" opacity={0.85} />
      <rect x={-w / 2} y={-h * 0.31} width={w} height={h * 0.028} fill={red ? '#f3e2c4' : '#d42a2a'} opacity={0.92} />
      <text x={0} y={-h * 0.53} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: w * 0.25, letterSpacing: '0.04em', fill: red ? '#fff6ea' : '#f1ece2' }}>COLA</text>
      <text x={0} y={-h * 0.375} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: w * 0.15, fill: red ? '#fff6ea' : '#ea4a40' }}>{red ? '经典' : '无糖'}</text>
      <text x={0} y={-h * 0.2} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 500, fontSize: w * 0.06, fill: 'rgba(255,245,235,0.78)' }}>{red ? '可乐 · 330 毫升' : '可乐 · 330 毫升 · 糖 0 克'}</text>
      {/* the curvature: dark edges and a soft highlight band (fixed light, never moves) */}
      <rect x={-w / 2} y={bodyTop} width={w} height={bodyBot - bodyTop} fill={`url(#${id}-shade)`} />
      {drops.map((d, i) => <g key={i}><ellipse cx={d.x} cy={d.y} rx={d.s * 0.8} ry={d.s} fill="rgba(255,255,255,0.12)" /><circle cx={d.x - d.s * 0.25} cy={d.y - d.s * 0.35} r={d.s * 0.3} fill="rgba(255,255,255,0.55)" /></g>)}
      {/* shoulder, neck, rim, lid */}
      <path d={`M${-w / 2},${bodyTop} L${-w / 2},${bodyTop - h * 0.015} Q${-w / 2},${top + h * 0.05} ${-rx},${top + ry} L${rx},${top + ry} Q${w / 2},${top + h * 0.05} ${w / 2},${bodyTop - h * 0.015} L${w / 2},${bodyTop} Z`} fill={`url(#${id}-metal)`} />
      <ellipse cx={0} cy={top + ry} rx={rx} ry={ry} fill={`url(#${id}-rim)`} />
      <ellipse cx={0} cy={top + ry * 1.05} rx={rx * 0.86} ry={ry * 0.78} fill="#7c7f86" />
      <ellipse cx={-rx * 0.28} cy={top + ry * 1.05} rx={rx * 0.3} ry={ry * 0.42} fill="none" stroke="#5c5f66" strokeWidth={Math.max(1, w * 0.008)} />
      <rect x={rx * 0.02} y={top + ry * 0.82} width={rx * 0.52} height={ry * 0.42} rx={ry * 0.2} fill="#c6c8ce" />
      <circle cx={rx * 0.06} cy={top + ry * 1.03} r={ry * 0.14} fill="#9a9da4" />
    </>
  );
  return (
    <g transform={`translate(${cx},${base})`} opacity={o}>
      <defs>
        <linearGradient id={`${id}-label`} x1="0" x2="1" y1="0" y2="0">
          {L.map((c, i) => <stop key={i} offset={[0, 0.1, 0.32, 0.5, 0.82, 1][i]} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" /><stop offset="0.12" stopColor="#000" stopOpacity="0.12" />
          <stop offset="0.27" stopColor="#fff" stopOpacity="0.16" /><stop offset="0.31" stopColor="#fff" stopOpacity="0.32" /><stop offset="0.36" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.05" /><stop offset="0.9" stopColor="#000" stopOpacity="0.35" /><stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3c3e44" /><stop offset="0.25" stopColor="#d9dbe0" /><stop offset="0.33" stopColor="#ffffff" /><stop offset="0.45" stopColor="#a9acb3" /><stop offset="0.85" stopColor="#5d6067" /><stop offset="1" stopColor="#2a2c30" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#f2f3f5" /><stop offset="1" stopColor="#8d9097" /></linearGradient>
        <linearGradient id={`${id}-refl`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.16" /><stop offset="0.45" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <mask id={`${id}-rm`}><rect x={-w} y={0} width={w * 2} height={h} fill={`url(#${id}-refl)`} /></mask>
      </defs>
      <ellipse cx={w * 0.08} cy={4} rx={w * 0.75} ry={h * 0.035} fill="#000" opacity={0.55} />
      {reflect && <g mask={`url(#${id}-rm)`}><g transform="scale(1,-1)">{can}</g></g>}
      {can}
    </g>
  );
};

/** a sugar cube in oblique view; (x, y) = bottom centre of its front face, s = edge in px. Stacks cleanly when drawn
    bottom row first, left to right. */
export const Cube2D: React.FC<{ x: number; y: number; s: number; o?: number; rot?: number }> = ({ x, y, s, o = 1, rot = 0 }) => {
  const h = s / 2, d = s * 0.3;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot} 0 ${-h})`} opacity={o}>
      <path d={`M${-h},${-s} L${h},${-s} L${h + d},${-s - d} L${-h + d},${-s - d} Z`} fill="#fffdf8" />
      <path d={`M${h},${-s} L${h + d},${-s - d} L${h + d},${-d} L${h},0 Z`} fill="#cfc7b8" />
      <rect x={-h} y={-s} width={s} height={s} fill="#efe9dd" />
      <rect x={-h} y={-s} width={s} height={s} fill="none" stroke="rgba(160,150,135,0.5)" strokeWidth={1} />
      <path d={`M${-h},${-s} L${h},${-s} L${h + d},${-s - d}`} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.2} />
    </g>
  );
};

/** a heavy tumbler of still water standing on (cx, base) */
export const Glass2D: React.FC<{ cx: number; base: number; h: number; id: string; level?: number }> = ({ cx, base, h, id, level = 0.78 }) => {
  const wb = h * 0.56, wt = h * 0.66, foot = h * 0.1, wall = h * 0.022;
  const wAt = (y: number) => wb + (wt - wb) * (y / h); // width at height y above the base
  const wy = foot + (h - foot - h * 0.06) * level;
  const r = mulberry(5);
  const bubbles = Array.from({ length: 22 }, () => { const y = foot + 8 + r() * (wy - foot - 16); const side = r() < 0.5 ? -1 : 1; return { x: side * (wAt(y) / 2 - wall - 3 - r() * 4), y, s: 1.2 + r() * 2.6 }; });
  return (
    <g transform={`translate(${cx},${base})`}>
      <defs>
        <linearGradient id={`${id}-w`} x1="0" x2="1"><stop offset="0" stopColor="#9fc4e6" stopOpacity="0.38" /><stop offset="0.3" stopColor="#d8ecff" stopOpacity="0.16" /><stop offset="0.7" stopColor="#bcd8f2" stopOpacity="0.14" /><stop offset="1" stopColor="#7fa6cc" stopOpacity="0.36" /></linearGradient>
        <linearGradient id={`${id}-g`} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.32" /><stop offset="0.12" stopColor="#fff" stopOpacity="0.06" /><stop offset="0.85" stopColor="#fff" stopOpacity="0.04" /><stop offset="1" stopColor="#fff" stopOpacity="0.28" /></linearGradient>
      </defs>
      <ellipse cx={0} cy={3} rx={wb * 0.62} ry={h * 0.03} fill="#000" opacity={0.45} />
      {/* water */}
      <path d={`M${-wAt(foot) / 2 + wall},${-foot} L${-wAt(wy) / 2 + wall},${-wy} L${wAt(wy) / 2 - wall},${-wy} L${wAt(foot) / 2 - wall},${-foot} Z`} fill={`url(#${id}-w)`} />
      <ellipse cx={0} cy={-wy} rx={wAt(wy) / 2 - wall} ry={h * 0.025} fill="rgba(220,238,255,0.28)" stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
      {bubbles.map((p, i) => <circle key={i} cx={p.x} cy={-p.y} r={p.s} fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.65)" strokeWidth={0.8} />)}
      {/* glass: thick foot, walls, rim */}
      <path d={`M${-wb / 2},0 L${-wt / 2},${-h} L${wt / 2},${-h} L${wb / 2},0 Z`} fill={`url(#${id}-g)`} stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
      <path d={`M${-wb / 2 + 2},${-2} L${wb / 2 - 2},${-2} L${wAt(foot) / 2 - wall},${-foot} L${-wAt(foot) / 2 + wall},${-foot} Z`} fill="rgba(255,255,255,0.12)" />
      <ellipse cx={0} cy={-h} rx={wt / 2} ry={h * 0.03} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
      <rect x={-wt / 2 + wt * 0.1} y={-h * 0.92} width={wt * 0.05} height={h * 0.75} rx={wt * 0.025} fill="rgba(255,255,255,0.22)" />
    </g>
  );
};

/** the night counter: window bokeh above, a stone counter below (from y = top), a warm pool from the pendant lamp */
export const Counter2D: React.FC<{ top?: number; pool?: [number, number]; seed?: number }> = ({ top = 760, pool = [960, 760], seed = 1 }) => {
  const r = mulberry(seed * 31);
  const dots = Array.from({ length: 40 }, () => ({ x: r() * 1920, y: 60 + r() * (top - 120), s: 40 + r() * 130, c: r() < 0.6 ? '255,190,120' : r() < 0.82 ? '120,160,255' : '255,110,90', a: 0.08 + r() * 0.16 }));
  const specks = Array.from({ length: 260 }, () => ({ x: r() * 1920, y: top + r() * (1080 - top), s: 0.6 + r() * 1.6, a: 0.05 + r() * 0.12 }));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="c2-sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#070a14" /><stop offset="1" stopColor="#0d1120" /></linearGradient>
          <linearGradient id="c2-stone" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2a2a30" /><stop offset="1" stopColor="#121216" /></linearGradient>
          <radialGradient id="c2-pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffcf8a" stopOpacity="0.26" /><stop offset="1" stopColor="#ffcf8a" stopOpacity="0" /></radialGradient>
          {dots.map((d, i) => <radialGradient key={i} id={`c2-b${i}`}><stop offset="0" stopColor={`rgb(${d.c})`} stopOpacity={d.a} /><stop offset="0.65" stopColor={`rgb(${d.c})`} stopOpacity={d.a * 0.7} /><stop offset="1" stopColor={`rgb(${d.c})`} stopOpacity="0" /></radialGradient>)}
        </defs>
        <rect width={1920} height={top} fill="url(#c2-sky)" />
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={`url(#c2-b${i})`} />)}
        <rect y={top} width={1920} height={1080 - top} fill="url(#c2-stone)" />
        {specks.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.s} fill="#e8e0d4" opacity={p.a} />)}
        <rect y={top - 2} width={1920} height={3} fill="rgba(255,255,255,0.08)" />
        <ellipse cx={pool[0]} cy={pool[1]} rx={760} ry={260} fill="url(#c2-pool)" />
      </svg>
    </AbsoluteFill>
  );
};

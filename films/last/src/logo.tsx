import React from 'react';
import { SANS, MONO, INK, DIM, RED, prog, easeOut, pop } from './lib';

/* The title lockup in the film's own language (black, hard white, signal red; Noto Sans Black + mono): "最后一面"
   where the "一" is the line between the two dots of the film, you (white) and TA (red). Used on the drop and on the
   end card. at = when it starts; size = glyph size; cy = baseline. */
export const TitleLockup: React.FC<{ T: number; at: number; size?: number; cy?: number; still?: boolean }> = ({ T, at, size = 200, cy = 620, still = false }) => {
  const k = (d: number, dur = 0.16) => (still ? 1 : easeOut(prog(T, at + d, at + d + dur)));
  const slam = (d: number) => (still ? 1 : pop(T, at + d, 0.22));
  const gap = size * 0.12, bar = size * 1.05;
  const w2 = size * 2, w1 = size;
  const total = w2 + gap + bar + gap + w1;
  const x0 = 960 - total / 2;
  const mid = cy - size * 0.36;
  const barK = still ? 1 : easeOut(prog(T, at + 0.16, at + 0.42));
  const s1 = slam(0), s3 = slam(0.3);
  const glyph = (txt: string, x: number, s: number, o: number) => (
    <text x={x} y={cy} opacity={o} transform={`translate(${x + (txt.length * size) / 2} ${mid}) scale(${1.25 - 0.25 * Math.min(1, s)}) translate(${-(x + (txt.length * size) / 2)} ${-mid})`}
      style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, fill: INK, letterSpacing: 0 }}>{txt}</text>
  );
  const bx0 = x0 + w2 + gap, bx1 = bx0 + bar;
  return (
    <g>
      <text x={960} y={cy - size - 40} textAnchor="middle" opacity={k(0.2, 0.3)} style={{ fontFamily: MONO, fontSize: size * 0.14, letterSpacing: '0.62em', fill: DIM }}>LAST MEETING</text>
      {glyph('最后', x0, s1, k(0, 0.08))}
      <line x1={bx0} y1={mid} x2={bx0 + bar * barK} y2={mid} stroke={RED} strokeWidth={size * 0.13} strokeLinecap="butt" style={{ filter: 'drop-shadow(0 0 12px rgba(255,61,46,0.55))' }} />
      <circle cx={bx0} cy={mid} r={size * 0.1} fill={INK} opacity={k(0.16, 0.1)} style={{ filter: 'drop-shadow(0 0 10px rgba(242,240,234,0.7))' }} />
      <circle cx={bx0 + bar * barK} cy={mid} r={size * 0.1} fill={RED} opacity={k(0.2, 0.1)} style={{ filter: 'drop-shadow(0 0 12px rgba(255,61,46,0.9))' }} />
      {glyph('面', bx1 + gap, s3, k(0.3, 0.08))}
      <text x={960} y={cy + size * 0.42} textAnchor="middle" opacity={k(0.6, 0.35)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: size * 0.13, letterSpacing: '0.5em', fill: 'rgba(242,240,234,0.62)' }}>VIBE知识大赏</text>
    </g>
  );
};

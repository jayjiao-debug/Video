import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, EN, ZH, GOLD, beats } from './lib';
import { tubeX, TUBE, COUNT } from './S01';

/* Title card (b30–b44; stamped on the drop b32 = 16.6 s). The squares in each tube fuse into a solid gold bar of the same height (the real counts),
   then the nine bars gather under the title as the episode's motif. The title is stamped one character per
   half-beat from b32 (16.61 s, the drop), then a light sweep crosses it. */
export const T_IN = b(30), T_OUT = b(44);
const half = (beats[33] - beats[32]) / 2;

export const GoldTitle: React.FC<{ text: string; T: number; at: number; size: number; y: number }> = ({ text, T, at, size, y }) => {
  const chars = [...`《${text}》`];
  const width = chars.length * size * 0.98;
  const sweep = lerp(-760, 760, easeInOut(prog(T, at + chars.length * half + 0.4, at + chars.length * half + 1.4)));
  return (
    <g>
      <defs>
        <linearGradient id="gold-metal" x1="0" y1={y - size * 0.8} x2="0" y2={y + size * 0.2} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#f3cd7a" /><stop offset="0.7" stopColor="#c99140" /><stop offset="1" stopColor="#8a5a22" />
        </linearGradient>
        <linearGradient id="gold-sweep" x1={960 + sweep - 120} y1="0" x2={960 + sweep + 120} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.8" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {(['gold-metal', 'gold-sweep'] as const).map((fill) => (
        <text key={fill} y={y} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: size, letterSpacing: '0.04em' }}>
          {chars.map((ch, i) => {
            const at_i = at + i * half;
            const p = easeOut(prog(T, at_i, at_i + 0.22));
            return <tspan key={i} x={960 - width / 2 + (i + 0.5) * (width / chars.length)} fill={`url(#${fill})`} opacity={p}>{ch}</tspan>;
          })}
        </text>
      ))}
    </g>
  );
};

export const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T < T_IN || T > T_OUT) return null;
  const fuse = easeOut(prog(T, b(30), b(31) + 0.2));          // squares become solid bars
  const gather = easeInOut(prog(T, b(31), b(32) + 0.3));       // bars move under the title before it is stamped
  const out = easeInOut(prog(T, b(42), T_OUT));
  const step = TUBE.sq + TUBE.pad;
  const o = (a: number, d = 0.5) => easeOut(prog(T, a, a + d));
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 + 0.05 * easeInOut(prog(T, b(32), T_OUT))})` }}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="bar-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe6a8" /><stop offset="1" stopColor="#c8913a" />
          </linearGradient>
        </defs>
        <radialGradient id="title-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6cf78" stopOpacity="0.16" /><stop offset="0.6" stopColor="#f6cf78" stopOpacity="0.04" /><stop offset="1" stopColor="#f6cf78" stopOpacity="0" />
        </radialGradient>
        <ellipse cx={960} cy={600} rx={900} ry={520} fill="url(#title-glow)" opacity={gather} />
        {/* the nine bars: from the tubes (real heights) to the motif */}
        {Array.from({ length: 9 }, (_, k) => {
          const d = k + 1, n = COUNT(d);
          const h0 = Math.ceil(n / 3) * step, w0 = step * 3 - TUBE.pad;
          const x0 = tubeX(d) - w0 / 2, y0 = TUBE.bot - 6 - h0 + TUBE.pad / 2;
          const w1 = 34, h1 = (n / 65) * 150;
          const x1 = 960 + (k - 4) * 46 - w1 / 2, y1 = 760 - h1;
          const x = lerp(x0, x1, gather), y = lerp(y0, y1, gather), w = lerp(w0, w1, gather), h = lerp(h0, h1, gather);
          return <rect key={d} x={x} y={y} width={w} height={h} rx={lerp(3, 2, gather)} fill="url(#bar-gold)" opacity={fuse * (d === 1 ? 1 : 0.88)} />;
        })}
        <text x={960} y={318} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 26, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(b(32) + 0.2)}>
          BENFORD'S LAW · 本福特定律
        </text>
        <GoldTitle text="第一位数字" T={T} at={b(32)} size={128} y={500} />
        <text x={960} y={872} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 46, fill: '#f3ede2', letterSpacing: '0.08em' }} opacity={o(b(36))}>
          为什么1开头的数最多？
        </text>
        <text x={960} y={918} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 28, fill: 'rgba(243,237,226,0.5)' }} opacity={o(b(37))}>
          Why do so many numbers start with 1?
        </text>
        {/* digits under their own bars (not a letter-spaced row, which drifted off the bars) */}
        {Array.from({ length: 9 }, (_, k) => (
          <text key={k} x={960 + (k - 4) * 46} y={796} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 24, fill: k === 0 ? '#f6cf78' : 'rgba(241,197,109,0.7)', fontVariantNumeric: 'lining-nums' }} opacity={o(b(34))}>{k + 1}</text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

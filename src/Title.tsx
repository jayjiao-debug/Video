import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, pop, EN, ZH, beats } from './lib';

/* Title card (b30–b40; stamped on the full-strength hit b32 = 16.61 s, out on the hit b40 = 20.68 s).
   The cold open ends looking straight down on the note; the card draws that note in gold line, a square-holed
   coin drops onto it on b32, and the title is stamped one character per half beat. */
export const T_IN = b(30), T_OUT = b(40);
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

/** the episode motif: a banknote in gold line with a square-holed coin on it */
export const Motif: React.FC<{ x: number; y: number; w: number; draw?: number; coin?: number; o?: number }> = ({ x, y, w, draw = 1, coin = 1, o = 1 }) => {
  const h = w * 0.425, per = 2 * (w + h);
  const r = h * 0.42, cx = x + w * 0.32, cy = y + h * 0.08 - (1 - coin) * 60;
  return (
    <g opacity={o} fill="none" stroke="#f1c56d" strokeLinecap="round">
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h * 0.06} strokeWidth={3} strokeDasharray={per} strokeDashoffset={per * (1 - draw)} />
      <rect x={x - w / 2 + h * 0.1} y={y - h / 2 + h * 0.1} width={w - h * 0.2} height={h * 0.8} rx={h * 0.04} strokeWidth={1.2} opacity={0.55 * draw} />
      <ellipse cx={x - w * 0.12} cy={y} rx={h * 0.27} ry={h * 0.33} strokeWidth={1.6} opacity={0.75 * draw} />
      {coin > 0 && (
        <g opacity={Math.min(1, coin * 1.5)}>
          <circle cx={cx} cy={cy} r={r} fill="#05060b" strokeWidth={3.5} />
          <circle cx={cx} cy={cy} r={r * 0.86} strokeWidth={1.2} opacity={0.6} />
          <rect x={cx - r * 0.28} y={cy - r * 0.28} width={r * 0.56} height={r * 0.56} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

export const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T < T_IN || T > T_OUT) return null;
  const inO = easeOut(prog(T, T_IN, T_IN + 0.5));
  const out = easeInOut(prog(T, b(39), T_OUT));
  const o = (a: number, d = 0.5) => easeOut(prog(T, a, a + d));
  // the note is drawn at the size the cold open last showed it, then settles below the title
  const settle = easeInOut(prog(T, b(32), b(33)));
  const mw = lerp(860, 300, settle), my = lerp(540, 712, settle);
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060b', opacity: inO * (1 - out), transform: `scale(${1 + 0.04 * easeInOut(prog(T, b(32), T_OUT))})` }}>
      <svg width={1920} height={1080}>
        <radialGradient id="title-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f6cf78" stopOpacity="0.16" /><stop offset="0.6" stopColor="#f6cf78" stopOpacity="0.04" /><stop offset="1" stopColor="#f6cf78" stopOpacity="0" />
        </radialGradient>
        <ellipse cx={960} cy={560} rx={900} ry={520} fill="url(#title-glow)" opacity={o(b(32), 0.6)} />
        <Motif x={960} y={my} w={mw} draw={easeInOut(prog(T, T_IN + 0.1, b(32) - 0.05))} coin={pop(T, b(32), 0.3)} />
        <text x={960} y={300} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(b(32) + 0.2)}>MONEY · FROM SHELLS TO CODE</text>
        <GoldTitle text="钱凭什么" T={T} at={b(32)} size={150} y={500} />
        <text x={960} y={850} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 46, fill: '#f3ede2', letterSpacing: '0.06em' }} opacity={o(b(35))}>一张纸，凭什么能换一顿饭？</text>
        <text x={960} y={896} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 26, fill: 'rgba(243,237,226,0.5)' }} opacity={o(b(35) + 0.3)}>A slip of paper buys a meal. Why?</text>
      </svg>
    </AbsoluteFill>
  );
};

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, EN, ZH, beats } from './lib';
import { output, Shop, TOP, allShells } from './S1';
import { useModels } from './useModels';
import { type Key } from './lib';

/* Title card (b30–b40; stamped on the full-strength hit b32 = 16.61 s, out on the hit b40 = 20.68 s).
   The cold open began with a straight gold line; here the same line is drawn again from the shop's data and bends:
   straight to 49 hours, flattening, a peak near 63, down by 70. That curve is the episode's motif. */
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

/** the motif: effort along x (weekly hours 0–70), reward up y, the line bends after 49 */
export const Curve: React.FC<{ x: number; y: number; w: number; h: number; draw: number; labels?: number; id?: string; axes?: boolean }> = ({ x, y, w, h, draw, labels = 0, id = 'cv', axes = true }) => {
  const X = (hr: number) => x + (hr / 70) * w, Y = (v: number) => y + h - (v / 56) * h;
  const pts = Array.from({ length: 71 }, (_, i) => `${X(i).toFixed(1)},${Y(output(i)).toFixed(1)}`);
  const d = `M${pts.join(' L')}`;
  const L = w * 1.5;
  return (
    <g>
      <line x1={x} y1={y + h} x2={x + w * 1.03} y2={y + h} stroke="rgba(243,237,226,0.35)" strokeWidth={1.5} />
      <line x1={x} y1={y + h} x2={X(56) + 40} y2={Y(56) - 40} stroke="rgba(243,237,226,0.18)" strokeWidth={2} strokeDasharray="6 9" opacity={draw} />
      <defs><linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f1c56d" stopOpacity="0.28" /><stop offset="1" stopColor="#f1c56d" stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${X(70)},${y + h} L${x},${y + h} Z`} fill={`url(#${id}-fill)`} opacity={draw * draw} />
      {axes && <text x={x + w * 1.03} y={y + h + 70} textAnchor="end" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.5)' }} opacity={draw}>每周工时</text>}
      {axes && <text x={x - 14} y={y + 10} textAnchor="end" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.5)' }} opacity={draw}>产出</text>}
      <path d={d} fill="none" stroke="#f1c56d" strokeWidth={5} strokeLinecap="round" strokeDasharray={`${L * draw} ${L}`} style={{ filter: 'drop-shadow(0 0 12px rgba(246,207,120,0.55))' }} id={id} />
      {labels > 0 && [[49, '49'], [63, '63'], [70, '70']].map(([hr, t]) => (
        <g key={t as string} opacity={labels}>
          <circle cx={X(hr as number)} cy={Y(output(hr as number))} r={6} fill="#f1c56d" />
          <text x={X(hr as number)} y={y + h + 34} textAnchor="middle" style={{ fontFamily: EN, fontSize: 24, fill: 'rgba(243,237,226,0.6)' }}>{t}h</text>
        </g>
      ))}
    </g>
  );
};

const KEYS_T: Key[] = [[b(30), [0.0, TOP + 1.3, 1.3], [0.0, TOP + 0.05, 0]], [b(40), [0.0, TOP + 1.45, 1.1], [0.0, TOP, 0]]];

export const Title: React.FC<{ T: number }> = ({ T }) => {
  const m = useModels(['table', 'lamp', 'wallclock', 'shell']);
  if (T < T_IN || T > T_OUT || !m) return null;
  const inO = easeOut(prog(T, T_IN, T_IN + 0.5));
  const out = easeInOut(prog(T, b(39), T_OUT));
  const o = (a: number, d = 0.5) => easeOut(prog(T, a, a + d));
  const draw = easeInOut(prog(T, T_IN + 0.2, b(32) + 0.2));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060b', opacity: inO * (1 - out), transform: `scale(${1 + 0.035 * easeInOut(prog(T, b(32), T_OUT))})` }}>
      {/* the shop of the cold open, far out of focus behind the card */}
      <AbsoluteFill style={{ opacity: 0.55 * o(T_IN + 0.3, 0.8) }}><Shop T={T} keys={KEYS_T} m={m} shells={allShells} dim={0.6} aperture={0.08} /></AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(5,6,11,0.55), rgba(5,6,11,0.9))' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <radialGradient id="title-glow" cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#f6cf78" stopOpacity="0.13" /><stop offset="0.6" stopColor="#f6cf78" stopOpacity="0.03" /><stop offset="1" stopColor="#f6cf78" stopOpacity="0" />
        </radialGradient>
        <ellipse cx={960} cy={600} rx={900} ry={520} fill="url(#title-glow)" opacity={o(b(32), 0.6)} />
        <g stroke="rgba(243,237,226,0.05)">{Array.from({ length: 25 }, (_, i) => <line key={i} x1={i * 80} y1={0} x2={i * 80} y2={1080} />)}</g>
        <text x={960} y={170} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 26, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(b(32) + 0.2)}>EFFORT &amp; REWARD · PENCAVEL · MCMXV</text>
        <GoldTitle text="付出和回报" T={T} at={b(32)} size={140} y={340} />
        <Curve x={600} y={450} w={720} h={340} draw={draw} labels={o(b(34))} />
        <text x={960} y={925} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 48, fill: '#f3ede2', letterSpacing: '0.06em' }} opacity={o(b(35))}>付出翻倍，回报会翻倍吗？</text>
        <text x={960} y={968} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 28, fill: 'rgba(243,237,226,0.55)' }} opacity={o(b(35) + 0.3)}>Double the effort. Double the reward?</text>
      </svg>
    </AbsoluteFill>
  );
};

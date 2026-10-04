import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, hit, rnd, EN, ZH, GOLD, INK, benford } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { COUNT } from './S01';

/* S4, mechanism (b128–b161, the build): a town of 1,000 grows 10 % a year. On a log ruler from 1 to 10 the town's
   marker moves at a constant speed, so it spends 7.3 years between 1 and 2 and 1.1 years between 9 and 10.
   At 10,000 it wraps to 1 again.
   S5, reveal (b161–b192, the second drop): the ruler's nine segments stand up as Benford's staircase; then the
   215 countries from the opening are laid over it (outlined bars) and nearly coincide. */
export const S4_IN = b(128) - 0.3, S5_OUT = b(192) + 0.3;

export const LINES_S45: Line[] = [
  [b(128) + 0.1, b(136) - 0.1, '为什么？看一个每年涨一成的小镇。', 'Why? Picture a town that grows 10% a year.'],
  [b(136) + 0.06, b(144) - 0.1, '从1千涨到2千，要7年多；', 'From 1,000 to 2,000 takes over 7 years;'],
  [b(144) + 0.06, b(152) - 0.1, '从9千到1万，1年多就过了。', 'from 9,000 to 10,000, just over a year.'],
  [b(152) + 0.06, b(161) - 0.15, '那1开头的，到底占多少？', 'So how many numbers start with 1?'],
  [b(161) + 0.06, b(168) - 0.1, '约[三成]，以1开头；', 'About 30% begin with 1;'],
  [b(168) + 0.06, b(176) - 0.1, '以9开头的，[不到5%]。', 'fewer than 5% begin with 9.'],
  [b(176) + 0.06, b(184) - 0.1, '这叫[本福特定律]。', "This is Benford's law."],
  [b(184) + 0.06, b(192) - 0.15, '开头那215个国家，几乎完全吻合。', 'The 215 countries from the start fit it almost exactly.'],
];

// growth: years since the start; constant rate, so 2,000 arrives as the line "要7年多" begins
const Y0 = b(130), RATE = Math.log(2) / Math.log(1.1) / (b(136) - Y0); // years per second
const yearsAt = (T: number) => Math.max(0, (T - Y0) * RATE);
const popAt = (y: number) => 1000 * Math.pow(1.1, y);
const RL = { x0: 260, x1: 1660, y: 640 }; // the log ruler
const BASE = 720; // the staircase's baseline (digits sit above the subtitles)
const rx = (v: number) => RL.x0 + (RL.x1 - RL.x0) * Math.log10(v); // v in [1, 10]

const House: React.FC<{ x: number; s: number; lit: boolean; k: number }> = ({ x, s, lit, k }) => (
  <g transform={`translate(${x},440) scale(${s})`}>
    <rect x={-22} y={-34} width={44} height={34} fill={['#2b3550', '#33304a', '#2a3a4a'][k % 3]} />
    <path d="M-28,-34 L0,-58 L28,-34 Z" fill="#1c2236" />
    <rect x={-8} y={-24} width={10} height={10} fill={lit ? '#ffcf80' : '#151a28'} />
  </g>
);

export const S45: React.FC<{ T: number }> = ({ T }) => {
  if (T < S4_IN || T > S5_OUT) return null;
  const o = easeOut(prog(T, S4_IN, S4_IN + 0.6)) * (1 - easeInOut(prog(T, S5_OUT - 0.5, S5_OUT)));
  const y = yearsAt(Math.min(T, b(160)));
  const p = popAt(y);
  const lap = p >= 10000 ? 1 : 0;
  const v = lap ? p / 10000 : p / 1000; // position on the ruler, 1..10
  const stand = easeInOut(prog(T, b(161) - 0.15, b(161) + 0.45)); // segments stand up on the drop
  const drop = hit(T, b(161), 0.16);
  const townO = 1 - easeInOut(prog(T, b(158), b(161)));
  const fit = easeOut(prog(T, b(184), b(185) + 0.3));
  const push = 1 + 0.04 * easeInOut(prog(T, b(161), S5_OUT));
  const houses = Math.min(44, Math.floor(5 + 39 * Math.log10(p / 1000) / 1.3));
  // years spent in each first-digit segment (first lap)
  const spent = (d: number) => {
    const a = Math.log(d) / Math.log(1.1), z = Math.log(d + 1) / Math.log(1.1);
    return Math.max(0, Math.min(lap ? 99 : y, z) - a);
  };
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0d16', opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <svg width={1920} height={1080}>
          <defs>
            <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d1428" /><stop offset="1" stopColor="#2a2a40" /></linearGradient>
            <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6a8" /><stop offset="1" stopColor="#c8913a" /></linearGradient>
          </defs>
          {/* the town */}
          <g opacity={townO}>
            <rect width={1920} height={440} fill="url(#dusk)" />
            <rect y={430} width={1920} height={30} fill="#141826" />
            {Array.from({ length: houses }, (_, k) => <House key={k} k={k} x={90 + ((k * 397) % 1760) + rnd(k, 51) * 30} s={1.3 + rnd(k, 52) * 1.0} lit={rnd(k, 53) > 0.3} />)}
            {/* the sign */}
            <g transform="translate(960,150)">
              <rect x={-170} y={-70} width={340} height={150} rx={8} fill="#efe6d0" />
              <rect x={-8} y={80} width={16} height={200} fill="#5a4630" />
              <text y={-28} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 28, fill: '#4a3a26' }}>小镇 · 人口</text>
              <text y={48} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 80, fill: '#2a2018', fontVariantNumeric: 'lining-nums tabular-nums' }}>
                <tspan fill="#b07a1e">{Math.floor(p).toLocaleString('en-US')[0]}</tspan>{Math.floor(p).toLocaleString('en-US').slice(1)}
              </text>
            </g>
            <text x={1700} y={110} textAnchor="end" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, fill: INK }}>第 {Math.floor(y)} 年</text>
          </g>
          {/* the log ruler: segments light as the marker crosses them; then they stand up as bars */}
          {Array.from({ length: 9 }, (_, k) => {
            const d = k + 1, xa = rx(d), xb = rx(d + 1);
            const lit = spent(d) > 0.01 ? 1 : 0;
            const barW = 104, gap = 150;
            const bx = 960 + (k - 4) * gap - barW / 2, bh = benford(d) * 1500;
            const x = lerp(xa + 2, bx, stand), w = lerp(xb - xa - 4, barW, stand);
            const h = lerp(36, bh, stand), yy = lerp(RL.y - 18, BASE - bh, stand);
            const countryH = (COUNT(d) / 215) * 1500;
            return (
              <g key={d}>
                <rect x={x} y={yy} width={w} height={h} rx={3} fill={lit || stand > 0 ? 'url(#bar)' : 'rgba(243,237,226,0.08)'} opacity={stand > 0 ? 1 : lit ? (d === 1 ? 1 : 0.75) : 1} />
                {/* tick and digit */}
                <text x={stand > 0.5 ? bx + barW / 2 : xa} y={stand > 0.5 ? BASE + 52 : RL.y + 62} textAnchor={stand > 0.5 ? 'middle' : 'start'} style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: d === 1 ? GOLD : INK, fontVariantNumeric: 'lining-nums' }}>{d}</text>
                {/* time spent in this segment */}
                {stand < 0.05 && (d === 1 || d === 9) && spent(d) > 0.05 && (
                  <text x={(xa + xb) / 2} y={RL.y - 38} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, fill: d === 1 ? GOLD : INK }}>{spent(d).toFixed(1)} 年</text>
                )}
                {/* the percentage, once standing */}
                {stand > 0.6 && (
                  <text x={bx + barW / 2} y={BASE - bh - 22} textAnchor="middle" opacity={easeOut(prog(T, b(161) + 0.3 + k * 0.08, b(161) + 0.6 + k * 0.08))}
                    style={{ fontFamily: EN, fontWeight: 700, fontSize: d === 1 || d === 9 ? 52 : 32, fill: d === 1 ? GOLD : INK, fontVariantNumeric: 'lining-nums' }}>{(benford(d) * 100).toFixed(1)}%</text>
                )}
                {/* the 215 countries, outlined, laid over the law */}
                {fit > 0 && <rect x={bx - 6} y={BASE - countryH * fit} width={barW + 12} height={countryH * fit} fill="none" stroke="#f3ede2" strokeWidth={3} strokeDasharray="8 5" opacity={0.9} />}
              </g>
            );
          })}
          {stand < 0.5 && <text x={rx(10)} y={RL.y + 62} style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: INK }} opacity={1 - stand * 2}>10</text>}
          {/* the town's marker on the ruler */}
          {stand < 0.02 && T > Y0 - 0.3 && (
            <g transform={`translate(${rx(Math.min(9.999, v))},${RL.y})`}>
              <circle r={16} fill={GOLD} />
              <circle r={30} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.5} />
            </g>
          )}
          {/* the law, written once */}
          <text x={1480} y={215} textAnchor="middle" opacity={easeOut(prog(T, b(176) + 0.2, b(177) + 0.2)) * (1 - fit * 0.4)} style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 64, fill: GOLD }}>P(d) = log₁₀(1 + 1/d)</text>
          {fit > 0 && (
            <g opacity={fit}>
              <rect x={1290} y={330} width={34} height={20} fill="url(#bar)" /><text x={1336} y={348} style={{ fontFamily: ZH, fontSize: 26, fill: INK }}>本福特定律</text>
              <rect x={1290} y={372} width={34} height={20} fill="none" stroke="#f3ede2" strokeWidth={3} strokeDasharray="8 5" /><text x={1336} y={390} style={{ fontFamily: ZH, fontSize: 26, fill: INK }}>215 个国家和地区（2025）</text>
            </g>
          )}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: '#fff4dc', opacity: 0.25 * drop }} />
      <SubBand />
      <Chapter T={T} at={b(128)} out={b(160)} text="一 个 每 年 涨 10% 的 小 镇 · 示 意" />
      <Subs T={T} lines={LINES_S45} />
    </AbsoluteFill>
  );
};

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, win, Subs, SubBand, Chapter, Note, Line, GOLD, CREAM, NIGHT, ZH, EN, GOLD_TEXT } from '../v6/ui6';
import { Vignette, Grain } from '../ui';

/* S5, b124 -> b159.6 (the build): pigeons learn to switch; people don't (Herbranson & Schroeder 2010). 2D.
   In the musical gap (b155 -> b159.6) the pigeon stops and looks at us. */
export const S5_IN = b(96), S5_OUT = b(124);
const GAP = b(119.2); // the bird turns to camera on the question
const LINES: Line[] = [
  [S5_IN + 0.15, b(101) - 0.08, '更离谱的是：[鸽子]', 'Stranger still: pigeons.'],
  [b(101) + 0.06, b(107) - 0.08, '2010年，鸽子也来玩', '2010: scientists trained pigeons on this game.'],
  [b(107) + 0.06, b(113) - 0.08, '一个月后，鸽子几乎[每次都换]', 'After a month, the pigeons switched almost every time.'],
  [b(113) + 0.06, b(119) - 0.08, '人玩了200局，还是常常[不换]', 'People, after 200 rounds, still often stayed.'],
  [b(119) + 0.06, S5_OUT - 0.2, '[为什么？]', 'Why?'],
];
/* the pigeon faces left; peck in [0..1] pushes the head down to the key; look turns the head to camera */
const Pigeon: React.FC<{ peck: number; look: number; blink: boolean }> = ({ peck, look, blink }) => {
  const hx = -70 - 40 * peck, hy = -150 + 70 * peck;
  return (
    <g>
      <ellipse cx={10} cy={6} rx={110} ry={14} fill="#000" opacity={0.25} />
      <path d="M -10 -4 L -20 6 M -10 -4 L -2 6 M 30 -4 L 22 6 M 30 -4 L 40 6" stroke="#c4574a" strokeWidth={6} strokeLinecap="round" />
      <path d="M -10 -30 L -10 -4 M 30 -30 L 30 -4" stroke="#c4574a" strokeWidth={7} />
      <path d="M -80 -90 Q -60 -150 20 -140 Q 110 -130 150 -80 Q 120 -30 30 -26 Q -60 -24 -80 -90 Z" fill="#8d96ad" />
      <path d="M -20 -110 Q 50 -140 140 -86 Q 90 -60 10 -66 Z" fill="#6f7891" />
      <path d="M 140 -86 L 210 -70 L 200 -56 L 136 -66 Z" fill="#4e566b" />
      <path d="M 40 -100 Q 90 -100 130 -84" stroke="#4e566b" strokeWidth={5} fill="none" />
      {/* neck with sheen */}
      <path d={`M -70 -96 Q ${hx + 10} ${hy + 30} ${hx} ${hy} L ${hx + 36} ${hy + 6} Q -30 -110 -30 -96 Z`} fill="#6d8f7f" />
      <path d={`M -64 -100 Q ${hx + 16} ${hy + 34} ${hx + 8} ${hy + 10}`} stroke="#9a6fb0" strokeWidth={6} fill="none" opacity={0.7} />
      <g transform={`translate(${hx} ${hy}) rotate(${-20 * peck})`}>
        <circle r={30} fill="#8d96ad" />
        {look > 0.5 ? (
          <g>
            <circle cx={-10} cy={-6} r={8} fill="#f0a23a" /><circle cx={-10} cy={-6} r={4} fill="#111" />
            <circle cx={12} cy={-6} r={8} fill="#f0a23a" /><circle cx={12} cy={-6} r={4} fill="#111" />
            <path d="M -4 6 L 4 6 L 0 22 Z" fill="#3a3a40" />
          </g>
        ) : (
          <g>
            {blink ? <path d="M -18 -8 L -6 -8" stroke="#111" strokeWidth={3} /> : <><circle cx={-12} cy={-8} r={8} fill="#f0a23a" /><circle cx={-12} cy={-8} r={4} fill="#111" /></>}
            <path d="M -28 -2 L -52 4 L -28 8 Z" fill="#3a3a40" />
            <circle cx={-26} cy={-6} r={5} fill="#e9e4da" />
          </g>
        )}
      </g>
    </g>
  );
};

export const PigeonScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < S5_IN - 0.05 || T > S5_OUT + 0.05) return null;
  const o = Math.min(easeOut(prog(T, S5_IN - 0.05, S5_IN + 0.5)), 1 - prog(T, S5_OUT - 0.3, S5_OUT));
  // time warp: the bird's own clock stops in the musical gap
  const Tw = T;
  // trial loop (bird's own clock, ~2.3 s): keys light, one goes dark, peck the other
  const cyc = 1.7, ph = ((Tw - S5_IN) % cyc + cyc) % cyc, round = Math.floor((Tw - S5_IN) / cyc);
  const firstKey = round % 3, deadKey = (firstKey + 1 + (round % 2)) % 3, otherKey = 3 - firstKey - deadKey;
  const peckAt = (t: number) => Math.max(0, Math.sin(clamp((ph - t) / 0.28) * Math.PI));
  const peck = Math.max(peckAt(0.25), peckAt(1.1));
  const target = ph < 0.9 ? firstKey : otherKey;
  const look = easeInOut(prog(T, GAP, GAP + 0.4));
  const blink = Math.floor(Tw * 3.1) % 7 === 0;
  const keysX = [1180, 1320, 1460];
  // chart
  const chartO = easeOut(prog(T, b(107), b(107.6))) * (1 - 0.5 * prog(T, GAP, GAP + 0.6));
  const pig = easeInOut(prog(T, b(107.2), b(110.6)));
  const hum = easeInOut(prog(T, b(113.2), b(116.4)));
  const X0 = 120, X1 = 860, Y0 = 640, Y1 = 230;
  const pigeonCurve = (d: number) => 0.36 + 0.6 * (1 - Math.exp(-d / 7)); // illustrative shape ending near "almost always"
  const humanCurve = (d: number) => 0.5 + 0.16 * (1 - Math.exp(-d / 6)); // illustrative, ends near two thirds
  const path = (f: (d: number) => number, k: number) => Array.from({ length: Math.max(2, Math.floor(31 * k)) }, (_, d) => `${d ? 'L' : 'M'} ${lerp(X0, X1, d / 30).toFixed(1)} ${lerp(Y0, Y1, f(d)).toFixed(1)}`).join(' ');
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, opacity: o }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 70% at 70% 45%, #1d2438 0%, #070a14 72%)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* the test box */}
        <g>
          <rect x={1040} y={180} width={760} height={600} rx={20} fill="#222a3c" stroke="#3a445e" strokeWidth={6} />
          <rect x={1040} y={700} width={760} height={80} fill="#1a2030" />
          {keysX.map((x, i) => {
            const on = ph < 0.6 ? 1 : i === deadKey ? 0.15 : 1;
            const win2 = ph > 1.3 && i === otherKey;
            return (
              <g key={i}>
                <circle cx={x} cy={460} r={44} fill="#0f1420" />
                <circle cx={x} cy={460} r={34} fill={win2 ? GOLD : '#e9e4da'} opacity={on} />
                {on > 0.5 && <circle cx={x} cy={460} r={60} fill={win2 ? GOLD : '#e9e4da'} opacity={0.12} />}
                <text x={x} y={540} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 30, fill: 'rgba(243,237,226,0.5)' }}>{i + 1}</text>
              </g>
            );
          })}
          {/* food hopper flashes when the bird wins */}
          <rect x={1370} y={620} width={140} height={50} rx={8} fill={ph > 1.32 ? '#f6cf78' : '#2c3448'} />
          <g transform={`translate(${1650 - 18 * (target - 1)} 700) scale(1.15)`}><Pigeon peck={peck} look={look} blink={blink} /></g>
        </g>
        {/* the learning chart */}
        {chartO > 0 && (
          <g opacity={chartO}>
            <rect x={X0 - 60} y={Y1 - 90} width={X1 - X0 + 120} height={Y0 - Y1 + 170} rx={18} fill="rgba(7,10,20,0.82)" stroke="rgba(201,214,245,0.15)" />
            <text x={X0} y={Y1 - 40} style={{ fontFamily: ZH, fontWeight: 600, fontSize: 26, fill: 'rgba(243,237,226,0.75)' }}>选择"换"的比例（示意曲线）</text>
            <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="rgba(243,237,226,0.4)" strokeWidth={2} />
            {[[1, '100%'], [2 / 3, '2/3'], [0.5, '50%']].map(([v, s]: any) => (
              <g key={s}><line x1={X0} y1={lerp(Y0, Y1, v)} x2={X1} y2={lerp(Y0, Y1, v)} stroke="rgba(243,237,226,0.12)" strokeDasharray="6 6" />
                <text x={X0 - 12} y={lerp(Y0, Y1, v) + 8} textAnchor="end" style={{ fontFamily: EN, fontSize: 22, fill: 'rgba(243,237,226,0.55)' }}>{s}</text></g>
            ))}
            <text x={X1} y={Y0 + 36} textAnchor="end" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.55)' }}>练习 →</text>
            <path d={path(pigeonCurve, pig)} stroke={GOLD} strokeWidth={6} fill="none" />
            {pig > 0.95 && <text x={X1 - 10} y={lerp(Y0, Y1, pigeonCurve(30)) - 18} textAnchor="end" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: GOLD }}>鸽子：几乎每次都换</text>}
            {hum > 0 && <path d={path(humanCurve, hum)} stroke="#a9c2ee" strokeWidth={6} fill="none" />}
            {hum > 0.95 && <text x={X1 - 10} y={lerp(Y0, Y1, humanCurve(30)) + 44} textAnchor="end" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: '#a9c2ee' }}>人：约三分之二的时候换</text>}
          </g>
        )}
      </svg>
      <Chapter T={T} at={S5_IN + 0.4} out={S5_OUT - 0.4} text="2010 · 鸽 子 实 验" />
      <Note T={T} at={b(101.2)} out={S5_OUT - 0.3} text="Herbranson & Schroeder, Journal of Comparative Psychology, 2010　画面为示意" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

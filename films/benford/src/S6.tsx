import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, hit, pop, rnd, EN, ZH, GOLD, INK, RED, benford } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';

/* S6, 1993 (b192–b232): State of Arizona v. Wayne James Nelson. A manager in the Arizona State Treasurer's office
   wrote 23 cheques (nearly $2 million) to a bogus vendor; most amounts were just under $100,000 and over 90 %
   began with 7, 8 or 9 (Nigrini, Journal of Accountancy, 1999). Nobody in shot: an empty swivel chair, a printer
   feeding cheques on its own clock, a CRT where the first digits pile up against Benford's outline.
   The per-digit split below is illustrative (21 of 23 start with 7–9) and labelled 示意. */
export const S6_IN = b(192) - 0.3, S6_OUT = b(232) + 0.3;

export const LINES_S6: Line[] = [
  [b(192) + 0.1, b(200) - 0.1, '1993年，美国亚利桑那州，', 'Arizona, 1993.'],
  [b(200) + 0.06, b(208) - 0.1, '一位财政官员开出23张支票，近200万美元。', 'A state treasury manager wrote 23 cheques worth nearly $2 million.'],
  [b(208) + 0.06, b(216) - 0.1, '金额全是{他编的}。', 'He made up every amount.'],
  [b(216) + 0.06, b(224) - 0.1, '九成以上，以7、8、9开头。', 'Over 90% began with 7, 8 or 9.'],
  [b(224) + 0.06, b(232) - 0.15, '和本福特定律一比，[一眼露馅]。', "Against Benford's law, it stood out at a glance."],
];

const FIRST = [9, 8, 9, 7, 9, 8, 9, 8, 1, 9, 8, 7, 9, 9, 8, 8, 9, 7, 4, 9, 8, 9, 8]; // 21 of 23 start with 7–9 (示意)
const AMT = FIRST.map((d, i) => `${d}${Math.floor(rnd(i, 61) * 10)},${String(Math.floor(rnd(i, 62) * 1000)).padStart(3, '0')}.${String(Math.floor(rnd(i, 63) * 100)).padStart(2, '0')}`);
// the printer's own clock: a steady feed with a pause every fourth cheque (not the beat)
const PRINT: number[] = [];
for (let t = b(200) + 0.3, i = 0; i < 23; i++) { PRINT.push(t); t += 0.42 + (i % 4 === 3 ? 0.35 : 0); }
const FLY0 = b(216) + 0.2;

const Cheque: React.FC<{ amt: string; x: number; y: number; r: number; s?: number; hi?: number }> = ({ amt, x, y, r, s = 1, hi = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <rect x={-150} y={-62} width={300} height={124} rx={4} fill="#e3ead9" stroke="#8a9a80" strokeWidth={2} />
    <rect x={-150} y={-62} width={300} height={18} fill="#c9d8bf" />
    <text x={-136} y={-14} style={{ fontFamily: EN, fontWeight: 700, fontSize: 14, letterSpacing: '0.16em', fill: '#4a5a44' }}>PAY TO THE ORDER OF</text>
    <text x={-136} y={36} style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 34, fill: '#22301e' }}>
      $<tspan fill={hi > 0.5 ? RED : '#22301e'}>{amt[0]}</tspan>{amt.slice(1)}
    </text>
    {hi > 0 && <circle cx={-98} cy={24} r={24} fill="none" stroke={RED} strokeWidth={4} opacity={hi} />}
  </g>
);

export const S6: React.FC<{ T: number }> = ({ T }) => {
  if (T < S6_IN || T > S6_OUT) return null;
  const o = easeOut(prog(T, S6_IN, S6_IN + 0.6)) * (1 - easeInOut(prog(T, S6_OUT - 0.5, S6_OUT)));
  const printed = PRINT.filter((t) => T >= t).length;
  const close = easeInOut(prog(T, b(208) - 0.2, b(209) + 0.2)); // push in on the pile
  const toCRT = easeInOut(prog(T, b(216) - 0.3, b(217) + 0.3)); // to the screen
  const stamp = pop(T, b(224) + 0.15, 0.3);
  const thud = hit(T, b(224) + 0.15, 0.15);
  // camera: wide office → cheque pile → CRT
  // framed so the pile (≈1000,700) and then the screen centre (1420,450) sit mid-frame, above the subtitles
  const camS = lerp(lerp(1, 1.9, close), 2.0, toCRT), camX = lerp(lerp(0, -76, close), -920, toCRT), camY = lerp(lerp(0, -244, close), 110, toCRT);
  const shake = thud * 6 * (rnd(Math.floor(T * 30), 64) - 0.5);
  const counts = Array.from({ length: 9 }, (_, k) => FIRST.filter((d, i) => d === k + 1 && T > FLY0 + i * 0.09 + 0.6).length);
  const scr = { x: 1210, y: 300, w: 420, h: 300 };
  return (
    <AbsoluteFill style={{ backgroundColor: '#1c1612', opacity: o }}>
      <AbsoluteFill style={{ transform: `translate(${camX + shake}px,${camY}px) scale(${camS})`, transformOrigin: '960px 540px' }}>
        <svg width={1920} height={1080}>
          <defs>
            <linearGradient id="dusk93" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0a35c" /><stop offset="0.55" stopColor="#d9714a" /><stop offset="1" stopColor="#6a3a3a" /></linearGradient>
            <radialGradient id="crtglow" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor="#3cff9a" stopOpacity="0.12" /><stop offset="1" stopColor="#3cff9a" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width={1920} height={1080} fill="#2a221c" />
          {/* window with blinds onto the desert at dusk */}
          <g transform="translate(150,90)">
            <rect width={760} height={520} fill="url(#dusk93)" />
            <circle cx={260} cy={330} r={70} fill="#ffd58a" />
            <path d="M0,400 L120,350 L230,390 L360,320 L520,380 L760,340 L760,520 L0,520 Z" fill="#6a3a2a" />
            <g fill="#3a2a1e"><rect x={600} y={260} width={16} height={150} /><rect x={578} y={310} width={30} height={10} /><rect x={612} y={290} width={26} height={10} /></g>
            {Array.from({ length: 15 }, (_, i) => <rect key={i} y={i * 35} width={760} height={13} fill="#3a3028" opacity={0.78} />)}
            <rect x={-16} y={-16} width={792} height={552} fill="none" stroke="#3a3028" strokeWidth={32} />
          </g>
          {/* filing cabinets */}
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${1560 + i * 170},300)`}>
              <rect width={150} height={460} fill="#5a5a56" />
              {[0, 1, 2, 3].map((k) => <rect key={k} x={12} y={16 + k * 110} width={126} height={96} fill="none" stroke="#3a3a38" strokeWidth={4} />)}
            </g>
          ))}
          {/* the empty swivel chair, still turning a little */}
          <g transform={`translate(560,760) rotate(${3 * Math.sin(T * 0.7) * Math.exp(-(T - S6_IN) / 8)})`}>
            <rect x={-80} y={-200} width={160} height={170} rx={34} fill="#2c3448" />
            <rect x={-64} y={-186} width={128} height={140} rx={26} fill="#364058" />
            <rect x={-10} y={-30} width={20} height={40} fill="#1a1f2a" />
          </g>
          {/* desk */}
          <rect x={0} y={760} width={1920} height={40} fill="#6a5440" />
          <rect x={0} y={800} width={1920} height={280} fill="#3e3026" />
          {/* dot-matrix printer */}
          <g transform="translate(820,760)">
            <rect x={-170} y={-96} width={340} height={96} rx={10} fill="#cfc8b8" />
            <rect x={-150} y={-110} width={300} height={16} fill="#8a8478" />
            <circle cx={128} cy={-48} r={7} fill={T > PRINT[0] && T < PRINT[22] + 0.4 && Math.floor(T * 6) % 2 ? '#3cff9a' : '#2a4a32'} />
          </g>
          {/* cheques: the one feeding out, and the pile */}
          {Array.from({ length: Math.min(23, printed + 1) }, (_, i) => {
            const t0 = PRINT[i];
            if (T < t0 - 0.4) return null;
            const out = easeInOut(prog(T, t0 - 0.4, t0));
            const onPile = T > t0 + 0.05;
            const land = easeOut(prog(T, t0 + 0.05, t0 + 0.35));
            const px = 1180 + (rnd(i, 65) - 0.5) * 30, py = 730 - i * 4;
            const x = onPile ? lerp(820, px, land) : 820, y = onPile ? lerp(640, py, land) : lerp(700, 640, out);
            const hi = easeOut(prog(T, b(210) + i * 0.03, b(210) + 0.3 + i * 0.03)) * (FIRST[i] >= 7 ? 1 : 0);
            const fly = T > FLY0 + i * 0.09 ? 1 : 0;
            return fly ? null : <Cheque key={i} amt={AMT[i]} x={x} y={y} r={onPile ? (rnd(i, 66) - 0.5) * 12 : 0} s={0.62} hi={hi} />;
          })}
          {/* the CRT */}
          <g transform={`translate(${scr.x},${scr.y})`}>
            <rect x={-40} y={-40} width={scr.w + 80} height={scr.h + 90} rx={22} fill="#cbc3b0" />
            <rect width={scr.w} height={scr.h} fill="#0c1a12" />
            <rect width={scr.w} height={scr.h} fill="url(#crtglow)" />
            <rect x={scr.w / 2 - 80} y={scr.h + 50} width={160} height={30} fill="#b8b0a0" />
            {/* Benford's outline and the cheques' first digits */}
            {Array.from({ length: 9 }, (_, k) => {
              const d = k + 1, bw = 34, gx = 24 + k * 43, bh = benford(d) * 520;
              const ch = (counts[k] / 23) * 520 * 0.55;
              return (
                <g key={d}>
                  <rect x={gx} y={250 - bh} width={bw} height={bh} fill="none" stroke={GOLD} strokeWidth={2} strokeDasharray="5 4" opacity={0.85} />
                  {ch > 0 && <rect x={gx + 4} y={250 - ch} width={bw - 8} height={ch} fill={d >= 7 ? RED : '#7dffb0'} />}
                  <text x={gx + bw / 2} y={280} textAnchor="middle" style={{ fontFamily: 'monospace', fontSize: 18, fill: d >= 7 && counts[k] > 0 ? '#ff8a7e' : '#7dffb0' }}>{d}</text>
                </g>
              );
            })}
            <text x={scr.w - 14} y={24} textAnchor="end" style={{ fontFamily: ZH, fontSize: 16, fill: '#7dffb0', opacity: 0.8 }}>示意</text>
            {stamp > 0.01 && (
              <g transform={`translate(${scr.w / 2},${scr.h / 2 - 20}) rotate(-12) scale(${2.2 - 1.2 * Math.min(1, stamp)})`} opacity={Math.min(1, stamp * 1.5)}>
                <rect x={-150} y={-42} width={300} height={84} rx={8} fill="none" stroke={RED} strokeWidth={7} />
                <text y={16} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 46, fill: RED }}>不符合规律</text>
              </g>
            )}
          </g>
          {/* first digits leaving the cheques for the screen */}
          {T > FLY0 && T < FLY0 + 23 * 0.09 + 0.7 && FIRST.map((d, i) => {
            const t = prog(T, FLY0 + i * 0.09, FLY0 + i * 0.09 + 0.6);
            if (t <= 0 || t >= 1) return null;
            const e = easeInOut(t);
            const x = lerp(1180, scr.x + 24 + (d - 1) * 43 + 17, e), y = lerp(720 - i * 4, scr.y + 220, e) - 160 * Math.sin(Math.PI * e);
            return <text key={i} x={x} y={y} textAnchor="middle" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: lerp(40, 20, e), fill: d >= 7 ? '#ff8a7e' : '#7dffb0' }}>{d}</text>;
          })}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: RED, opacity: 0.12 * thud }} />
      <SubBand />
      <Chapter T={T} at={b(192)} out={b(232)} text="1993 · 美 国 亚 利 桑 那 州 财 政 部 门" />
      {/* count of cheques printed */}
      {T > b(200) && T < b(216) && (
        <div style={{ position: 'absolute', top: 120, right: 70, textAlign: 'right', opacity: easeOut(prog(T, b(200), b(201))) * (1 - easeInOut(prog(T, b(215), b(216)))) }}>
          <div style={{ fontFamily: EN, fontWeight: 700, fontSize: 84, lineHeight: 1, color: INK, fontVariantNumeric: 'lining-nums tabular-nums', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}>{printed}</div>
          <div style={{ fontFamily: ZH, fontSize: 24, color: 'rgba(243,237,226,0.7)', letterSpacing: '0.12em' }}>张 支 票</div>
        </div>
      )}
      <Subs T={T} lines={LINES_S6} />
    </AbsoluteFill>
  );
};

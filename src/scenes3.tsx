import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CUT, FILM_END, ZH, SANS, MONO, INK, DIM, RED, GOLD, prog, easeOut, easeIn, easeInOut, expoInOut, lerp, clamp, rnd, pop, hit } from './lib';
import { stageStyle } from './camera';
import { JUNO } from './brand/identity';

/* Stages 7–9: the second drop (every relationship has a last meeting: 120 lines, 120 red dots, the camera pulling
   out from one of them), the payoff (the pair from the opening comes back together: P(重逢 | 现在就约)), end card. */

const Stage: React.FC<{ style: React.CSSProperties | null; children: React.ReactNode }> = ({ style, children }) =>
  style ? <AbsoluteFill style={style}><svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>{children}</svg></AbsoluteFill> : null;
const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };

// ------------------------------------------------------------------ the drop: 120 relationships, 120 last meetings
const NREL = 120;
const RELS = Array.from({ length: NREL }, (_, i) => {
  const s = 120 + rnd(i, 1) * 700, e = s + 200 + rnd(i, 2) * (1640 - s - 200);
  const ticks = Array.from({ length: 4 + Math.floor(rnd(i, 3) * 10) }, (_, k) => lerp(s, e, Math.pow(rnd(i * 20 + k, 4), 1.8)));
  return { y: 170 + i * 5.6, s, e, ticks };
});
export const DROP_FOCUS: [number, number] = [960, 540];

export const Drop: React.FC<{ T: number }> = ({ T }) => {
  const st = stageStyle(T, CUT.drop, CUT.pay, [0, 0], DROP_FOCUS);
  if (!st) return null;
  const a = CUT.drop;
  const zoom = Math.exp(Math.log(6) * (1 - expoInOut(prog(T, a, a + 1.9))));
  const focus = RELS[60];
  const fx = lerp(focus.e, 960, 0), fy = focus.y;
  const show = (i: number) => easeOut(prog(T, a + 0.25 + rnd(i, 7) * 1.4, a + 0.45 + rnd(i, 7) * 1.4));
  const count = Math.round(NREL * prog(T, a + 0.3, a + 2.2));
  const no = pop(T, 77.4, 0.3), yes = pop(T, 79.7, 0.3);
  return (
    <Stage style={st}>
      <g transform={`translate(${960 - fx * zoom} ${540 - fy * zoom}) scale(${zoom})`}>
        {RELS.map((r, i) => {
          const o = i === 60 ? 1 : show(i);
          if (o <= 0) return null;
          return (
            <g key={i} opacity={o}>
              <line x1={r.s} x2={r.e} y1={r.y} y2={r.y} stroke="rgba(242,240,234,0.22)" strokeWidth={1.4} />
              {r.ticks.map((x, k) => <rect key={k} x={x - 0.8} y={r.y - 2.2} width={1.6} height={4.4} fill="rgba(242,240,234,0.7)" />)}
              <circle cx={r.e} cy={r.y} r={2.8 + 1.2 * Math.sin(T * 6 + i)} fill={RED} />
            </g>
          );
        })}
      </g>
      <g>
        <text x={120} y={120} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, fill: INK }}>{count} 段关系</text>
        <text x={1800} y={120} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 64, fill: RED }}>{count} 个最后一面</text>
      </g>
      {no > 0 && T < 79.65 && (
        <g transform={`translate(960 560) scale(${0.8 + 0.2 * Math.min(1.1, no)})`}>
          <rect x={-520} y={-110} width={1040} height={170} rx={20} fill="rgba(6,6,8,0.85)" />
          <text x={0} y={20} textAnchor="middle" style={{ ...BLACK, fontSize: 110, fill: DIM }}>宇宙安排 <tspan fill={RED}>✕</tspan></text>
        </g>
      )}
      {yes > 0 && (
        <g transform={`translate(960 560) scale(${0.8 + 0.2 * Math.min(1.1, yes)})`}>
          <rect x={-520} y={-110} width={1040} height={170} rx={20} fill="rgba(6,6,8,0.85)" />
          <text x={0} y={20} textAnchor="middle" style={{ ...BLACK, fontSize: 110, fill: INK }}>只是 <tspan fill={RED}>不再约</tspan></text>
        </g>
      )}
    </Stage>
  );
};

// ------------------------------------------------------------------ payoff: the pair comes back together
export const Pay: React.FC<{ T: number }> = ({ T }) => {
  const st = stageStyle(T, CUT.pay, CUT.end, [0, 0], [960, 540]);
  if (!st) return null;
  const a = CUT.pay;
  const meet = expoInOut(prog(T, 87.3, 87.9));
  const half = lerp(700, 60, meet);
  const ang = meet >= 1 ? (T - 87.9) * 2.6 : 0;
  const A = [960 - Math.cos(ang) * half, 540 - Math.sin(ang) * half * 0.42], Bp = [960 + Math.cos(ang) * half, 540 + Math.sin(ang) * half * 0.42];
  const boom = hit(T, 87.9, 0.5);
  const pIn = easeOut(prog(T, a + 0.3, a + 0.7));
  const pOne = easeOut(prog(T, 87.95, 88.3));
  const wobble = (1 - meet) * Math.sin(T * 3) * 18;
  return (
    <Stage style={st}>
      <line x1={A[0]} y1={A[1]} x2={Bp[0]} y2={Bp[1]} stroke="rgba(242,240,234,0.3)" strokeWidth={2} strokeDasharray="10 12" strokeDashoffset={T * 80} />
      {meet < 1 && Array.from({ length: 24 }, (_, i) => {
        const f = ((T * 0.35 + i / 24) % 1);
        return <circle key={i} cx={lerp(A[0], Bp[0], f)} cy={lerp(A[1], Bp[1], f) + Math.sin(f * 12 + T) * 8} r={2.5} fill={INK} opacity={0.4} />;
      })}
      <circle cx={A[0]} cy={A[1] + wobble} r={18} fill={INK} style={{ filter: 'drop-shadow(0 0 16px rgba(242,240,234,0.8))' }} />
      <circle cx={Bp[0]} cy={Bp[1] - wobble} r={18} fill={RED} style={{ filter: 'drop-shadow(0 0 16px rgba(255,61,46,0.9))' }} />
      {meet < 0.3 && <>
        <text x={A[0]} y={A[1] - 40} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 28, fill: INK }}>你</text>
        <text x={Bp[0]} y={Bp[1] - 40} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 28, fill: RED }}>TA</text>
      </>}
      {boom > 0.01 && [0, 1, 2].map((k) => <circle key={k} cx={960} cy={540} r={40 + (1 - boom) * (300 + k * 160)} fill="none" stroke={k === 1 ? GOLD : INK} strokeWidth={3} opacity={boom * 0.8} />)}
      <g opacity={pIn}>
        <text x={960} y={300} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 84, fill: INK }}>
          P(重逢 | 等缘分) = <tspan fill={RED}>?</tspan>
        </text>
      </g>
      {pOne > 0 && (
        <text x={960} y={820} textAnchor="middle" opacity={pOne} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 84, fill: GOLD }}>P(重逢 | 现在就约) ≈ 1</text>
      )}
    </Stage>
  );
};

// ------------------------------------------------------------------ end card
export const End: React.FC<{ T: number }> = ({ T }) => {
  const st = stageStyle(T, CUT.end, FILM_END + 1, [0, 0]);
  if (!st) return null;
  const at = CUT.end, t = T - at;
  const o = (x: number, d = 0.35) => easeOut(prog(t, x, x + d));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  return (
    <AbsoluteFill style={{ ...st, backgroundColor: '#060608' }}>
      <svg width={1920} height={1080}>
        <defs>
          <radialGradient id="end-g" cx="0.5" cy="0.42" r="0.5"><stop offset="0" stopColor="#f6cf78" stopOpacity="0.1" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
          <linearGradient id="e-metal" x1="0" y1={280} x2="0" y2={380} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#f3cd7a" /><stop offset="0.7" stopColor="#c99140" /><stop offset="1" stopColor="#8a5a22" /></linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#end-g)" />
        <text x={960} y={370} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 110 }}>
          {[...'《最后一面》'].map((ch, i) => <tspan key={i} fill="url(#e-metal)" opacity={o(i * 0.07, 0.18)}>{ch}</tspan>)}
        </text>
        <text x={960} y={490} textAnchor="middle" opacity={o(0.4)} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 54, fill: INK }}>你上一次见 TA，是什么时候？</text>
        <text x={960} y={548} textAnchor="middle" opacity={o(0.7)} style={{ fontFamily: SANS, fontSize: 26, fill: 'rgba(242,240,234,0.6)', letterSpacing: '0.1em' }}>评论区说一个日期，再把它发给 TA</text>
        <g opacity={o(1.0)}>
          <rect x={960 - 330} y={600} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={637} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(1.2)} style={{ fontFamily: SANS, fontSize: 18, fill: 'rgba(242,240,234,0.45)' }}>
          <text x={960} y={760} textAnchor="middle">资料：Mollenhorst, Volker & Flap (2014) Social Networks · 美国 ATUS 2010–2024（Our World in Data）· Roberts & Dunbar (2011, 2015)</text>
          <text x={960} y={790} textAnchor="middle">“5 次”“≈58%”为模型计算（假设每年见面机会降两成）· 图表为示意 · “Last meeting theory”为网络流行说法，并无研究依据</text>
        </g>
        <rect width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
export { clamp, DIM };

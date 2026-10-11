import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { MASCOTS, Expr, Costume } from './mascots';
import { Grain } from '../v13/il/kit';

const ZH = '"Noto Serif CJK SC", "Noto Serif SC", serif';
const EXPRS: [Expr, string][] = [['curious', '好奇'], ['shock', '震惊'], ['think', '想一想'], ['happy', '开心'], ['sad', '难过']];
const COST: [Costume, string][] = [['polar', '坚忍号 · 南极'], ['helmet', '伦敦 · 1940'], ['lifejacket', '泰坦尼克 · 1912'], ['grad', '心流 · 学习']];

/* Concept sheet: hero, expression set, per-episode costume gag. */
export const MascotSheet: React.FC<{ i: number }> = ({ i }) => {
  const m = MASCOTS[i], C = m.C as React.FC<any>;
  return (
    <AbsoluteFill style={{ background: m.bg }}>
      <svg width={1920} height={1080}>
        <text x={80} y={110} fontFamily={ZH} fontSize={26} fill={m.ink} opacity={0.7} letterSpacing={4}>系列吉祥物 · 方案 {i + 1}/4</text>
        <text x={80} y={190} fontFamily={ZH} fontSize={84} fontWeight={700} fill={m.ink}>{m.name}</text>
        <text x={80 + m.name.length * 86 + 20} y={190} fontFamily="Georgia, serif" fontSize={34} fontStyle="italic" fill={m.ink} opacity={0.7}>{m.py}</text>
        <foreignObject x={80} y={220} width={640} height={240}>
          <div style={{ fontFamily: ZH, color: m.ink, fontSize: 27, lineHeight: 1.6 }}>
            <div>{m.pitch}</div>
            <div style={{ marginTop: 14, opacity: 0.85 }}>{m.move}</div>
          </div>
        </foreignObject>
        <ellipse cx={380} cy={1000} rx={190} ry={22} fill="#000" opacity={0.12} />
        <g transform="translate(380 1000) scale(1.55)"><C expr="curious" t={0.6} /></g>
        <text x={820} y={110} fontFamily={ZH} fontSize={30} fill={m.ink} fontWeight={700}>表情</text>
        {EXPRS.map(([e, name], k) => (
          <g key={e}>
            <g transform={`translate(${900 + k * 215} 470) scale(0.7)`}><C expr={e} t={0.6} /></g>
            <text x={900 + k * 215} y={520} textAnchor="middle" fontFamily={ZH} fontSize={26} fill={m.ink}>{name}</text>
          </g>
        ))}
        <text x={820} y={600} fontFamily={ZH} fontSize={30} fill={m.ink} fontWeight={700}>每集换装</text>
        {COST.map(([c, name], k) => (
          <g key={c}>
            <g transform={`translate(${930 + k * 260} 985) scale(0.7)`}><C expr={k === 2 ? 'think' : 'curious'} costume={c} t={0.6} /></g>
            <text x={930 + k * 260} y={1040} textAnchor="middle" fontFamily={ZH} fontSize={24} fill={m.ink}>{name}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* Signature-move reel: 5 s per mascot — idle, wind-up, the reveal on the "drop", settle. */
const CL = 5, DROP = 2.0;
const spr = (x: number) => (x <= 0 ? 0 : 1 - Math.exp(-6 * x) * Math.cos(14 * x));
const sm = (t: number, a: number, d: number) => { const x = Math.max(0, Math.min(1, (t - a) / d)); return x * x * (3 - 2 * x); };
export const MR_FRAMES = CL * 30 * MASCOTS.length;
export const MascotReel: React.FC = () => {
  const f = useCurrentFrame(), i = Math.min(MASCOTS.length - 1, Math.floor(f / (CL * 30))), t = f / 30 - i * CL;
  const m = MASCOTS[i], C = m.C as React.FC<any>;
  const wind = sm(t, DROP - 0.45, 0.4) * (1 - sm(t, DROP, 0.05));
  const snap = t >= DROP ? spr(t - DROP) : 0;
  const k = t < DROP ? 0 : Math.min(1, snap) * (1 - sm(t, 4.0, 0.6));
  const sq = 1 - 0.14 * wind + (t >= DROP ? 0.16 * Math.exp(-5 * (t - DROP)) * Math.cos(16 * (t - DROP)) : 0);
  const expr: Expr = t < DROP ? (t > 1.2 ? 'think' : 'curious') : t < 2.9 ? 'shock' : 'happy';
  const jump = m.id === 'tuanzi' && t >= DROP ? -Math.max(0, Math.sin(Math.min(1, (t - DROP) / 0.45) * Math.PI)) * 60 : 0;
  const fade = Math.min(1, t / 0.2, (CL - t) / 0.2);
  const dark = m.id === 'dengdeng', lit = dark ? 0.25 + 0.75 * sm(t, DROP, 0.5) * (1 - 0.6 * sm(t, 4.2, 0.6)) : 0;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
        <svg width={1920} height={1080}>
          <defs>
            <radialGradient id="mr-v" cx="0.5" cy="0.6" r="0.7"><stop offset="0" stopColor={m.bg} /><stop offset="1" stopColor={dark ? '#0b0d1c' : m.bg} /></radialGradient>
            <radialGradient id="mr-lit" cx="0.5" cy="0.62" r="0.6"><stop offset="0" stopColor="#ffd890" stopOpacity={0.55} /><stop offset="1" stopColor="#ffd890" stopOpacity={0} /></radialGradient>
          </defs>
          <rect width={1920} height={1080} fill="url(#mr-v)" />
          {dark && <rect width={1920} height={1080} fill="url(#mr-lit)" opacity={lit} />}
          <ellipse cx={960} cy={900} rx={200} ry={24} fill="#000" opacity={0.13} />
          <g transform={`translate(960 ${900 + jump}) scale(1.75)`}>
            <C expr={expr} t={t} k={k} sq={sq} chart={m.id === 'yeye' ? sm(t, 2.6, 1.4) * (1 - sm(t, 4.5, 0.4)) : 0} />
          </g>
          <text x={80} y={120} fontFamily={ZH} fontSize={56} fontWeight={700} fill={m.ink}>{m.name}</text>
          <text x={80} y={170} fontFamily={ZH} fontSize={26} fill={m.ink} opacity={0.75}>招牌动作 · 在 drop 上触发</text>
          {t >= DROP && t < DROP + 0.35 && <rect width={1920} height={1080} fill="#ffffff" opacity={0.25 * (1 - (t - DROP) / 0.35)} />}
        </svg>
        <Grain frame={f} o={0.06} />
      </div>
    </AbsoluteFill>
  );
};

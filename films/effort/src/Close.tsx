import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, lerp, rnd, FILM_END, EN, ZH, GOLD, INK } from './lib';
import { Subs, SubBand, type Line } from './ui';
import { GoldTitle, Curve } from './Title';
import { output } from './S1';
import { shootH } from './Bamboo';
import { JUNO } from './brand/identity';

/* S9 (b294–b311): the straight line of the cold open comes back and becomes the three shapes of the film:
   it bends (the shop), it zigzags (luck), it lies flat for years and then shoots up (bamboo).
   S10 (b311 → end): the end card. */
export const S9_IN = b(294) - 0.4, END_IN = b(311);

export const LINES_S9: Line[] = [
  [b(294) + 0.3, b(302) - 0.1, '付出和回报，从来不是一条直线：', 'Effort and reward were never a straight line:'],
  [b(302) + 0.06, END_IN - 0.25, '有的会弯，有的看运气，有的要先在地下[等几年]。', 'some bend, some hang on luck, and some wait underground for years.'],
];

const x0 = 360, y0 = 760, w = 1200, h = 470;
const P = (u: number, v: number) => `${(x0 + u * w).toFixed(1)},${(y0 - v * h).toFixed(1)}`;
const shape = (f: (u: number) => number) => `M${Array.from({ length: 101 }, (_, i) => P(i / 100, f(i / 100))).join(' L')}`;
const straight = (u: number) => u;
const bent = (u: number) => output(u * 70) / 56;
// a random walk with a drift (luck): fixed seed so every frame is the same
const LUCK = (() => { const out = [0]; for (let i = 1; i <= 100; i++) out.push(Math.max(0, out[i - 1] + 0.0095 + (rnd(i, 7) - 0.5) * 0.08)); return out; })();
const luck = (u: number) => Math.min(1, LUCK[Math.round(u * 100)]);
const bamboo = (u: number) => shootH(u * 50) / 15;
const morph = (f: (u: number) => number, g: (u: number) => number, k: number) => (u: number) => lerp(f(u), g(u), k);

export const Close: React.FC<{ T: number }> = ({ T }) => {
  if (T < S9_IN) return null;
  const o = easeOut(prog(T, S9_IN, S9_IN + 0.6));
  const draw = easeInOut(prog(T, b(294) + 0.2, b(297)));
  const k1 = easeInOut(prog(T, b(302) + 0.2, b(303) + 0.4));
  const k2 = easeInOut(prog(T, b(304) + 0.2, b(305) + 0.4));
  const k3 = easeInOut(prog(T, b(306) + 0.2, b(307) + 0.4));
  const L = 1.5 * w;
  const lbl = (at: number) => easeOut(prog(T, at, at + 0.4));
  const end = easeInOut(prog(T, END_IN - 0.2, END_IN + 0.6));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 1 - end }}>
        <g stroke="rgba(243,237,226,0.06)">{Array.from({ length: 25 }, (_, i) => <line key={i} x1={i * 80} y1={0} x2={i * 80} y2={1080} />)}</g>
        <line x1={x0} y1={y0} x2={x0 + w + 20} y2={y0} stroke="rgba(243,237,226,0.5)" strokeWidth={2} />
        <line x1={x0} y1={y0} x2={x0} y2={y0 - h - 20} stroke="rgba(243,237,226,0.5)" strokeWidth={2} />
        <text x={x0 + w + 20} y={y0 + 44} textAnchor="end" style={{ fontFamily: ZH, fontSize: 30, fill: 'rgba(243,237,226,0.7)' }}>付出</text>
        <text x={x0 - 22} y={y0 - h} textAnchor="end" style={{ fontFamily: ZH, fontSize: 30, fill: 'rgba(243,237,226,0.7)' }}>回报</text>
        {/* the belief, faint once the others arrive */}
        <path d={shape(straight)} fill="none" stroke="rgba(243,237,226,0.45)" strokeWidth={3} strokeDasharray={k1 > 0 ? '8 10' : `${L * draw} ${L}`} />
        {k1 > 0 && <path d={shape(morph(straight, bent, k1))} fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 10px rgba(246,207,120,0.5))' }} />}
        {k2 > 0 && <path d={shape(morph(straight, luck, k2))} fill="none" stroke="#9fe3c0" strokeWidth={4} strokeLinecap="round" opacity={0.9} />}
        {k3 > 0 && <path d={shape(morph(straight, bamboo, k3))} fill="none" stroke="#e8d4a4" strokeWidth={4} strokeLinecap="round" opacity={0.9} />}
        <g style={{ fontFamily: ZH, fontWeight: 700, fontSize: 36 }}>
          <text x={x0 + 0.62 * w} y={y0 - bent(0.62) * h - 26} fill={GOLD} opacity={lbl(b(303))}>会弯</text>
          <text x={x0 + 0.42 * w} y={y0 - luck(0.42) * h - 30} fill="#9fe3c0" opacity={lbl(b(305))}>看运气</text>
          <text x={x0 + 0.5 * w} y={y0 - 26} fill="#e8d4a4" opacity={lbl(b(307))}>要等</text>
        </g>
      </svg>
      <SubBand o={1 - prog(T, END_IN - 0.3, END_IN + 0.3)} />
      <Subs T={T} lines={LINES_S9} />
      <EndCard T={T} />
    </AbsoluteFill>
  );
};

const Monogram: React.FC<{ T: number; at: number; x: number; y: number }> = ({ T, at, x, y }) => {
  const r = 46, per = 2 * Math.PI * r;
  const d = easeInOut(prog(T, at, at + 0.9));
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#f1c56d" strokeWidth={2} strokeDasharray={per} strokeDashoffset={per * (1 - d)} transform={`rotate(-90 ${x} ${y})`} />
      <text x={x} y={y + 22} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontWeight: 600, fontSize: 64, fill: '#f1c56d' }} opacity={easeOut(prog(T, at + 0.4, at + 0.9))}>J</text>
      <text x={x} y={y + r + 34} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 18, letterSpacing: '0.5em', fill: 'rgba(241,197,109,0.8)' }} opacity={easeOut(prog(T, at + 0.6, at + 1.1))}>JUNO</text>
    </g>
  );
};

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const t = T - END_IN;
  if (t < -0.1) return null;
  const black = easeIn(prog(T, FILM_END - 0.5, FILM_END));
  const o = (a: number, d = 0.5) => easeOut(prog(t, a, a + d));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <Monogram T={T} at={END_IN + 0.1} x={960} y={120} />
        <GoldTitle text="付出和回报" T={T} at={END_IN + 0.3} size={96} y={320} id="end" />
        <g opacity={o(0.9)}><Curve x={800} y={380} w={320} h={150} draw={easeInOut(prog(t, 0.9, 1.8))} id="endcv" axes={false} /></g>
        <text x={960} y={640} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 50, fill: INK, letterSpacing: '0.06em' }} opacity={o(1.5)}>你现在是在长根，还是在长竹子？</text>
        <text x={960} y={690} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.14em' }} opacity={o(1.8)}>评论区说说</text>
        <g opacity={o(2.3)}>
          <rect x={960 - 330} y={732} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={769} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(2.7)} style={{ fontFamily: ZH, fontSize: 17, letterSpacing: '0.03em', fill: 'rgba(243,237,226,0.42)' }}>
          <text x={960} y={944} textAnchor="middle">资料：Pencavel《The Productivity of Working Hours》(IZA 2014 / Economic Journal 2015) · Macnamara, Hambrick & Oswald, Psychological Science (2014)</text>
          <text x={960} y={972} textAnchor="middle">Pluchino, Biondo & Rapisarda《Talent vs Luck》Advances in Complex Systems (2018)，本片按原参数重跑模拟 · 湖南省林业局 · 科学网（毛竹生长）</text>
          <text x={960} y={1000} textAnchor="middle">模型（Sketchfab, CC BY）：li.amirsky · Weekless · Mikael H. · evolveduk · Mark Peters · 3DGunsmith · Coozy　|　产出曲线按论文形状示意</text>
        </g>
      </svg>
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

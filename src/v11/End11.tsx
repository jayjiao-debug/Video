import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { Monogram } from '../brand/Brand';
import { JUNO } from '../brand/identity';
import { C, F, LNUM, Cam, Svg, PaperDiv, PageInk, PenText, Coin, Margin11, GoldTitle11, Hinge, pr, eo, eio, pop, lerp, clamp, W, H } from './kit11';
import { Zoom } from './kit11';
import { easeIn } from '../lib';
import { CUT } from './time11';
import { ZX, ROW, BAR_H, TOT } from './Sheet11';
import { Lamp, Key, Reel, MW, MX, MY, MH, CXm, MACHINE_SMALL, MCX, MCY } from './Machine11';
import { b } from '../v6/ui6';

/* S13 the payoff (the balance sheet again) · S14 the Juno end card */

const Bar: React.FC<{ x: number; y: number; L: number; h: number; fill: string; o?: number; dashed?: boolean }> = ({ x, y, L, h, fill, o = 1, dashed }) =>
  o <= 0 ? null : dashed ? (
    <rect x={x} y={y - h / 2} width={L} height={h} fill="url(#k-hatchFine)" stroke={fill} strokeWidth={2.4} strokeDasharray="8 7" opacity={o} />
  ) : (
    <g opacity={o}>
      <rect x={Math.min(x, x + L)} y={y - h / 2} width={Math.abs(L)} height={h} fill={fill} />
      <rect x={Math.min(x, x + L)} y={y - h / 2} width={Math.abs(L)} height={h} fill="url(#k-hatchFine)" opacity={0.12} />
    </g>
  );

const SmallMachine: React.FC<{ T: number }> = ({ T }) => {
  const blink = [b(184.5), b(190), b(197)].reduce((m, t) => (T >= t && T < t + 0.3 ? Math.max(m, 1 - (T - t) / 0.3) : m), 0);
  return (
    <g transform={`translate(${MACHINE_SMALL.cx} ${MACHINE_SMALL.cy}) scale(${MACHINE_SMALL.s}) translate(${-MCX} ${-MCY})`}>
      <rect x={MX + 14} y={MY + 18} width={MW} height={MH - 18} rx={52} fill="url(#k-hatch)" opacity={0.5} />
      <rect x={MX} y={MY} width={MW} height={MH} rx={52} fill="#efe6d1" stroke={C.ink} strokeWidth={4} />
      <rect x={CXm - 92} y={MY + 98} width={184} height={44} rx={4} fill="#f6efdc" stroke={C.goldD} strokeWidth={2.2} />
      <text x={CXm} y={MY + 130} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28, letterSpacing: 6 }} fill={C.ink}>回复机</text>
      <Reel i={0} pos={0} speed={0} />
      <Reel i={1} pos={3} speed={0} />
      <Reel i={2} pos={2} speed={0} />
      <Lamp x={CXm} y={MY + 64} r={21} lit={blink} ray={0.4} />
      <Key x={CXm} y={MY + MH - 44} r={18} pressed={0} />
    </g>
  );
};

export const S13S14: React.FC<{ T: number }> = ({ T }) => {
  if (T < CUT.s13 - 0.02) return null;
  const turn = eio(T, CUT.s14, 0.62);
  return (
    <>
      {T >= CUT.s14 && <EndCard T={T} />}
      {turn < 1 && (
        <Zoom>
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - clamp((turn - 0.5) / 0.3) }}>
          <Hinge angle={-178 * turn} axisX={120} back={<PageBack />}>
            <S13 T={T} />
          </Hinge>
        </div>
        </Zoom>
      )}
    </>
  );
};

const PageBack: React.FC = () => (
  <div style={{ position: 'absolute', left: 120, top: 92, width: 1680, height: 708, borderRadius: 3, background: 'linear-gradient(180deg,#efe6d1,#e8dec6)', boxShadow: '0 30px 60px rgba(0,0,0,.45)' }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 151px, rgba(157,182,201,.18) 151px 152px, transparent 152px 197px)', opacity: 0.6 }} />
  </div>
);
const S13: React.FC<{ T: number }> = ({ T }) => {
  const inK = eo(T, CUT.s13 + 0.09, 0.3);
  const pull = eio(T, CUT.s13, 0.6);
  const push = eio(T, b(193), 0.8);
  const s = 1; void push; // no push: the page zoom already fills the frame
  const minusO = T >= CUT.s13 + 0.6 ? 1 : 0; void pull;
  // L25: the person (满意) dims
  const lens = pr(T, b(199) + 0.1, 1.7);
  const lensX = lerp(380, 1560, lens);
  const passed = (x: number) => (lens > 0 ? clamp((lensX - x) / 80) : 0);
  const satDim = lerp(1, 0.4, eo(T, CUT.s13 + 0.6, 0.4));
  const satO = lerp(satDim, 1, passed(ZX));
  // L26: 投入 lights, struck through, rewritten 已付出
  const lightK = eo(T, b(188), 0.4);
  const strike = eo(T, b(188) + 0.25, 0.35);
  const rewrite = pr(T, b(188) + 0.55, 0.6);
  const under = eo(T, b(188) + 1.1, 0.4);
  // L27: the slip slides out of the 回复机 and becomes a row
  const shift = eio(T, b(193) + 0.05, 0.5);
  const slip = eio(T, b(193) + 0.3, 0.7);
  const rowY = 672;
  const flickN = T > b(193) + 1.0 && T < b(193) + 1.9 ? (Math.floor((T - b(193) - 1.0) / 0.15) % 2 ? 0.35 : 1) : 1;
  const qO = slip >= 1 ? (lens > 0 ? lerp(flickN, 1, passed(460)) : flickN) : 0;
  const totY = TOT.y + 80 * shift, totRule = TOT.rule + 80 * shift, totBar = TOT.bar + 80 * shift;
  const sharp = (x: number) => (lens > 0 ? passed(x) : 0);
  return (
    <Cam s={s} cx={900} cy={560} o={1}>
      <PaperDiv />
      <Svg>
        <g opacity={inK}>
          <PageInk title="感情账本" no="Ledger · No. 4" />
          <Coin x={1380} y={148} l="A" r={18} />
          <Coin x={1428} y={148} l="B" r={18} solid={false} />
          <line x1={440} y1={330} x2={1500} y2={330} stroke={C.ink} strokeWidth={3} />
          <text x={460} y={296} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 56 }} fill={C.ink}>想留下 = 满意 + 投入 − 别的选择</text>
          <line x1={ZX} y1={372} x2={ZX} y2={totBar + 26} stroke={C.ink} strokeWidth={1.6} strokeOpacity={0.6} />
          {/* 满意 (the person) */}
          <g opacity={satO}>
            <text x={460} y={ROW.sat} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.goldD}>+ 满意</text>
            <Bar x={ZX} y={ROW.sat - 14} L={160} h={BAR_H} fill={C.gold} o={0.92} />
          </g>
          {/* 投入 → 已付出 */}
          <g>
            {lightK > 0 && <rect x={ZX - 6} y={ROW.inv - 14 - BAR_H / 2 - 6} width={512} height={BAR_H + 12} fill={C.tealHi} opacity={0.45 * lightK} filter="url(#k-glow)" />}
            <text x={460} y={ROW.inv} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.teal}>+ 投入</text>
            {strike > 0 && <line x1={500} y1={ROW.inv - 14} x2={lerp(500, 590, strike)} y2={ROW.inv - 16} stroke={C.teal} strokeWidth={3.5} strokeLinecap="round" />}
            {rewrite > 0 && <PenText x={612} y={ROW.inv} p={rewrite} size={40} weight={900} fill={C.teal} text="已付出" id="s13rw" />}
            {under > 0 && <path d={`M612,${ROW.inv + 12} Q${612 + 60},${ROW.inv + 18} ${lerp(612, 740, under)},${ROW.inv + 10}`} stroke={C.teal} strokeWidth={3} fill="none" strokeLinecap="round" />}
            <Bar x={ZX} y={ROW.inv - 14} L={500} h={BAR_H} fill={C.teal} o={lerp(0.92, 1, lightK)} />
          </g>
          {/* − 别的选择 (the "−" arrives from the ≠) */}
          <rect x={460} y={576 - 2.5} width={28} height={5} rx={2} fill={C.red} opacity={minusO} />
          <text x={500} y={ROW.alt} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.red}>别的选择</text>
          <Bar x={ZX} y={ROW.alt - 14} L={-160} h={BAR_H} fill={C.red} o={0.9} />
          {/* ? 说不准 */}
          {slip >= 1 && (
            <g opacity={qO}>
              <text x={460} y={rowY} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.ink2}>? 说不准</text>
              <Bar x={ZX} y={rowY - 14} L={260} h={BAR_H} fill={C.ink3} dashed o={1} />
            </g>
          )}
          {/* the total */}
          <line x1={440} y1={totRule} x2={1500} y2={totRule} stroke={C.ink} strokeWidth={2.4} />
          <line x1={440} y1={totRule + 6} x2={1500} y2={totRule + 6} stroke={C.ink} strokeWidth={1.2} />
          <text x={460} y={totY} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.ink}>= 想留下</text>
          <Bar x={ZX} y={totBar - 14} L={500} h={BAR_H} fill={C.ink} o={0.88} />
          <line x1={ZX} y1={totBar + 12} x2={ZX + 500} y2={totBar + 12} stroke={C.ink} strokeWidth={2.4} />
          <SmallMachine T={T} />
          <Margin11 chip="模型" lines={['Caryl Rusbult', '1980 · 1983']} o={1} />
        </g>
        {/* the slip */}
        {slip > 0 && slip < 1 && (
          <g transform={`translate(${lerp(1600, 560, slip)} ${lerp(560, rowY - 14, slip)}) rotate(${lerp(-6, 0, slip)})`}>
            <rect x={-120} y={-28} width={240} height={56} rx={3} fill="#fbf6ea" stroke={C.ink} strokeWidth={1.6} />
            <text x={-100} y={14} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.ink2}>? 说不准</text>
          </g>
        )}
        {/* the magnifier */}
        {lens > 0 && lens < 1 && (
          <g transform={`translate(${lensX} ${520 + 40 * Math.sin(lens * Math.PI)})`}>
            <circle r={96} fill="#fff8e6" opacity={0.18} />
            <circle r={96} fill="none" stroke={C.ink} strokeWidth={7} />
            <circle r={88} fill="none" stroke={C.ink} strokeWidth={1.4} strokeOpacity={0.5} />
            <path d="M-56,-44 A72,72 0 0 1 -10,-80" stroke="#fffaf0" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.8} />
            <line x1={68} y1={68} x2={150} y2={150} stroke={C.ink} strokeWidth={18} strokeLinecap="round" />
          </g>
        )}
      </Svg>
    </Cam>
  );
};

/* ---------------------------------------------------------------- S14 Juno end card */
const TITLE = '舍不得的，是TA吗？';
const Motif: React.FC<{ p: number }> = ({ p }) => {
  const k = (a: number) => clamp((p - a) / 0.4);
  return (
    <g stroke="#f1c56d" fill="none" strokeLinecap="round">
      <rect x={-210} y={-70} width={420} height={140} rx={4} strokeWidth={1.6} opacity={k(0)} />
      <line x1={-210} y1={-40} x2={210} y2={-40} strokeWidth={1.2} opacity={k(0)} />
      <line x1={-150} y1={-70} x2={-150} y2={70} strokeWidth={1} opacity={0.6 * k(0)} />
      <rect x={-130} y={-22} width={90 * k(0.2)} height={16} fill="#f1c56d" stroke="none" opacity={0.9} />
      <rect x={-130} y={10} width={250 * k(0.35)} height={16} fill="#5fc4bc" stroke="none" opacity={0.9} />
      <g opacity={k(0.6)} transform="translate(160 -6) rotate(-8)">
        <rect x={-26} y={-26} width={52} height={52} stroke="#e0705f" strokeWidth={3} />
        <rect x={-20} y={-20} width={40} height={40} stroke="#e0705f" strokeWidth={1.2} />
      </g>
    </g>
  );
};
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const f = (T - CUT.s14) * 30 + 9;
  const dur = (CUT.end - CUT.s14) * 30 + 9;
  const p = (a: number, d: number) => clamp((f - a) / d);
  const black = easeIn(clamp((f - (dur - 18)) / 18));
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="e11-key" cx="50%" cy="42%" r="40%"><stop offset="0" stopColor="#f1c56d" stopOpacity="0.22" /><stop offset="1" stopColor="#f1c56d" stopOpacity="0" /></radialGradient>
          <radialGradient id="e11-bg" cx="50%" cy="44%" r="70%"><stop offset="0" stopColor="#1b2033" /><stop offset="0.5" stopColor="#0c0f1a" /><stop offset="1" stopColor="#040509" /></radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#e11-bg)" />
        <rect width={W} height={H} fill="url(#e11-key)" />
        {Array.from({ length: 70 }, (_, i) => {
          const x0 = random(`e11x${i}`) * W, y0 = random(`e11y${i}`) * H, z = random(`e11z${i}`);
          const x = x0 + Math.sin((f + 400 + i * 13) / (60 + z * 40)) * 20, y = ((y0 - (f + 400) * (0.2 + z * 0.6)) % H + H) % H;
          return <circle key={i} cx={x} cy={y} r={0.8 + z * 2.2} fill="#ffe3a8" opacity={(0.15 + 0.45 * z) * (0.5 + 0.5 * Math.sin((f + 400) / 11 + i))} />;
        })}
        <g transform={`translate(${W / 2},240)`}><Monogram draw={clamp((f - 6) / 40)} size={1} wordmark={JUNO.name} /></g>
        <GoldTitle11 text={TITLE} f={f} at={22} size={92} y={468} id="e11t" />
        <g transform={`translate(${W / 2},574) scale(0.55)`}><Motif p={p(40, 40)} /></g>
        <text x={W / 2} y={686} textAnchor="middle" opacity={p(56, 18)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 46, letterSpacing: '0.06em' }} fill="#f3ede2">你有没有因为“都付出这么多了”，多撑了一阵？</text>
        <text x={W / 2} y={732} textAnchor="middle" opacity={p(66, 18)} style={{ fontFamily: F.sans, fontSize: 25, letterSpacing: '0.12em' }} fill="rgba(243,237,226,0.58)">@ 一个总说“再等等看”的朋友</text>
        <g opacity={p(74, 20)}>
          <rect x={W / 2 - 330} y={770} width={660} height={56} rx={28} fill="none" stroke="#e6bd66" strokeOpacity={0.6} />
          <text x={W / 2} y={806} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em' }} fill="#e6bd66">{JUNO.follow}</text>
        </g>
        <g opacity={p(84, 20)} style={{ fontFamily: F.sans, fontSize: 17, letterSpacing: '0.03em', ...LNUM }} fill="rgba(243,237,226,0.42)">
          <text x={W / 2} y={978} textAnchor="middle">{`《${TITLE}》 · ${JUNO.series}　|　资料：Arkes & Blumer, Organ. Behav. Hum. Decis. Process. 1985 · Rego, Arantes & Magalhães, Current Psychology 2018 · Rusbult, J. Exp. Soc. Psychol. 1980`}</text>
          <text x={W / 2} y={1004} textAnchor="middle">Rusbult, J. Pers. Soc. Psychol. 1983 · Whitchurch, Wilson & Gilbert, Psychological Science 2011（女性被试）· Skinner, Science and Human Behavior 1953 · Dai, Dong & Jia, J. Exp. Psychol.: General 2014 · 博弈矩阵为示意</text>
        </g>
        <rect width={W} height={H} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};

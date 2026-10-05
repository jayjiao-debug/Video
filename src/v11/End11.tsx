import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { Monogram } from '../brand/Brand';
import { JUNO } from '../brand/identity';
import { C, F, LNUM, Cam, Svg, PaperDiv, PageInk, PenText, Coin, Margin11, GoldTitle11, Hinge, pr, eo, eio, pop, lerp, clamp, W, H } from './kit11';
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
        <div style={{ position: 'absolute', inset: 0, opacity: 1 - clamp((turn - 0.5) / 0.3) }}>
          <Hinge angle={-178 * turn} axisX={120} back={<PageBack />}>
            <S13 T={T} />
          </Hinge>
        </div>
      )}
    </>
  );
};

const PageBack: React.FC = () => (
  <div style={{ position: 'absolute', left: 120, top: 92, width: 1680, height: 708, borderRadius: 3, background: 'linear-gradient(180deg,#efe6d1,#e8dec6)', boxShadow: '0 30px 60px rgba(0,0,0,.45)' }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 151px, rgba(157,182,201,.18) 151px 152px, transparent 152px 197px)', opacity: 0.6 }} />
  </div>
);
/* S13 — the account again, now as a live sum: change an entry and watch the 留 / 走 verdict underneath move.
   L28 the person (满意) shrinks — still 留. L29 take out what's 已付出 — it flips to 走. L30 add 说不准 — it flickers.
   L31 the magnifier: the sum is a range across the line; both signs stay lit (怎么选由你). Values are 示意, no numbers. */
const RY = { sat: 340, inv: 400, alt: 460, q: 520 };
const BH = 28, TH = 300, TOT_Y = 606, TOT_BAR = 594;
const ExitSign: React.FC<{ x: number; y: number; s: number; o: number; glow: number }> = ({ x, y, s, o, glow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {glow > 0.01 && <rect x={-110} y={-76} width={220} height={152} rx={30} fill="#3fd39a" opacity={0.35 * glow} filter="url(#k-glow)" />}
    <rect x={-80} y={-48} width={160} height={96} rx={8} fill="#0d3b2c" stroke="#2a9c6f" strokeWidth={4} />
    <text x={-14} y={22} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 60 }} fill="#7ff0c0">走</text>
    <path d="M30,0 H58 M46,-14 L60,0 L46,14" fill="none" stroke="#7ff0c0" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const SeatSign: React.FC<{ x: number; y: number; s: number; o: number; glow: number }> = ({ x, y, s, o, glow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {glow > 0.01 && <rect x={-100} y={-96} width={200} height={150} rx={30} fill="#f1c56d" opacity={0.45 * glow} filter="url(#k-glow)" />}
    <path d="M-44,-4 V-46 Q-44,-62 -28,-62 H28 Q44,-62 44,-46 V-4 Z" fill="#8a3238" />
    <rect x={-56} y={-8} width={112} height={30} rx={7} fill="#a33d44" />
    <rect x={-64} y={-26} width={16} height={58} rx={6} fill="#5e2428" /><rect x={48} y={-26} width={16} height={58} rx={6} fill="#5e2428" />
    <text y={-22} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 38 }} fill={C.cream}>留</text>
  </g>
);
/** "说不准": an irregular on/off flicker (preset, deterministic) */
const flickOn = (T: number, a: number) => {
  if (T < a) return 0;
  const sched = [0, 0.32, 0.5, 0.94, 1.12, 1.3, 1.71, 1.86, 2.08];
  const t = T - a;
  let k = 0;
  for (let i = 0; i < sched.length; i++) if (t >= sched[i]) k = i;
  return k % 2 === 0 ? 1 : 0;
};
const S13: React.FC<{ T: number }> = ({ T }) => {
  const inK = eo(T, CUT.s13 + 0.09, 0.3);
  const push = eio(T, b(193), 0.8);
  const s = lerp(1, 1.04, push);
  const minusO = T >= CUT.s13 + 0.6 ? 1 : 0;
  // values (px of bar)
  const sat = lerp(160, 40, eio(T, CUT.s13 + 0.7, 0.9));
  const satDim = lerp(1, 0.55, eo(T, CUT.s13 + 0.7, 0.6));
  const strike = eo(T, b(188) + 0.15, 0.3);
  const rewrite = pr(T, b(188) + 0.4, 0.5);
  const lift = eio(T, b(190), 0.6);                  // 已付出 taken out of the sum
  const inv = 500 * (1 - lift);
  const alt = -160;
  const slip = eio(T, b(193) + 0.1, 0.6);
  const qIn = T >= b(193) + 0.7;
  const L31 = b(199);
  const qOn = qIn && T < L31 ? flickOn(T, b(193) + 0.7) : 0;
  const Q = 460;
  const qVal = Q * qOn;
  const total = sat + inv + alt + qVal;
  const range = T >= L31; // the end: the sum is a range across the line
  const rangeK = eo(T, L31, 0.5);
  const totLo = sat + inv + alt, totHi = totLo + Q;
  // the verdict underneath
  const stay = total >= TH;
  const vO = eo(T, CUT.s13 + 0.3, 0.4);
  const both = range ? rangeK : 0;
  const seatGlow = range ? 0.6 : stay ? 1 : 0, exitGlow = range ? 0.6 : stay ? 0 : 1;
  const seatO = range ? lerp(stay ? 1 : 0.32, 0.9, both) : stay ? 1 : 0.32;
  const exitO = range ? lerp(stay ? 0.32 : 1, 0.9, both) : stay ? 0.32 : 1;
  // magnifier
  const lens = pr(T, L31 + 0.6, 1.6);
  const lensX = lerp(380, 1560, lens);
  const totBarX = Math.min(ZX, ZX + total), totBarW = Math.abs(total);
  return (
    <Cam s={s} cx={1000} cy={430} o={1}>
      <PaperDiv />
      <Svg>
        <g opacity={inK}>
          <PageInk title="感情账本" no="Ledger · No. 4" />
          <Coin x={1380} y={148} l="A" r={18} />
          <Coin x={1428} y={148} l="B" r={18} solid={false} />
          <text x={460} y={262} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 44 }} fill={C.ink}>想留下 = 满意 + 投入 − 别的选择</text>
          <line x1={440} y1={284} x2={1500} y2={284} stroke={C.ink} strokeWidth={2.4} />
          <line x1={ZX} y1={312} x2={ZX} y2={TOT_BAR + 24} stroke={C.ink} strokeWidth={1.6} strokeOpacity={0.6} />
          {/* the line you have to clear to stay */}
          <line x1={ZX + TH} y1={306} x2={ZX + TH} y2={TOT_BAR + 30} stroke={C.goldD} strokeWidth={2.4} strokeDasharray="8 7" />
          <text x={ZX + TH} y={300} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 28 }} fill={C.goldD}>留下线</text>
          {/* 满意 */}
          <g opacity={satDim}>
            <text x={460} y={RY.sat} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.goldD}>+ 满意</text>
            <Bar x={ZX} y={RY.sat - 12} L={sat} h={BH} fill={C.gold} o={0.92} />
          </g>
          {/* 投入 → 已付出 → taken out */}
          <text x={460} y={RY.inv} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.teal}>+ 投入</text>
          {strike > 0 && <line x1={496} y1={RY.inv - 12} x2={lerp(496, 572, strike)} y2={RY.inv - 14} stroke={C.teal} strokeWidth={3.5} strokeLinecap="round" />}
          {rewrite > 0 && <PenText x={590} y={RY.inv} p={rewrite} size={36} weight={900} fill={C.teal} text="已付出" id="s13rw" />}
          {lift > 0 && <Bar x={ZX} y={RY.inv - 12} L={500} h={BH} fill={C.teal} dashed o={lift} />}
          <g transform={`translate(0 ${-26 * lift})`}><Bar x={ZX} y={RY.inv - 12} L={inv} h={BH} fill={C.teal} o={0.92 * (1 - lift * 0.6)} /></g>
          {lift > 0.5 && <text x={ZX + 520} y={RY.inv} opacity={clamp(lift * 2 - 1)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 30 }} fill={C.red}>不算它</text>}
          {/* − 别的选择 (the "−" arrives from the ≠) */}
          <rect x={460} y={448 - 2.25} width={24} height={4.5} rx={2} fill={C.red} opacity={minusO} />
          <text x={496} y={RY.alt} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.red}>别的选择</text>
          <Bar x={ZX} y={RY.alt - 12} L={alt} h={BH} fill={C.red} o={0.9} />
          {/* ? 说不准 */}
          {qIn && (
            <g>
              <text x={460} y={RY.q} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.ink2}>+ 说不准</text>
              <Bar x={ZX} y={RY.q - 12} L={Q} h={BH} fill={C.ink3} dashed o={range ? 1 : 0.6} />
              {!range && <Bar x={ZX} y={RY.q - 12} L={qVal} h={BH} fill={C.goldHi} o={0.9} />}
            </g>
          )}
          {/* the total */}
          <line x1={440} y1={552} x2={1500} y2={552} stroke={C.ink} strokeWidth={2.4} />
          <line x1={440} y1={558} x2={1500} y2={558} stroke={C.ink} strokeWidth={1.2} />
          <text x={460} y={TOT_Y} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.ink}>= 想留下</text>
          {!range ? (
            <rect x={totBarX} y={TOT_BAR - 12 - BH / 2} width={totBarW} height={BH} fill={total >= TH ? C.ink : '#6d665c'} opacity={0.9} />
          ) : (
            <g>
              <rect x={Math.min(ZX, ZX + totLo)} y={TOT_BAR - 12 - BH / 2} width={Math.abs(totLo)} height={BH} fill="#6d665c" opacity={0.9 * (1 - 0.4 * rangeK)} />
              <rect x={ZX + totLo} y={TOT_BAR - 12 - BH / 2} width={(totHi - totLo) * rangeK} height={BH} fill="url(#k-hatchFine)" stroke={C.ink} strokeWidth={2} strokeDasharray="7 6" />
            </g>
          )}
          {/* the verdict underneath: 走 / 留 (the hook's signs) */}
          <g opacity={vO}>
            <ExitSign x={800} y={712} s={0.8} o={exitO} glow={exitGlow} />
            <SeatSign x={1200} y={722} s={0.95} o={seatO} glow={seatGlow} />
            {range ? (
              <text x={1000} y={730} textAnchor="middle" opacity={rangeK} style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 64 }} fill={C.ink2}>?</text>
            ) : (
              <path d={stay ? 'M940,712 L1080,712 M1062,698 L1080,712 L1062,726' : 'M1060,712 L920,712 M938,698 L920,712 L938,726'} fill="none" stroke={C.ink2} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>
          <SmallMachine T={T} />
          <Margin11 chip="示意" lines={['Rusbult 投资模型', '数值为示意']} o={1} />
        </g>
        {/* the slip out of the 回复机 */}
        {slip > 0 && slip < 1 && (
          <g transform={`translate(${lerp(1600, 560, slip)} ${lerp(560, RY.q - 12, slip)}) rotate(${lerp(-6, 0, slip)})`}>
            <rect x={-120} y={-26} width={240} height={52} rx={3} fill="#fbf6ea" stroke={C.ink} strokeWidth={1.6} />
            <text x={-100} y={13} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 34 }} fill={C.ink2}>+ 说不准</text>
          </g>
        )}
        {lens > 0 && lens < 1 && (
          <g transform={`translate(${lensX} ${440 + 40 * Math.sin(lens * Math.PI)})`}>
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

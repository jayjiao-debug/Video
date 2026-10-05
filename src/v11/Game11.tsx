import React from 'react';
import { C, F, LNUM, Cam, Svg, PaperDiv, PageInk, Coin, Heart, Margin11, pr, eo, eio, pop, spring, swing, lerp, clamp, easeInOut, easeOut, rnd } from './kit11';
import { CUT } from './time11';
import { S09_COINS, STAMP } from './Sheet11';
import { b } from '../v6/ui6';

/* S10 the 博弈 board · S11 说不准 (the profile experiment) */

const BX = 660, BY = 300, CW = 440, CH = 200;
const cx = [BX, BX + CW], cy = [BY, BY + CH];
const LIT = { x: cx[1] + CW / 2, y: cy[0] + CH / 2 };
export const Q_START = { x: 1710, y: 700 }; // where the 说不准 "?" sits at the end of the timeline (S11 → S12 hand-off)

const Clock: React.FC<{ x: number; y: number; a: number; o: number }> = ({ x, y, a, o }) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <circle r={22} fill="none" stroke={C.ink2} strokeWidth={2.2} />
    <line x1={0} y1={0} x2={15 * Math.sin(a)} y2={-15 * Math.cos(a)} stroke={C.ink2} strokeWidth={2.4} strokeLinecap="round" />
    <line x1={0} y1={0} x2={11} y2={6} stroke={C.ink2} strokeWidth={2.4} strokeLinecap="round" />
  </g>
);

export const S10S11: React.FC<{ T: number }> = ({ T }) => {
  if (T < CUT.s10 - 0.02 || T > CUT.drop2 - 0.3) return null;
  const dive = eio(T, CUT.dive, 0.9);
  const inS11 = T >= CUT.dive + 0.75;
  return (
    <>
      {T > CUT.s10 + 0.6 && T < CUT.dive + 0.95 && (
        <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(92px 120px 280px 120px)' }}>
        <Cam s={lerp(1, 3.95, dive)} cx={LIT.x} cy={LIT.y} x={(960 - LIT.x) * dive} y={(446 - LIT.y) * dive}>
          <PaperDiv />
        </Cam>
        </div>
      )}
      {T < CUT.dive + 0.95 && (
        <div style={{ position: 'absolute', inset: 0, clipPath: 'inset(92px 120px 280px 120px)' }}>
        <Cam s={lerp(1, 3.95, dive)} cx={LIT.x} cy={LIT.y} x={(960 - LIT.x) * dive} y={(446 - LIT.y) * dive}>
          <Svg><BoardInk T={T} /></Svg>
        </Cam>
        </div>
      )}
      {inS11 && <S11 T={T} />}
      {T >= CUT.dive && T < b(129) && <QFloat T={T} />}
    </>
  );
};

/** the "?" coin carried out of the dive; it waits where the cards will be dealt from */
const QFloat: React.FC<{ T: number }> = ({ T }) => {
  const k = eio(T, CUT.dive, 0.9);
  const x = lerp(cx[1] + CW - 48, 1535, k), y = lerp(cy[0] + 44, 330, k);
  const s = lerp(1.05, 1.4, k) * (1 + 0.04 * Math.sin(T * 5));
  const o = 1 - eo(T, b(127), 0.35);
  return <Svg><Heart x={x} y={y} kind="q" s={s} o={o} /></Svg>;
};

const BoardInk: React.FC<{ T: number }> = ({ T }) => {
  const grow = eio(T, CUT.s10, 0.6);
  // the hovering square (S09) grows into the board
  const sw = STAMP.w * 1.142, sh = STAMP.h * 1.142;
  const fx = lerp(STAMP.x, BX + CW, grow), fy = lerp(STAMP.y - 14, BY + CH, grow), fw = lerp(sw, 2 * CW, grow), fh = lerp(sh, 2 * CH, grow), fr = lerp(-7, 0, grow);
  const rules = eo(T, CUT.s10 + 0.45, 0.4);
  const coinK = eio(T, CUT.s10 + 0.1, 0.6);
  const A = [lerp(S09_COINS.A[0], BX - 232, coinK), lerp(S09_COINS.A[1], BY + CH - 30, coinK)];
  const B = [lerp(S09_COINS.B[0], BX + CW - 58, coinK), lerp(S09_COINS.B[1], 234, coinK)];
  const labels = eo(T, CUT.s10 + 0.7, 0.5);
  const g2 = b(115);
  const shieldO = eo(T, g2, 0.3);
  const pulse = T > g2 && T < g2 + 1.6 ? 0.5 + 0.5 * Math.sin((T - g2) * 9) : 0;
  const safeO = eo(T, g2 + 0.1, 0.3) * (1 - eo(T, g2 + 1.1, 0.4));
  const waitK = eo(T, b(117), 0.35);
  const clockA = eio(T, b(117) + 0.1, 0.8) * Math.PI * 2;
  const bothK = eo(T, b(118.5), 0.35);
  const bothPop = pop(T, b(118.5) + 0.1, 0.35);
  const litK = eo(T, b(121), 0.4);
  const dim = 1 - 0.45 * eio(T, b(121), 0.4);
  const mirrorK = eo(T, b(123), 0.4);
  const flick = 0.45 + 0.15 * Math.sin(T * 7.3) + 0.08 * Math.sin(T * 17);
  const lp = 0.55 + 0.12 * Math.sin((T - b(121)) * 3.2);
  const headerO = Math.max(0, 1 - eo(T, CUT.s10 - 0.1, 0.4)) ; // unused (sheet header fades in Sheet11)
  void headerO;
  const cellLabel = (c: number, r: number, label: string, o: number, size = 44, col: string = C.ink, kicker?: string) => (
    <g opacity={o}>
      {kicker && <text x={cx[c] + CW / 2} y={cy[r] + CH / 2 - 30} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 28 }} fill={C.ink2}>{kicker}</text>}
      <text x={cx[c] + CW / 2} y={cy[r] + CH / 2 + (kicker ? 26 : 16)} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: size, letterSpacing: 2 }} fill={col}>{label}</text>
    </g>
  );
  return (
    <g>
      <PageInk title="博弈" sub="· 还没在一起" no="Ledger · No. 5" titleP={eo(T, CUT.s10 + 0.2, 0.4)} subP={eo(T, CUT.s10 + 0.4, 0.4)} o={eo(T, CUT.s10, 0.3)} />
      {/* ---- dimmable layer ---- */}
      <g opacity={dim}>
        {/* fills */}
        <rect x={cx[0]} y={cy[0]} width={CW} height={CH} fill={C.goldWash} fillOpacity={0.55 * bothK} />
        <rect x={cx[1]} y={cy[1]} width={CW} height={CH} fill={C.grey2} fillOpacity={0.65 * waitK} />
        <rect x={cx[0]} y={cy[1]} width={CW} height={CH} fill="#efe2c4" fillOpacity={0.6 * mirrorK} />
        {/* headers */}
        <g opacity={labels}>
          <text x={B[0] + 36} y={246} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.ink} opacity={coinK}>TA</text>
          <text x={cx[0] + CW / 2} y={BY - 20} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 36 }} fill={C.ink4}>主动</text>
          <text x={cx[1] + CW / 2 - 16} y={BY - 20} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 36 }} fill={C.ink4}>等</text>
          <text x={BX - 232} y={BY + CH + 40} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.ink} opacity={coinK}>你</text>
          <text x={BX - 28} y={cy[0] + CH / 2 + 13} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 36 }} fill={C.ink4}>主动</text>
          <text x={BX - 70} y={cy[1] + CH / 2 + 13} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 36 }} fill={C.ink4}>等</text>
        </g>
        {/* shields: "looks safe" */}
        <g opacity={shieldO}>
          {[[cx[1] + CW / 2 + 10, BY - 56], [BX - 60, cy[1] + CH / 2 + 13 - 30]].map(([x, y], i) => (
            <g key={i}>
              {pulse > 0 && <circle cx={x + 15} cy={y + 18} r={26 + 8 * pulse} fill={C.tealHi} opacity={0.25 * pulse} />}
              <use href="#k-shield" x={x} y={y} width={30} height={36} />
            </g>
          ))}
          <text x={cx[1] + CW / 2 + 25} y={BY - 64} textAnchor="middle" opacity={safeO} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26 }} fill={C.teal}>看着安全</text>
        </g>
        {/* 都在等 → 错过 */}
        {waitK > 0 && (
          <g>
            {cellLabel(1, 1, '错过', waitK, 44, C.ink2, '都在等 →')}
            <Heart x={cx[1] + 48} y={cy[1] + CH - 44} kind="empty" s={1.05} o={waitK} />
            <Heart x={cx[1] + CW - 48} y={cy[1] + 44} kind="empty" s={1.05} o={waitK} />
            <Clock x={cx[1] + CW / 2 + 110} y={cy[1] + CH / 2 + 2} a={clockA} o={0.55 * waitK} />
          </g>
        )}
        {/* 双向奔赴 */}
        {bothK > 0 && (
          <g>
            {cellLabel(0, 0, '双向奔赴', bothK)}
            <Heart x={cx[0] + 48} y={cy[0] + CH - 44} kind="full" s={1.05 * bothPop} />
            <Heart x={cx[0] + CW - 48} y={cy[0] + 44} kind="full" s={1.05 * bothPop} />
            <text x={cx[0] + 80} y={cy[0] + CH - 34} opacity={bothK} style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 24 }} fill={C.ink2}>你</text>
            <text x={cx[0] + CW - 80} y={cy[0] + 54} textAnchor="end" opacity={bothK} style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 24 }} fill={C.ink2}>TA</text>
          </g>
        )}
        {mirrorK > 0 && (
          <g>
            {cellLabel(0, 1, 'TA爱而不得', mirrorK, 38, C.ink2)}
            <Heart x={cx[0] + 48} y={cy[1] + CH - 44} kind="q" s={1.05} o={mirrorK} />
            <Heart x={cx[0] + CW - 48} y={cy[1] + 44} kind="half" s={1.05} o={mirrorK} />
          </g>
        )}
      </g>
      {/* ---- full-strength layer: the lit cell, the frame, the coins ---- */}
      {litK > 0 && (
        <g>
          <rect x={cx[1] - 6} y={cy[0] - 6} width={CW + 12} height={CH + 12} fill={C.goldHi} opacity={lp * litK} filter="url(#k-glow)" />
          <rect x={cx[1]} y={cy[0]} width={CW} height={CH} fill="url(#k-cellLamp)" opacity={litK} />
          <rect x={cx[1] + 3} y={cy[0] + 3} width={CW - 6} height={CH - 6} fill="none" stroke={C.gold} strokeWidth={3} opacity={litK} />
          {cellLabel(1, 0, '爱而不得', litK, 56)}
          <Heart x={cx[1] + 48} y={cy[0] + CH - 44} kind="flick" fill={flick} s={1.05} o={litK} />
          {T < CUT.dive && <Heart x={cx[1] + CW - 48} y={cy[0] + 44} kind="q" s={1.05} o={litK} />}
        </g>
      )}
      <g opacity={rules * 0.6 + 0.4 * rules * (1 - (1 - dim) / 0.45 * 0.4)}>
        <line x1={BX + CW} y1={BY} x2={BX + CW} y2={BY + 2 * CH * rules} stroke={C.ink} strokeWidth={1.6} strokeOpacity={0.6} />
        <line x1={BX} y1={BY + CH} x2={BX + 2 * CW * rules} y2={BY + CH} stroke={C.ink} strokeWidth={1.6} strokeOpacity={0.6} />
      </g>
      <g transform={`translate(${fx} ${fy}) rotate(${fr})`}>
        <rect x={-fw / 2} y={-fh / 2} width={fw} height={fh} fill="none" stroke={C.red} strokeWidth={4} />
        <rect x={-fw / 2 - 9} y={-fh / 2 - 9} width={fw + 18} height={fh + 18} fill="none" stroke={C.red} strokeWidth={1.5} />
      </g>
      <Coin x={A[0]} y={A[1]} l="A" r={lerp(25, 24, coinK)} />
      <Coin x={B[0]} y={B[1]} l="B" solid={false} r={lerp(25, 24, coinK)} />
      <Margin11 chip="示意" lines={['博弈矩阵', '无数据']} o={eo(T, CUT.s10 + 0.8, 0.4)} />
    </g>
  );
};

/* ---------------------------------------------------------------- S11 */
const CARD_X = [680, 940, 1200, 1460], CARD_Y = 380, PW = 200, PH = 270;
const COL = [600, 1070, 1540];
const ZERO = 680;
const BARS = [70, -40, 200];
const TAGS: [string, 'full' | 'half' | 'q'][] = [['很喜欢你', 'full'], ['一般', 'half'], ['说不准', 'q']];

const Profile: React.FC<{ seed: number }> = ({ seed }) => (
  <g>
    <rect x={-PW / 2 + 4} y={-PH / 2 + 8} width={PW} height={PH} rx={10} fill="#000" opacity={0.1} />
    <rect x={-PW / 2} y={-PH / 2} width={PW} height={PH} rx={10} fill="#fbf6ea" stroke={C.ink} strokeWidth={2.2} />
    <rect x={-PW / 2 + 14} y={-PH / 2 + 14} width={PW - 28} height={150} rx={6} fill="#d8d1c3" />
    <circle cx={0} cy={-PH / 2 + 74} r={28} fill="#bfb7a8" />
    <path d={`M-46,${-PH / 2 + 164} Q-46,${-PH / 2 + 112} 0,${-PH / 2 + 112} Q46,${-PH / 2 + 112} 46,${-PH / 2 + 164} Z`} fill="#bfb7a8" />
    <rect x={-PW / 2 + 18} y={PH / 2 - 86} width={110 + 30 * rnd(seed)} height={14} rx={7} fill={C.ink} opacity={0.55} />
    <rect x={-PW / 2 + 18} y={PH / 2 - 56} width={140 - 30 * rnd(seed, 2)} height={10} rx={5} fill={C.ink} opacity={0.25} />
    <rect x={-PW / 2 + 18} y={PH / 2 - 36} width={90 + 40 * rnd(seed, 3)} height={10} rx={5} fill={C.ink} opacity={0.25} />
  </g>
);
const Bubble: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-50} y={-20} width={100} height={40} rx={20} fill="#fbf6ea" stroke={C.ink} strokeWidth={2} />
      <circle cx={-34} cy={28} r={6} fill="#fbf6ea" stroke={C.ink} strokeWidth={1.8} />
      <text y={8} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22 }} fill={C.ink4}>想起TA</text>
    </g>
  );

const S11: React.FC<{ T: number }> = ({ T }) => {
  const wash = 1 - eo(T, CUT.dive + 0.85, 1.4);
  const deal = (i: number) => eo(T, b(127) - 0.15 + i * 0.12, 0.45);
  const regroup = eio(T, b(133), 0.6);
  const tagK = (i: number) => eo(T, b(133) + 0.35 + i * 0.12, 0.3);
  const barK = [eo(T, b(138.5) + 0.05, 0.5), eo(T, b(138.5) + 0.3, 0.5), eio(T, b(138.5) + 0.6, 1.1)];
  // camera: start on 很喜欢你, pan right to 说不准, then settle
  const pan = eio(T, b(138.5), 0.8), settle = eio(T, b(144) - 0.1, 0.6);
  const camX = lerp(lerp((960 - COL[0]) * 0.45, (960 - COL[2]) * 0.45, pan), 0, settle);
  const camS = lerp(1 + 0.12 * eo(T, b(138.5) - 0.2, 0.4), 1, settle);
  const glow = eo(T, b(144), 0.4);
  const bubbles = (n: number, x: number, at: number) => Array.from({ length: n }, (_, k) => <Bubble key={k} x={x + (k % 2) * 108} y={ZERO - 34 - Math.floor(k / 2) * 50} s={pop(T, at + k * 0.11, 0.25)} />);
  // L23: the chart slides left onto the timeline
  const slide = eio(T, b(150), 0.8);
  const tl = eo(T, b(150) + 0.4, 0.8);
  const qTip = T >= b(155) ? 1 : 0;
  const dimEnd = eio(T, CUT.silent, 0.4) * 0.4;
  const fadeOut = 1 - eo(T, b(158), 0.22);
  const chartT = `translate(${lerp(0, -40, slide)} ${lerp(0, -70, slide)}) translate(400 700) scale(${lerp(1, 0.5, slide)}) translate(-400 -700)`;
  return (
    <Cam s={camS} x={camX} o={fadeOut}>
      <PaperDiv tint={`linear-gradient(180deg, #f6d48a, #efc777)`} tintO={wash * 0.95} />
      <Svg>
        <PageInk title="心动实验" sub="· 刚认识的人" no="Ledger · No. 6" titleP={eo(T, CUT.dive + 1.0, 0.5)} subP={eo(T, CUT.dive + 1.2, 0.4)} />
        <g transform={chartT}>
          {/* cards: dealt in a row, then regrouped into three columns (one small stack per condition) */}
          {CARD_X.map((x, i) => {
            const d = deal(i);
            if (d <= 0) return null;
            return COL.map((cxx, j) => {
              if (regroup <= 0 && j > 0) return null;
              const tx = lerp(x, cxx - 30 + i * 20, regroup), ty = lerp(CARD_Y, 300 + i * 6, regroup);
              const s = lerp(1, 0.46, regroup) * lerp(0.3, 1, d);
              const rot = lerp(lerp(-20, 0, d), -9 + i * 6, regroup);
              const x0 = lerp(1070, tx, d), y0 = lerp(380, ty, d);
              return (
                <g key={`${i}-${j}`} transform={`translate(${x0} ${y0}) rotate(${rot}) scale(${s})`} opacity={j === 0 ? 1 : regroup}>
                  <Profile seed={i} />
                </g>
              );
            });
          })}
          {TAGS.map(([t, k], i) => {
            const o = tagK(i);
            if (o <= 0) return null;
            const ang = swing(T, b(133) + 0.4 + i * 0.12, 9, 1.2, 2.6);
            const w = [...t].length * 34 + 84;
            return (
              <g key={i} transform={`translate(${COL[i]} 400) rotate(${ang})`} opacity={o}>
                <line x1={0} y1={0} x2={0} y2={22} stroke={C.ink2} strokeWidth={1.6} />
                <rect x={-w / 2} y={22} width={w} height={56} rx={6} fill="#f8f1e0" stroke={i === 2 ? C.gold : C.ink} strokeWidth={2.4} />
                <Heart x={-w / 2 + 34} y={50} kind={k} s={0.8} />
                <text x={-w / 2 + 62} y={62} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 34 }} fill={i === 2 ? C.goldD : C.ink}>{t}</text>
              </g>
            );
          })}
          {/* chart */}
          <g opacity={eo(T, b(138.5) - 0.1, 0.3)}>
            <line x1={470} y1={ZERO} x2={1680} y2={ZERO} stroke={C.ink} strokeWidth={2} />
            <text x={356} y={ZERO - 70} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 34 }} fill={C.ink}>心动</text>
            <text x={356} y={ZERO - 30} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 34 }} fill={C.ink}>程度</text>
            <text x={452} y={ZERO + 8} textAnchor="end" style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 30 }} fill={C.ink2}>0</text>
          </g>
          {BARS.map((h, i) => {
            const k = barK[i];
            if (k <= 0) return null;
            const hh = h * k;
            const y = hh > 0 ? ZERO - hh : ZERO;
            return (
              <g key={i}>
                {i === 2 && glow > 0 && <rect x={COL[i] - 72} y={y - 12} width={144} height={Math.abs(hh) + 12} fill={C.goldHi} opacity={0.55 * glow} filter="url(#k-glow)" />}
                <rect x={COL[i] - 60} y={y} width={120} height={Math.abs(hh)} fill={h > 0 ? (i === 2 ? C.gold : '#d2a957') : '#a8a196'} />
                <rect x={COL[i] - 60} y={y} width={120} height={Math.abs(hh)} fill="url(#k-hatchFine)" opacity={0.12} />
              </g>
            );
          })}
          {T > b(144) && bubbles(7, COL[2] + 128, b(144) + 0.3)}
          {T > b(144) && bubbles(4, COL[0] + 128, b(144) + 0.5)}
        </g>
        {/* timeline */}
        {tl > 0 && (
          <g opacity={tl}>
            <rect x={400} y={Q_START.y - 16} width={500 * tl} height={32} rx={16} fill={C.goldHi} opacity={0.35} filter="url(#k-glow)" />
            <line x1={400} y1={Q_START.y} x2={lerp(400, 900, tl)} y2={Q_START.y} stroke={C.gold} strokeWidth={8} strokeLinecap="round" />
            <line x1={900} y1={Q_START.y} x2={lerp(900, 1660, clamp(tl * 1.4 - 0.4))} y2={Q_START.y} stroke={C.ink3} strokeWidth={4} strokeDasharray="12 12" />
            {[[650, '刚认识', C.goldD], [1090, '约会', C.ink3], [1470, '在一起', C.ink3]].map(([x, l, col], i) => (
              <text key={i} x={x as number} y={Q_START.y + 56} textAnchor="middle" opacity={clamp(tl * 2 - i * 0.4)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 34 }} fill={col as string}>{l as string}</text>
            ))}
            {[900, 1280].map((x) => <circle key={x} cx={x} cy={Q_START.y} r={7} fill="#f3ebd8" stroke={C.ink3} strokeWidth={2.4} />)}
            {!qTip && <Heart x={Q_START.x} y={Q_START.y} kind="q" s={1.1} o={clamp(tl * 1.6 - 0.6)} />}
          </g>
        )}
        <Margin11 chip="一项小实验" lines={['47人 · 2011', '刚认识时']} o={eo(T, b(127), 0.4)} />
      </Svg>
      {dimEnd > 0 && <div style={{ position: 'absolute', left: 120, top: 92, width: 1680, height: 708, background: '#0b101d', opacity: dimEnd }} />}
    </Cam>
  );
};

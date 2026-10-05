import React from 'react';
import { ExitPict } from './kit11';
import { Zoom, PZ } from './kit11';
import { C, F, LNUM, Cam, Svg, PaperDiv, PageInk, Coin, Margin11, pr, eo, eio, pop, spring, swing, lerp, clamp, drawOn } from './kit11';
import { CUT } from './time11';
import { b } from '../v6/ui6';

/* S05 sunk cost (the waterline) · S06 the same in love (two cards, the 留 bars) */

const WL = 470; // final waterline
const ripple = (x: number, T: number, a = 4) => a * Math.sin(x / 58 + T * 2.6) + 1.5 * Math.sin(x / 23 - T * 3.4);

const Banknote: React.FC = () => (
  <g fill="none" stroke={C.ink} strokeWidth={3}>
    <rect x={-34} y={-20} width={68} height={40} rx={4} />
    <circle r={10} /><line x1={-26} y1={-12} x2={-18} y2={-12} /><line x1={18} y1={12} x2={26} y2={12} />
  </g>
);
const HeartOutline: React.FC = () => <use href="#k-heart" x={-22} y={-24} width={44} height={44} fill="none" stroke={C.ink} strokeWidth={3} />;
const ClockIcon: React.FC = () => (
  <g fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round"><circle r={21} /><line x1={0} y1={0} x2={0} y2={-13} /><line x1={0} y1={0} x2={10} y2={5} /></g>
);

/** the engraved balance: post, beam (tilt), strings, pans with labels */
const Scale: React.FC<{ p: number; tilt: number; panL: number; panR: number; beam?: { x0: number; x1: number; y: number; h: number }; restO: number }> = ({ p, tilt, panL, panR, beam, restO }) => {
  const cx = 1150, by = 262, half = 300;
  const r = (tilt * Math.PI) / 180;
  const lx = cx - half * Math.cos(r), ly = by - half * Math.sin(r), rx = cx + half * Math.cos(r), ry = by + half * Math.sin(r);
  const pans: [number, number, number, string, string][] = [[lx, ly, panL, '以后的快乐', C.goldD], [rx, ry, panR, '以后的代价', C.red]];
  return (
    <g>
      <g opacity={restO}>
        <path d={`M${cx},${WL - 4} L${cx},${by + 8}`} stroke={C.ink} strokeWidth={6} strokeLinecap="round" fill="none" {...drawOn(p * 1.4)} />
        <path d={`M${cx - 70},${WL - 2} L${cx},${WL - 40} L${cx + 70},${WL - 2} Z`} fill="none" stroke={C.ink} strokeWidth={3} {...drawOn(p * 1.2)} />
        <path d={`M${cx - 70},${WL - 2} L${cx},${WL - 40} L${cx + 70},${WL - 2} Z`} fill="url(#k-hatch)" opacity={0.6 * clamp(p * 2 - 1)} />
        <circle cx={cx} cy={by} r={11} fill="#efe6d1" stroke={C.ink} strokeWidth={3} opacity={clamp(p * 3)} />
        {pans.map(([x, y, k, lab, col], i) => (
          <g key={i} opacity={clamp((p - 0.5) * 3)}>
            <line x1={x} y1={y} x2={x - 70} y2={y + 92} stroke={C.ink} strokeWidth={1.8} />
            <line x1={x} y1={y} x2={x + 70} y2={y + 92} stroke={C.ink} strokeWidth={1.8} />
            <path d={`M${x - 92},${y + 92} Q${x},${y + 142} ${x + 92},${y + 92} Z`} fill="#efe6d1" stroke={C.ink} strokeWidth={3} />
            <path d={`M${x - 92},${y + 92} Q${x},${y + 142} ${x + 92},${y + 92} Z`} fill="url(#k-hatchFine)" opacity={0.3} />
            <text x={x} y={y + 80} textAnchor="middle" opacity={k} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={col}>{lab}</text>
          </g>
        ))}
      </g>
      {beam ? (
        <rect x={beam.x0} y={beam.y - beam.h / 2} width={beam.x1 - beam.x0} height={beam.h} rx={beam.h / 2} fill={C.ink} />
      ) : (
        <path d={`M${lx},${ly} L${rx},${ry}`} stroke={C.ink} strokeWidth={7} strokeLinecap="round" fill="none" {...drawOn(clamp(p * 1.6 - 0.3))} />
      )}
    </g>
  );
};

export const S05S06: React.FC<{ T: number }> = ({ T }) => {
  if (T < CUT.s5 - 0.02 || T > CUT.s7 + 1.0) return null;
  const inS6 = T >= CUT.s6;
  // camera: continue the book's push-back (0.82·1.03 → 1), then a small lift on L7
  const back = eio(T, CUT.s5, 0.42);
  const lift = eio(T, b(54), 0.8) * (1 - eio(T, CUT.s6 - 0.1, 0.5));
  const s = lerp(0.82 * 1.03, 1, back);
  const cy = lerp(470, 540, back);
  return (
    <Zoom s={lerp(1, PZ.s, back)}>
    <Cam s={s} cy={cy} y={0 * lift}>
      <PaperDiv />
      <Svg>
        {T < CUT.s6 + 0.5 && <S05Ink T={T} />}
        {inS6 && <S06Ink T={T} />}
      </Svg>
    </Cam>
    </Zoom>
  );
};

const S05Ink: React.FC<{ T: number }> = ({ T }) => {
  const out = eo(T, CUT.s6, 0.25);
  const keep = 1 - out;
  const rise = eio(T, CUT.s5 + 0.2, 1.3);
  const wl = lerp(800, WL, rise);
  const entries: { y: number; el: React.ReactNode }[] = [
    { y: 560, el: <><text x={460} y={560} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.ink}>电影票</text><text x={590} y={560} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 40 }} fill={C.ink2}>· 已付款</text></> },
    { y: 630, el: <><text x={460} y={630} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.ink}>项目</text><text x={548} y={630} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 40, ...LNUM }} fill={C.ink2}>· 1000万美元</text></> },
    { y: 712, el: <>
      <g transform="translate(500 700)"><Banknote /></g><text x={548} y={714} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 36 }} fill={C.ink}>钱</text>
      <g transform="translate(680 700)"><HeartOutline /></g><text x={716} y={714} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 36 }} fill={C.ink}>心力</text>
      <g transform="translate(880 700)"><ClockIcon /></g><text x={914} y={714} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 36 }} fill={C.ink}>时间</text>
    </> },
  ];
  const label = eo(T, b(51), 0.6);
  const sp = pr(T, b(54) + 0.1, 0.8);
  const tilt = 9 * (1 - spring(T, b(56), 1.1, 2.6));
  const panL = eo(T, b(55), 0.4), panR = eo(T, b(56) - 0.15, 0.4);
  const brk = eo(T, b(57), 0.5);
  // match shape: the beam drops and stretches into the card's top edge
  const m = eio(T, CUT.s6, 0.42);
  const beam = T >= CUT.s6 ? { x0: lerp(850, 790, m), x1: lerp(1450, 1350, m), y: lerp(262, 230, m), h: lerp(7, 5, m) } : undefined;
  const pts: string[] = [];
  for (let x = 120; x <= 1800; x += 24) pts.push(`${x},${(wl + ripple(x, T)).toFixed(1)}`);
  return (
    <g>
      {T < CUT.s6 && <PageInk title="账本" sub="· 花掉的，要不回" no="Ledger · No. 2" />}
      {T >= CUT.s6 && <g opacity={keep}><PageInk title="账本" sub="· 花掉的，要不回" no="Ledger · No. 2" /></g>}
      <g opacity={keep}>
        {entries.map((e, i) => {
          // when the water passes this entry, it sinks: drifts 20 px, greys, blurs
          const tCross = CUT.s5 + 0.2 + 1.3 * clamp((800 - e.y + 30) / 330);
          const k = eo(T, tCross, 0.7);
          return (
            <g key={i} transform={`translate(0 ${20 * k})`} opacity={1 - 0.45 * k} filter={k > 0.4 ? 'url(#k-blur2)' : undefined} style={{ filter: k > 0.05 ? `grayscale(${k}) blur(${(1.6 * k).toFixed(2)}px)` : undefined }}>{e.el}</g>
          );
        })}
        <path d={`M${pts.join(' L')} L1800,800 L120,800 Z`} fill="#4f7aa0" opacity={0.13} />
        <path d={`M${pts.join(' L')}`} fill="none" stroke="#4f7aa0" strokeWidth={4} />
        {label > 0 && (
          <g transform={`translate(1640 ${wl - 18 + (1 - label) * 50 + 3 * Math.sin(T * 2.2)})`} opacity={label}>
            <text textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 52, letterSpacing: 4 }} fill="#2f5579">沉没成本</text>
          </g>
        )}
        {brk > 0 && (
          <g opacity={brk}>
            <path d="M1040,520 L1060,520 L1060,730 L1040,730" fill="none" stroke={C.red} strokeWidth={2.4} strokeDasharray="7 7" />
            <text x={1078} y={640} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.red}>不计入</text>
          </g>
        )}
      </g>
      {sp > 0 && <Scale p={sp} tilt={tilt} panL={panL} panR={panR} beam={beam} restO={keep} />}
    </g>
  );
};

/* ---------------------------------------------------------------- S06 */
const CW = 560, CH = 240, CY = 230;
const RainCloud: React.FC<{ x: number; y: number; T: number }> = ({ x, y, T }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-46,10 Q-52,-14 -28,-16 Q-22,-38 4,-32 Q22,-46 38,-24 Q60,-22 54,4 Q56,14 44,14 L-38,14 Q-48,14 -46,10 Z" fill="#e6dccb" stroke={C.ink} strokeWidth={2.6} strokeLinejoin="round" />
    {[0, 1, 2, 3, 4].map((i) => {
      const ph = (T * 1.4 + i * 0.37) % 1;
      const dx = -32 + i * 16, y0 = 22 + ph * 44;
      return <line key={i} x1={dx} y1={y0} x2={dx - 4} y2={y0 + 12} stroke={C.ink} strokeWidth={2.4} strokeLinecap="round" opacity={0.8 * (1 - ph)} />;
    })}
  </g>
);
const Gauge: React.FC<{ x: number; y: number; r: number; a: number }> = ({ x, y, r, a }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M${-r},0 A${r},${r} 0 0 1 ${r},0`} fill="none" stroke={C.ink} strokeWidth={2.6} />
    {Array.from({ length: 9 }, (_, i) => { const t = Math.PI * (1 - i / 8); return <line key={i} x1={(r - 10) * Math.cos(t)} y1={-(r - 10) * Math.sin(t)} x2={r * Math.cos(t)} y2={-r * Math.sin(t)} stroke={C.ink} strokeWidth={i % 4 === 0 ? 2.4 : 1.2} />; })}
    <text x={-r - 4} y={28} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22 }} fill={C.ink2}>低</text>
    <text x={r + 4} y={28} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22 }} fill={C.ink2}>高</text>
    <line x1={0} y1={0} x2={(r - 14) * Math.cos(Math.PI - a)} y2={-(r - 14) * Math.sin(Math.PI - a)} stroke={C.red} strokeWidth={3.5} strokeLinecap="round" />
    <circle r={6} fill={C.ink} />
  </g>
);
const RelCard: React.FC<{ c: number; T: number }> = ({ c, T }) => {
  const x = c - CW / 2;
  const tremble = 0.32 + 0.05 * Math.sin(T * 23 + c) * Math.sin(T * 7);
  return (
    <g>
      <rect x={x + 6} y={CY + 14} width={CW} height={CH} rx={6} fill="#000" opacity={0.08} />
      <rect x={x} y={CY} width={CW} height={CH} rx={6} fill="#e9e3d6" stroke={C.ink} strokeOpacity={0.35} strokeWidth={1.5} />
      <rect x={x} y={CY - 2.5} width={CW} height={5} rx={2.5} fill={C.ink} />
      <Coin x={x + 52} y={CY + 58} l="A" r={22} />
      <Coin x={x + 106} y={CY + 58} l="B" r={22} />
      <RainCloud x={c + 30} y={CY + 64} T={T} />
      <text x={x + 34} y={CY + 178} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 36 }} fill={C.ink4}>满意：<tspan fill={C.red}>低</tspan></text>
      <Gauge x={x + CW - 100} y={CY + 196} r={64} a={tremble} />
    </g>
  );
};
const ExitSign: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 0.5 }) => <ExitPict x={x} y={y} s={s * 0.78} glow={0.6} />;
const Seat: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 0.62 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-44,-4 V-46 Q-44,-62 -28,-62 H28 Q44,-62 44,-46 V-4 Z" fill="#8a3238" />
    <rect x={-56} y={-8} width={112} height={30} rx={7} fill="#a33d44" />
    <rect x={-64} y={-26} width={16} height={58} rx={6} fill="#5e2428" /><rect x={48} y={-26} width={16} height={58} rx={6} fill="#5e2428" />
    <text y={-22} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 38 }} fill={C.cream}>留</text>
  </g>
);
const Tag: React.FC<{ x: number; y: number; ang: number; text: string; col: string; o: number }> = ({ x, y, ang, text, col, o }) => {
  const w = [...text].filter((c) => c !== ' ').length * 34 + 44;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang})`} opacity={o}>
      <line x1={0} y1={0} x2={0} y2={34} stroke={C.ink2} strokeWidth={1.8} />
      <path d={`M${-w / 2},48 L${-w / 2 + 14},34 L${w / 2 - 14},34 L${w / 2},48 L${w / 2},100 L${-w / 2},100 Z`} fill="#f8f1e0" stroke={col} strokeWidth={2.6} strokeLinejoin="round" />
      <circle cx={0} cy={44} r={5} fill="#efe6d1" stroke={C.ink} strokeWidth={1.6} />
      <text y={88} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 34 }} fill={col}>{text}</text>
    </g>
  );
};

export const L_C = 750, R_C = 1390, BAR_Y = 690, BAR_W = 40;
const S06Ink: React.FC<{ T: number }> = ({ T }) => {
  const grow = eio(T, CUT.s6 + 0.12, 0.45); // the card body grows down from the beam
  const split = eio(T, b(63), 0.5);
  const lc = lerp(1070, L_C, split), rc = lerp(1070, R_C, split);
  const barK = eo(T, b(67), 0.9);
  const hL = 150 * barK, hR = 64 * barK;
  const higher = pop(T, b(69), 0.35);
  // exit: the taller bar tips over and becomes the sheet's top rule
  const tip = T >= CUT.s7 ? Math.min(1.06, spring(T, CUT.s7, 1.6, 6)) : 0;
  const travel = eio(T, CUT.s7 + 0.34, 0.5);
  const fade = 1 - eo(T, CUT.s7 + 0.1, 0.3);
  const signsO = eo(T, b(63) + 0.2, 0.4);
  const bar = (c: number, h: number, col: string) => (
    <g>
      <rect x={c + 140 - BAR_W / 2} y={BAR_Y - 30 - h} width={BAR_W} height={h} fill={col} opacity={0.92} />
      <rect x={c + 140 - BAR_W / 2} y={BAR_Y - 30 - h} width={BAR_W} height={h} fill="url(#k-hatchFine)" opacity={0.15} />
    </g>
  );
  const px = lc + 140 - BAR_W / 2, py = BAR_Y - 30;
  return (
    <g>
      <g opacity={fade}>
        <PageInk title="感情" sub="· 同一段不开心的" no="Ledger · No. 3" titleP={eo(T, CUT.s6, 0.4)} subP={eo(T, CUT.s6 + 0.2, 0.4)} />
      </g>
      <g opacity={fade}>
        <clipPath id="s06-grow"><rect x={0} y={CY - 4} width={1920} height={CH * grow + 30} /></clipPath>
        <g clipPath="url(#s06-grow)">
          {split > 0 && <RelCard c={rc} T={T} />}
          <RelCard c={lc} T={T} />
        </g>
        {[lc, rc].map((c, i) => (
          <g key={i} opacity={signsO}>
            <ExitSign x={c - 150} y={BAR_Y + 4} />
            <Seat x={c + 140} y={BAR_Y + 12} />
            <text x={c + 140} y={BAR_Y + 80} textAnchor="middle" opacity={eo(T, b(67), 0.4)} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30 }} fill={C.ink2}>留下的可能</text>
          </g>
        ))}
        {barK > 0 && bar(rc, hR, '#9d968a')}
        {barK > 0 && tip === 0 && bar(lc, hL, C.gold)}
        {higher > 0 && (
          <g transform={`translate(${lc + 176} ${BAR_Y - 30 - hL + 30}) scale(${higher})`}>
            <text textAnchor="start" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 36 }} fill={C.goldD}>更高 ↑</text>
          </g>
        )}
        {([[lc, '花过 钱 / 心力', C.teal, 0], [rc, '没花过', '#857e72', 0.12]] as [number, string, string, number][]).map(([c, t, col, d], i) => {
          const at = b(66) + d;
          const drop = eo(T, at, 0.3);
          if (drop <= 0) return null;
          return <Tag key={i} x={c - 120} y={CY + CH - 4} ang={swing(T, at + 0.15, 12, 1.1, 2.2)} text={t} col={col} o={drop} />;
        })}
        <Margin11 chip="设想情境" lines={['902人', 'Rego 等 2018', '示意，无数值']} o={eo(T, b(66), 0.4)} />
      </g>
      {tip > 0 && (travel <= 0 ? (
        <g transform={`rotate(${-90 * tip} ${px} ${py})`}>
          <rect x={px} y={py - hL} width={BAR_W} height={hL} fill={C.gold} opacity={0.92} />
        </g>
      ) : (() => {
        // lying down: x from px-hL to px, centred on py-BAR_W/2 → the sheet's top rule (y 330, x 440–1500)
        const x0 = lerp(px - hL, 440, travel), x1 = lerp(px, 1500, travel), y = lerp(py - BAR_W / 2, 330, travel), h = lerp(BAR_W, 3, travel);
        return <rect x={x0} y={y - h / 2} width={x1 - x0} height={h} fill={travel > 0.75 ? C.ink : C.gold} opacity={0.92} />;
      })())}
    </g>
  );
};

import React from 'react';
import { random } from 'remotion';
import { GoldTitle11 } from './kit11';
import { C, F, LNUM, Cam, Svg, Desk, PaperDiv, PageInk, PenText, Coin, Heart, Stamp, Hinge, pr, eo, eio, pop, spring, swing, lerp, clamp, easeOut, easeInOut, rnd, W } from './kit11';
import { CUT } from './time11';
import { b } from '../v6/ui6';
const b37 = () => b(37) + 0.05;
const FLIP = 0.42;

/* S01 cold open · S02 the experiment · S03 into the ledger · S04 title card */

/* ---------------------------------------------------------------- S01 */
const Ticket: React.FC<{ stampO?: number }> = ({ stampO = 1 }) => (
  <g>
    <rect x={-410} y={-150} width={820} height={300} rx={10} fill="#000" opacity={0.55} filter="url(#k-soft)" transform="translate(10 34)" />
    <path d="M-410,-150 H174 A26 26 0 0 0 226,-150 H410 V150 H226 A26 26 0 0 0 174,150 H-410 Z" fill="url(#k-tix)" />
    <line x1={200} y1={-140} x2={200} y2={140} stroke="#9c8f74" strokeWidth={2.4} strokeDasharray="3 9" />
    <rect x={-380} y={-122} width={560} height={244} fill="none" stroke={C.ink} strokeOpacity={0.25} />
    <text x={-350} y={-62} style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: 6 }} fill={C.ink3}>CINEMA · ADMIT ONE</text>
    <text x={-352} y={58} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 88, letterSpacing: 8 }} fill={C.ink}>电影票</text>
    <text x={-350} y={108} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 30, ...LNUM }} fill={C.ink2}>7排 · 12座</text>
    <text x={305} y={-60} textAnchor="middle" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 600, fontSize: 40, ...LNUM }} fill={C.ink3}>No. 1</text>
    <text x={305} y={30} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 54 }} fill={C.ink}>入场</text>
    <g transform="translate(78 44) rotate(-12) scale(.8)" opacity={stampO} filter="url(#k-stampInk)">
      <rect x={-150} y={-62} width={300} height={124} rx={6} fill="none" stroke={C.red} strokeWidth={7} />
      <rect x={-138} y={-50} width={276} height={100} rx={3} fill="none" stroke={C.red} strokeWidth={2.5} />
      <text y={26} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 72, letterSpacing: 6 }} fill={C.red}>已付款</text>
    </g>
  </g>
);

const Zzz: React.FC<{ T: number }> = ({ T }) => {
  // a stream of z's: born every 0.55 s at the bottom (108 px, 70 %), rising to the top (60 px, 40 %) and off
  const pts = [[1236, 262, 108, 0.7], [1316, 186, 80, 0.55], [1374, 126, 60, 0.4], [1420, 76, 46, 0]];
  const out = [];
  for (let k = -4; k < 8; k++) {
    const age = T - k * 0.55 + 0.05; // at T=0 the z's are 0.5, 1.05, 1.6 s old → frame-0 positions
    if (age < 0 || age > 1.65) continue;
    const u = age / 0.55; // 0..3
    const i = Math.min(2, Math.floor(u)), f = u - i;
    const [x0, y0, s0, o0] = pts[i], [x1, y1, s1, o1] = pts[i + 1];
    const x = lerp(x0, x1, f), y = lerp(y0, y1, f), s = lerp(s0, s1, f);
    const o = lerp(o0, o1, f) * Math.min(1, age / 0.18);
    out.push(<text key={k} x={x} y={y} style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 600, fontSize: s }} fill={C.cream} fillOpacity={o}>z</text>);
  }
  return <g>{out}</g>;
};

export const S01: React.FC<{ T: number }> = ({ T }) => {
  if (T > CUT.s2 + 0.6) return null;
  const t = T;
  // the ticket rocks between 走 and 留, then leans to 留 on bar 1 beat 2 and hangs; whipped off on the cut
  const rock = 4 * Math.sin((2 * Math.PI * t) / 1.4);
  const lean = spring(T, 2.53, 1.3, 3.2);
  const rot = -5 + lerp(rock, 7, clamp(lean));
  const whip = easeInOut(pr(T, CUT.s2, 0.36));
  const tx = -1500 * Math.pow(whip, 1.6);
  const screenO = 1 - eio(T, CUT.s2, 0.4);
  const flick = 0.98 + 0.02 * Math.sin(t * 53) * Math.sin(t * 7.1);
  return (
    <>
      <Svg>
        <g opacity={screenO}>
          <rect x={300} y={70} width={1320} height={400} rx={4} fill="#5d7bb0" opacity={0.22} filter="url(#k-soft)" />
          <rect x={300} y={70} width={1320} height={400} rx={4} fill="#1b2338" />
          <rect x={300} y={70} width={1320} height={400} rx={4} fill="url(#s01-lit)" />
          <defs>
            <radialGradient id="s01-lit" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#8fa6d6" stopOpacity=".22" /><stop offset="1" stopColor="#0e1322" stopOpacity=".6" /></radialGradient>
            <radialGradient id="s01-spot" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffe9b8" stopOpacity=".22" /><stop offset="1" stopColor="#ffe9b8" stopOpacity="0" /></radialGradient>
          </defs>
          <text x={960} y={262} textAnchor="middle" style={{ fontFamily: F.mono, fontSize: 120, letterSpacing: 22 }}><tspan fill="#e0ad4f">★</tspan><tspan fill="#46516e">★★★★</tspan></text>
          <Zzz T={T} />
        </g>
        <ellipse cx={960 + tx * 0.3} cy={560} rx={640} ry={260} fill="url(#s01-spot)" opacity={1 - whip} />
        <g transform={`translate(${960 + tx} 560) rotate(${rot})`} filter={whip > 0.05 && whip < 0.95 ? 'url(#k-blur2)' : undefined}>
          <Ticket />
        </g>
        <g opacity={(1 - whip) * flick}>
          <g transform="translate(250 690)">
            <rect x={-80} y={-48} width={160} height={96} rx={8} fill="#0d3b2c" stroke="#3fd39a" strokeWidth={3} />
            <rect x={-80} y={-48} width={160} height={96} rx={8} fill="#3fd39a" opacity={0.25} filter="url(#k-soft)" />
            <text x={-14} y={22} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 60 }} fill="#7ff0c0">走</text>
            <path d="M30,0 H58 M46,-14 L60,0 L46,14" fill="none" stroke="#7ff0c0" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
        <g opacity={1 - whip} transform="translate(1660 690) scale(1.25)">
          <path d="M-44,-4 V-46 Q-44,-62 -28,-62 H28 Q44,-62 44,-46 V-4 Z" fill="#8a3238" />
          <rect x={-56} y={-8} width={112} height={30} rx={7} fill="#a33d44" />
          <rect x={-64} y={-26} width={16} height={58} rx={6} fill="#5e2428" /><rect x={48} y={-26} width={16} height={58} rx={6} fill="#5e2428" />
          <text y={-22} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 900, fontSize: 38 }} fill={C.cream}>留</text>
        </g>
      </Svg>
    </>
  );
};

/* ---------------------------------------------------------------- S02 */
type CardO = { x0: number; label: string; fill: number; pct: number; pctShow: number; y: number; n: number; yes: string; no: string; dotsAt: number; dotGap: number; pill: number; ask: number; flash: number };
const PITCH = 17.6, DOT = 13;
/** dot i of a pile → position (as in the style frame: 16 per row, gold from the left, grey from the right) */
const pilePos = (x0: number, base: number, i: number, right: boolean) => {
  const w = 16 * PITCH, c = i % 16, r = Math.floor(i / 16);
  const x = right ? x0 + 616 - w + w - c * PITCH - PITCH / 2 : x0 + 44 + c * PITCH + PITCH / 2;
  return [x, base - r * PITCH - PITCH / 2 - 2];
};
const CardFace: React.FC<{ T: number; o: CardO; lit: number }> = ({ T, o, lit }) => {
  const x0 = o.x0, y0 = 184, base = y0 + 496;
  // the order the dots land in: interleave yes/no in proportion
  const order: [boolean, number][] = [];
  let a = 0, z = 0;
  const tot = o.y + o.n;
  for (let i = 0; i < tot; i++) {
    if (a / o.y <= z / o.n && a < o.y) order.push([true, a++]);
    else if (z < o.n) order.push([false, z++]);
    else order.push([true, a++]);
  }
  const dots = order.map(([yes, k], i) => {
    const t0 = o.dotsAt + i * o.dotGap;
    const p = pr(T, t0, 0.42);
    if (p <= 0) return null;
    const [x, y] = pilePos(x0, base, k, !yes);
    const fallH = 520 + rnd(i, x0) * 120;
    const bounce = p >= 1 ? -6 * Math.exp(-(T - t0 - 0.42) * 14) * Math.abs(Math.sin((T - t0 - 0.42) * 22)) : 0;
    const yy = y - fallH * (1 - p * p) + bounce;
    return <circle key={i} cx={x + (1 - p) * (rnd(i, 3) - 0.5) * 40} cy={yy} r={DOT / 2} fill={yes ? C.gold : '#b3ab9d'} opacity={Math.min(1, p * 4)} />;
  });
  const pileDone = (yes: boolean) => eo(T, o.dotsAt + tot * o.dotGap + 0.3, 0.3);
  const pct = Math.round(o.pct * easeOut(pr(T, o.pctShow, o.flash - o.pctShow)));
  const glint = T > o.flash ? Math.exp(-(T - o.flash) * 3.2) : 0;
  const pctO = eo(T, o.pctShow, 0.15);
  const askO = o.ask < 0 ? 0 : Math.min(eo(T, o.ask, 0.25), 1 - eo(T, o.pctShow - 0.05, 0.2));
  const planeX = (k: number) => o.pill;
  const pillS = pop(T, o.pill, 0.3);
  return (
    <g>
      {/* eyebrow: outline plane = the project */}
      <use href="#k-planeOutline" x={x0 + 44} y={y0 + 38} width={52} height={34} />
      <text x={x0 + 108} y={y0 + 66} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 30 }} fill={C.ink}>项目</text>
      {pillS > 0 && (
        <g transform={`translate(${x0 + 438} ${y0 + 38})`}>
          <g opacity={Math.min(1, pillS)}>
            <use href="#k-plane" x={0} y={0} width={54} height={34} />
            {[0, 1, 2].map((i) => <line key={i} x1={-34 + i * 6} y1={10 + i * 7} x2={-8 + i * 6} y2={10 + i * 7} stroke={C.ink} strokeWidth={2} strokeOpacity={0.45} />)}
          </g>
          <g transform={`translate(118 18) scale(${pillS}) translate(-118 -18)`}>
            <rect x={62} y={-1} width={112} height={38} rx={19} fill={C.redUI} />
            <text x={118} y={28} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 26 }} fill="#fbefe6">对手更强</text>
          </g>
        </g>
      )}
      <text x={x0 + 44} y={y0 + 132} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 44, ...LNUM }} fill={C.ink}>{o.label}</text>
      <rect x={x0 + 44} y={y0 + 158} width={572} height={16} rx={8} fill="none" stroke={C.teal} strokeWidth={2} strokeDasharray={o.fill ? undefined : '6 6'} strokeOpacity={o.fill ? 1 : 0.7} />
      {o.fill > 0 && (() => {
        const f = o.fill * easeOut(pr(T, CUT.s2 + 0.35, 1.0));
        return (
          <>
            <rect x={x0 + 44} y={y0 + 158} width={572 * f} height={16} rx={8} fill={C.teal} />
            <text x={x0 + 44 + 572 * o.fill} y={y0 + 206} textAnchor="end" opacity={eo(T, CUT.s2 + 1.2, 0.3)} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26 }} fill={C.teal}>快完成</text>
          </>
        );
      })()}
      <line x1={x0 + 44} y1={y0 + 232} x2={x0 + 616} y2={y0 + 232} stroke={C.ink} strokeOpacity={0.25} />
      {askO > 0 && <text x={x0 + 330} y={y0 + 352} textAnchor="middle" opacity={askO} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 96 }} fill={C.ink4}>投不投？</text>}
      {pctO > 0 && (
        <g opacity={pctO}>
          <g transform={`translate(${x0 + 180} ${y0 + 320}) scale(${1 + 0.06 * Math.sin(Math.PI * clamp((T - o.flash) / 0.3))}) translate(${-x0 - 180} ${-y0 - 320})`}>
            <text x={x0 + 36} y={y0 + 392} style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 226, letterSpacing: -2, ...LNUM }} fill="url(#k-foil)">{pct}%</text>
            {glint > 0.01 && (
              <>
                <clipPath id={`gl${x0}`}><rect x={x0 + 36 + lerp(-120, 520, 1 - glint)} y={y0 + 200} width={70} height={220} transform={`skewX(-18)`} /></clipPath>
                <text x={x0 + 36} y={y0 + 392} clipPath={`url(#gl${x0})`} style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 226, letterSpacing: -2, ...LNUM }} fill="#fff4cf" opacity={0.35}>{pct}%</text>
              </>
            )}
          </g>
        </g>
      )}
      <line x1={x0 + 44} y1={base + 2} x2={x0 + 616} y2={base + 2} stroke={C.ink} strokeOpacity={0.45} strokeWidth={1.5} />
      {dots}
      <g opacity={pileDone(true)}>
        <text x={x0 + 44 + (Math.min(o.y, 16) * PITCH) / 2} y={base + 44} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 34 }} fill="#9a6c1f">{o.yes}</text>
        <text x={x0 + 616 - (Math.min(o.n, 16) * PITCH) / 2} y={base + 44} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 34 }} fill="#857e72">{o.no}</text>
      </g>
      {lit < 1 && <rect x={x0} y={y0} width={660} height={574} rx={4} fill="#0b101d" opacity={(1 - lit) * 0.55} />}
    </g>
  );
};

export const CARD_L: CardO = { x0: 228, label: '已投1000万美元', fill: 0.93, pct: 85, pctShow: CUT.s2 + 4.05, y: 41, n: 7, yes: '接着投', no: '停', dotsAt: CUT.s2 + 3.45, dotGap: 0.022, pill: CUT.s2 + 3.3, ask: CUT.s2 + 3.4, flash: CUT.drop1 };
export const CARD_R: CardO = { x0: 1032, label: '之前没投过', fill: 0, pct: 17, pctShow: CUT.l4 + 0.2, y: 10, n: 50, yes: '投', no: '不投', dotsAt: CUT.l4 + 0.12, dotGap: 0.0125, pill: CUT.s2 + 3.5, ask: -1, flash: CUT.l4 + 1.0 };

/** a card dealt in from the right: returns the HTML-layer transform */
const deal = (T: number, at: number) => {
  const k = easeOut(pr(T, at, 0.5));
  return { dx: (1 - k) * 1300, rot: (1 - k) * 9, o: Math.min(1, k * 3) };
};

export const CardBody: React.FC<{ x: number; w?: number; h?: number }> = ({ x, w = 660, h = 574 }) => (
  <div style={{ position: 'absolute', left: x, top: 184, width: w, height: h, borderRadius: 4,
    background: 'radial-gradient(ellipse 80% 60% at 50% 20%, #fbf5e7 0%, #f1e8d3 70%, #e9dec4 100%)', boxShadow: '0 34px 70px rgba(0,0,0,.6),0 8px 16px rgba(0,0,0,.35)' }}>
    <div style={{ position: 'absolute', inset: 14, border: '1px solid rgba(30,26,22,.22)', borderRadius: 2 }} />
  </div>
);

export const S02: React.FC<{ T: number }> = ({ T }) => {
  if (T < CUT.s2 - 0.05 || T > CUT.s3 + 1.2) return null;
  const dl = deal(T, CUT.s2 + 0.05), dr = deal(T, CUT.s2 + 0.17);
  const lampK = eio(T, CUT.l4, 0.7);
  const rightLit = 0.45 + 0.55 * lampK;
  // plane streak at L3
  const pt = pr(T, CUT.s2 + 3.04, 0.7);
  const px = lerp(-200, 2150, easeInOut(pt));
  // flips (S03 start): rotateY 0 → 180; the backs are ledger rows (drawn by S03)
  const flipL = eio(T, CUT.s3, FLIP) * 180, flipR = eio(T, CUT.s3 + 0.1, FLIP) * 180;
  const card = (o: CardO, d: ReturnType<typeof deal>, lit: number, flip: number, row: { no: string; name: string; note: string }, handoff: number) => {
    // a 2D flip (scaleX = cos θ): never vanishes mid-turn; the back is the card's ledger row, handed to S03 on the frame the flip ends
    if (T >= handoff) return null;
    const c = Math.cos((flip * Math.PI) / 180);
    const cxp = o.x0 + 330;
    const shade = 1 - Math.abs(c);
    return (
      <div style={{ position: 'absolute', inset: 0, opacity: d.o, transform: `translateX(${d.dx}px) rotate(${d.rot}deg)`, transformOrigin: `${cxp}px 470px` }}>
        <div style={{ position: 'absolute', inset: 0, transformOrigin: `${cxp}px 471px`, transform: `scaleX(${Math.max(0.002, Math.abs(c))})` }}>
          {c > 0 ? (
            <>
              <CardBody x={o.x0} />
              <Svg><CardFace T={T} o={o} lit={lit} /></Svg>
            </>
          ) : (
            <>
              <CardBody x={o.x0} />
              <Svg><g transform={`translate(${o.x0 + 28} ${471 + 14}) scale(0.55)`}><RowStrip {...row} /></g></Svg>
            </>
          )}
          {shade > 0.02 && <div style={{ position: 'absolute', left: o.x0, top: 184, width: 660, height: 574, background: '#000', opacity: 0.35 * shade }} />}
        </div>
      </div>
    );
  };
  const bracket = eo(T, b37(), 0.5);
  const fadeAll = 1 - eo(T, CUT.s3, 0.3);
  return (
    <>
      {/* lamp pool slides from the left card to both */}
      <div style={{ position: 'absolute', inset: 0, opacity: fadeAll, background: `radial-gradient(ellipse ${lerp(30, 52, lampK)}% 44% at ${lerp(28, 50, lampK)}% 50%, rgba(241,197,109,.12), rgba(241,197,109,0) 70%)` }} />
      {card(CARD_L, dl, 1, flipL, ROWS[1], CUT.s3 + FLIP)}
      {card(CARD_R, dr, rightLit, flipR, ROWS[2], CUT.s3 + 0.1 + FLIP)}
      <Svg>
        <g opacity={fadeAll}>
          <g opacity={Math.min(dl.o, dr.o)}>
            <line x1={960} y1={300} x2={960} y2={420} stroke={C.cream} strokeOpacity={0.18} />
            <line x1={960} y1={540} x2={960} y2={660} stroke={C.cream} strokeOpacity={0.18} />
            <text x={960} y={494} textAnchor="middle" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 76 }} fill={C.cream} fillOpacity={0.55}>vs</text>
          </g>
          {bracket > 0 && (
            <g opacity={bracket}>
              <g stroke={C.goldHi} strokeWidth={1.6} fill="none" opacity={0.75}>
                <path d="M558,182 L558,146 L790,146" {...{ pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - bracket }} />
                <path d="M1362,182 L1362,146 L1130,146" {...{ pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - bracket }} />
              </g>
              <clipPath id="s02-br"><rect x={795} y={120} width={330 * eo(T, b37() + 0.2, 0.6)} height={50} /></clipPath>
              <text x={960} y={158} textAnchor="middle" clipPath="url(#s02-br)" style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 34, letterSpacing: 2 }} fill={C.cream}>区别：<tspan fill={C.goldHi}>之前投没投过</tspan></text>
            </g>
          )}
          {/* the rival plane streaks across both cards */}
          {pt > 0 && pt < 1 && (
            <g transform={`translate(${px} 228)`}>
              {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-40 - i * 70} y1={6 + i * 5} x2={-10 - i * 20} y2={6 + i * 5} stroke={C.cream} strokeWidth={3} strokeOpacity={0.5 - i * 0.08} strokeLinecap="round" />)}
              <g transform="scale(1.6)"><use href="#k-plane" x={0} y={-17} width={54} height={34} style={{ fill: C.cream }} /></g>
            </g>
          )}
          <g transform="translate(228 802)" opacity={eo(T, CUT.s2 + 0.6, 0.4)}>
            <rect x={0} y={-26} width={130} height={36} rx={18} fill="none" stroke={C.goldHi} strokeOpacity={0.7} />
            <text x={65} y={0} textAnchor="middle" style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22 }} fill={C.goldHi}>设想情境</text>
            <text x={146} y={0} style={{ fontFamily: F.mono, fontSize: 20, whiteSpace: 'pre', ...LNUM }} fill={C.cream} fillOpacity={0.55}>
              Arkes &amp; Blumer 1985{'   '}<tspan fill={C.goldHi} fillOpacity={0.9}>●</tspan> = 1人
            </text>
          </g>
        </g>
      </Svg>
    </>
  );
};

/* ---------------------------------------------------------------- S03 + S04 (one camera: page → closed book → open book) */
const ROWS = [
  { y: 330, no: 'No.1', name: '电影票', note: '已付款', from: { x: 960, y: 560, w: 820, h: 300 } },
  { y: 422, no: 'No.2', name: '项目', note: '已投1000万美元', from: { x: 558, y: 471, w: 660, h: 574 } },
  { y: 514, no: 'No.3', name: '项目', note: '之前没投过', from: { x: 1362, y: 471, w: 660, h: 574 } },
];

/** a ledger-row strip (the back of a flipped card) */
const RowStrip: React.FC<{ no: string; name: string; note: string }> = ({ no, name, note }) => (
  <g>
    <text x={0} y={0} style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 600, fontSize: 36, ...LNUM }} fill={C.ink3}>{no}</text>
    <text x={120} y={0} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 40 }} fill={C.ink}>{name}</text>
    <line x1={130 + [...name].length * 42} y1={-8} x2={760} y2={-8} stroke={C.ink} strokeWidth={2} strokeDasharray="2 10" strokeLinecap="round" strokeOpacity={0.45} />
    <text x={1100} y={0} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 40, ...LNUM }} fill={C.ink2}>{note}</text>
  </g>
);

export const S03S04: React.FC<{ T: number }> = ({ T }) => {
  if (T < CUT.s3 - 0.05 || T > CUT.s5 + 0.7) return null;
  // page unrolls beneath the flipping cards
  const unroll = eio(T, CUT.s3 + 0.2, 0.55);
  // cards (backs) fly into rows
  // reframe to rows 2–3
  const push = eio(T, b(41) - 0.1, 0.7);
  // book closes on bar 7, camera pulls back
  const close = eio(T, CUT.s4, 0.52);
  const pull = eio(T, CUT.s4, 0.52);
  // title push, then open on bar 8
  const open = eio(T, CUT.s5, 0.55);
  const pushIn = eio(T, CUT.s5, 0.42);
  const titleF = (T - CUT.s4) * 30;
  const brand = 1 + 0.03 * eio(T, CUT.s4 + 0.3, CUT.s5 - CUT.s4 - 0.3);
  let s = lerp(1, 1.12, push);
  let cx = lerp(960, 900, push), cy = lerp(540, 720, push);
  s = lerp(s, 0.82 * brand, pull);
  cx = lerp(cx, 960, pull);
  cy = lerp(cy, 470, pull);
  s = lerp(s, 1, pushIn);
  // red pen row
  const penP = pr(T, b(41), 1.05);
  const blink = T > b(43) && T < b(43) + 0.6 ? (Math.floor((T - b(43)) / 0.15) % 2 === 0 ? 1 : 0.25) : T >= b(43) + 0.6 ? 1 : 1;
  const coins = pop(T, b(43) + 0.32, 0.3);
  const pageO = T < CUT.s4 + 0.52 ? 1 : 0; // hidden while the cover is shut (no flash through it); S05 owns the page after it opens
  return (
    <Cam s={s} cx={cx} cy={cy}>
      {pageO > 0 && (
        <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${(1 - unroll) * 708 + 92}px 0 0 0)` }}>
          <PaperDiv />
        </div>
      )}
      {pageO > 0 && (
        <Svg>
          <g opacity={unroll}>
            <PageInk title="账本" no="Ledger · No. 1" titleP={eo(T, CUT.s3 + 0.5, 0.4)} />
          </g>
          {/* rows: flying card-backs settle into ledger rows */}
          {ROWS.map((r, i) => {
            if (i === 0) {
              // the ticket's row is written onto the page as it unrolls
              return (
                <g key={i} transform={`translate(460 ${r.y})`} opacity={eo(T, CUT.s3 + 0.45, 0.3)}>
                  <RowStrip no={r.no} name={r.name} note={r.note} />
                </g>
              );
            }
            const t0 = CUT.s3 + (i === 1 ? 0 : 0.1) + FLIP;
            if (T < t0) return null;
            const k = eio(T, t0, 0.5);
            const f = r.from;
            const rx = lerp(f.x - f.w / 2, 440, k), ry = lerp(f.y - f.h / 2, r.y - 44, k), rw = lerp(f.w, 1140, k), rh = lerp(f.h, 60, k);
            return (
              <g key={i}>
                {k < 1 && <rect x={rx} y={ry} width={rw} height={rh} rx={4} fill="#f3ebd8" opacity={Math.pow(1 - k, 1.5)} />}
                <g transform={`translate(${lerp(f.x - f.w / 2 + 28, 460, k)} ${lerp(f.y + 14, r.y, k)}) scale(${lerp(0.55, 1, k)})`}>
                  <RowStrip no={r.no} name={r.name} note={r.note} />
                </g>
              </g>
            );
          })}
          {/* No.3 in red pen */}
          {penP > 0 && (
            <g>
              <text x={460} y={606} style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 600, fontSize: 36, ...LNUM }} fill={C.red} opacity={eo(T, b(41), 0.2)}>No.4</text>
              <PenText x={580} y={606} p={clamp(penP * 1.6)} size={40} weight={900} fill={C.red} text="感情" />
              {penP > 0.55 && <line x1={680} y1={598} x2={lerp(680, 1380, clamp((penP - 0.55) / 0.35))} y2={598} stroke={C.red} strokeWidth={2.2} strokeDasharray="2 10" strokeLinecap="round" />}
              {penP > 0.9 && (
                <g opacity={blink} transform="translate(1440 590)">
                  <Heart x={0} y={0} kind="empty" s={1.1} />
                  <text x={34} y={14} style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 52 }} fill={C.red}>?</text>
                </g>
              )}
              {/* pen nib */}
              {penP < 1 && <circle cx={penP < 0.55 ? 580 + 90 * clamp(penP * 1.6) : lerp(680, 1380, clamp((penP - 0.55) / 0.35))} cy={600} r={4} fill={C.red} />}
            </g>
          )}
          <Coin x={420} y={592} l="A" s={coins} o={Math.min(1, coins)} r={22} />
          <Coin x={1540} y={592} l="B" s={coins} o={Math.min(1, coins)} r={22} />
        </Svg>
      )}
      {/* the cover: closes on bar 7, opens on bar 8 (the same hinge, spine on the left) */}
      {T >= CUT.s4 && (
        <Hinge angle={T < CUT.s5 ? lerp(-178, 0, close) : lerp(0, -178, open)} axisX={120} back={<CoverInside />}>
          <Cover T={T} f={titleF} />
        </Hinge>
      )}
    </Cam>
  );
};

const CoverInside: React.FC = () => (
  <div style={{ position: 'absolute', left: 120, top: 86, width: 1690, height: 708, borderRadius: 6, background: '#1b2640' }}>
    <div style={{ position: 'absolute', left: 14, top: 12, right: 14, bottom: 12, borderRadius: 3, background: 'linear-gradient(90deg,#e4d8bd,#efe5cf 60%,#e7dcc3)', boxShadow: 'inset 0 0 80px rgba(120,90,50,.25)' }} />
  </div>
);
const Cover: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const flare = f >= 26 ? Math.exp(-(f - 26) / 9) : 0;
  return (
    <>
      {/* page block (cream) on the fore-edge and bottom edge, under the cloth */}
      <div style={{ position: 'absolute', left: 124, top: 98, width: 1690, height: 712, borderRadius: 4, background: 'repeating-linear-gradient(0deg,#efe6d0 0px,#efe6d0 2px,#d9cdb0 3px)', boxShadow: '0 30px 60px rgba(0,0,0,.55)' }} />
      <div style={{ position: 'absolute', left: 110, top: 86, width: 1690, height: 708, borderRadius: 6, background: `linear-gradient(180deg, ${C.navyLit} 0px, ${C.navy} 4px, #1b2640 100%)`, boxShadow: `inset -3px 3px 0 ${C.navyLit}, inset 0 0 120px rgba(0,0,0,.35)` }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.018) 0 2px, rgba(0,0,0,.02) 2px 4px)' }} />
        <div style={{ position: 'absolute', left: 36, top: 30, right: 36, bottom: 30, border: '1.5px solid rgba(230,189,102,.45)', borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: 46, top: 40, right: 46, bottom: 40, border: '1px solid rgba(230,189,102,.25)', borderRadius: 2 }} />
      </div>
      <Svg>
        <g transform="translate(0 -94)">
          <text x={960} y={400} textAnchor="middle" opacity={eo(T, CUT.s4 + 0.32, 0.4)} style={{ fontFamily: F.serif, fontWeight: 600, fontSize: 30, letterSpacing: '0.32em' }} fill="#e6bd66">感情里的经济学 · 沉没成本 × 博弈</text>
          <g opacity={eo(T, CUT.s4 + 0.32, 0.5)} stroke="#e6bd66" strokeWidth={1.2}>
            <line x1={640} y1={438} x2={890} y2={438} /><line x1={1030} y1={438} x2={1280} y2={438} />
            <path d="M960,432 L966,438 L960,444 L954,438 Z" fill="#e6bd66" stroke="none" />
          </g>
          <GoldTitle11 text="舍不得的，是TA吗？" f={f} at={6} step={1.5} fade={10} size={120} y={590} />
          <ellipse cx={960} cy={548} rx={760 * (0.4 + flare)} ry={2 + 2.5 * flare} fill="#fff1cf" opacity={0.55 * flare} />
          {Array.from({ length: 36 }, (_, i) => {
            const t = f - 26;
            if (t < 0 || t > 40) return null;
            const a = random(`c11a${i}`) * Math.PI * 2, d = t * (3 + random(`c11d${i}`) * 9) * Math.exp(-t / 30);
            return <circle key={i} cx={960 + Math.cos(a) * d * 1.6} cy={548 + Math.sin(a) * d * 0.4} r={1 + random(`c11r${i}`) * 2} fill="#ffe3a8" opacity={Math.max(0, 1 - t / 40)} />;
          })}
          {/* embossed coins */}
          {[[300, 718, 'A'], [1620, 718, 'B']].map(([x, y, l]) => (
            <g key={l as string} transform={`translate(${x} ${y})`} opacity={0.75}>
              <circle r={30} fill="none" stroke="#e6bd66" strokeWidth={2.5} />
              <circle r={23} fill="none" stroke="#e6bd66" strokeWidth={1} strokeOpacity={0.6} />
              {l === 'A' && <circle r={22} fill="#e6bd66" opacity={0.18} />}
              <text y={12} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 36 }} fill="#e6bd66">{l}</text>
            </g>
          ))}
        </g>
      </Svg>
    </>
  );
};

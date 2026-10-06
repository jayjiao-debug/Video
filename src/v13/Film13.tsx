import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import TL from './tl13.json';
import {
  C, F, FontFaces, prog, sm, there, life, lerp, clamp, smooth, poly, P2, Create, Write, FadeUp, Txt, SurRect, brace, Arrow,
  indicate, gauss, Phi, learnRate, ACC_STAR,
} from './kit13';

/* 《心流》 ep13 — 3Blue1Brown-style analytic film. Every frame is a pure function of T (seconds).
   Times come from the TTS guide timeline (tl13.json); the owner records his own voice over the SRT. */
export const EP13_FRAMES = Math.round(TL.film_end * 30);
type Seg = { id: string; t0: number; t1: number; text: string; cap: string };
const SEG: Record<string, Seg> = Object.fromEntries((TL.segs as Seg[]).map((s) => [s.id, s]));
export const cue = (id: string, sub?: string) => {
  const s = SEG[id]; if (!sub) return s.t0;
  const i = s.text.indexOf(sub); return s.t0 + (s.t1 - s.t0) * Math.max(0, i) / s.text.length;
};
export const end = (id: string) => SEG[id].t1;
const DROP1 = TL.title_t, DROP2 = TL.drop2_film, FILM_END = TL.film_end;
const rnd = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

/* =========================== HOOK: the number line, then the curve =========================== */
const NL = { x0: 250, x1: 1670 };
const hookLo = (T: number) => 0.5 * sm(T, cue('H5') + 0.2, 1.4);            // axis rescales to 50–100 %
const px = (a: number, lo: number) => NL.x0 + (NL.x1 - NL.x0) * (a - lo) / (1 - lo);
const lineY = (T: number) => lerp(620, 850, sm(T, cue('H5') + 0.2, 1.4));
const GY = 560;                                                              // graph height (px) for learnRate = 1
const curveY = (a: number, y0: number) => y0 - GY * learnRate(a);
/** marker value along the number line */
const markerV = (T: number) => {
  const keys: [number, number][] = [[0, 0.3], [0.75, 0.93], [1.5, 0.42], [cue('H2') + 0.05, 0.85], [cue('H3', '全做对') , 0.85], [cue('H3', '全做对') + 0.7, 1.0], [cue('H4'), 1.0], [cue('H4') + 0.7, 0.5]];
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) { const [ta, va] = keys[i - 1], [tb, vb] = keys[i]; if (T >= ta) v = lerp(va, vb, smooth(prog(T, ta, tb - ta))); }
  return v;
};
const Hook: React.FC<{ T: number }> = ({ T }) => {
  const o = 1 - sm(T, DROP1 - 0.15, 0.35);
  if (o <= 0) return null;
  const lo = hookLo(T), y = lineY(T), dimAll = 1 - 0.78 * sm(T, cue('H7'), 0.8);
  const kLine = sm(T, 0, 0.7);
  const ticks = Array.from({ length: 11 }, (_, i) => i / 10).filter((a) => a >= lo - 1e-6);
  const mv = markerV(T), mx = px(mv, lo), mO = 1 - sm(T, cue('H5') + 0.1, 0.5);
  const lock = there(T, cue('H2'), 0.35), ind = indicate(T, cue('H2') + 0.05, 0.7);
  // graph
  const kY = sm(T, cue('H5') + 0.9, 0.8), kCurve = sm(T, cue('H6') - 0.1, 2.3);
  const aEnd = lerp(0.5, 1, kCurve), curvePts: P2[] = Array.from({ length: 121 }, (_, i) => { const a = 0.5 + 0.5 * i / 120; return [px(a, lo), curveY(a, y)]; });
  const peakX = px(ACC_STAR, lo), peakY = curveY(ACC_STAR, y);
  const kPeak = there(T, cue('H6', '百分之八十五') - 0.1, 0.6);
  const dotA = kPeak > 0 ? ACC_STAR : aEnd;
  const dot: P2 = [px(dotA, lo), curveY(dotA, y)];
  // labels for the two bad extremes
  const lab100 = life(T, cue('H3', '太简单'), cue('H7') + 0.3, 0.4, 0.5), lab50 = life(T, cue('H4', '瞎猜'), cue('H7') + 0.3, 0.4, 0.5);
  return (
    <g opacity={o}>
      <g opacity={dimAll}>
        {/* the line / x-axis */}
        <Create d={`M${NL.x0 - 30},${y} L${NL.x1 + 40},${y}`} k={kLine} stroke={C.line} w={3} />
        {ticks.map((a) => {
          const x = px(a, lo), big = Math.abs(a - 0.5) < 1e-6 || a === 0 || a === 1;
          return (
            <g key={a} opacity={sm(T, 0.15 + a * 0.4, 0.3)}>
              <line x1={x} y1={y - (big ? 14 : 9)} x2={x} y2={y + (big ? 14 : 9)} stroke={C.line} strokeWidth={3} />
              <Txt x={x} y={y + 62} size={42} font={F.math} fill={C.white} o={0.92}>{`${Math.round(a * 100)}%`}</Txt>
            </g>
          );
        })}
        <Txt x={NL.x1 + 58} y={y + 12} size={38} anchor="start" fill={C.grey} o={sm(T, 0.5, 0.5)}>正确率</Txt>
        {/* y-axis + curve */}
        {kY > 0 && <Create d={`M${NL.x0},${y} L${NL.x0},${y - GY - 60}`} k={kY} stroke={C.line} w={3} />}
        <Txt x={NL.x0 + 24} y={y - GY - 36} size={38} anchor="start" fill={C.grey} o={kY}>学得多快</Txt>
        {kCurve > 0 && <Create d={poly(curvePts)} k={kCurve} stroke={C.blue} w={8} />}
        {/* the extremes on the curve */}
        <Txt x={px(1, lo) - 90 * lo * 2} y={y - lerp(80, 36, lo * 2)} size={46} fill={C.blue} o={lab100}>太简单</Txt>
        <Txt x={px(0.5, lo) + 150 * lo * 2} y={y - lerp(80, 36, lo * 2)} size={46} fill={C.red} o={lab50}>瞎猜</Txt>
        {/* the peak */}
        {kPeak > 0 && <Create d={`M${peakX},${peakY} L${peakX},${y}`} k={kPeak} stroke={C.yellow} w={3} dash="10 10" o={kPeak} />}
      </g>
      {kPeak > 0 && (
        <g opacity={dimAll * 0.9 + 0.1 * (1 - sm(T, cue('H7'), 0.8))}>
          <Txt x={peakX} y={peakY - 48} size={66} font={F.math} fill={C.yellow} o={kPeak * dimAll}>≈ 85%</Txt>
          <SurRect x={peakX - 125} y={peakY - 112} w={250} h={86} k={there(T, cue('H6', '左右') - 0.2, 0.5)} o={dimAll} />
        </g>
      )}
      {(kCurve > 0) && <circle cx={dot[0]} cy={dot[1]} r={11} fill={C.yellow} />}
      {/* marker + DecimalNumber */}
      {mO > 0 && (
        <g opacity={mO * dimAll} transform={`translate(${mx},${y - 26})`}>
          <path d="M0,0 L-15,-24 L15,-24 Z" fill={C.yellow} />
          <g transform={`translate(0,-50) scale(${1 + 0.25 * ind})`}>
            <Txt x={0} y={0} size={lerp(90, 136, lock)} font={F.math} fill={ind > 0.05 || lock > 0.5 ? C.yellow : C.white}>{`${Math.round(mv * 100)}%`}</Txt>
          </g>
          {lock > 0 && <SurRect x={-150} y={-196} w={300} h={160} k={there(T, cue('H2') + 0.25, 0.5) * (1 - there(T, cue('H3') + 0.3, 0.4))} />}
        </g>
      )}
      <Txt x={NL.x0 - 10} y={y + 120} size={22} anchor="start" fill={C.grey} font={F.math} o={life(T, cue('H5'), cue('H7') + 0.4) * 0.9} italic>Wilson, Shenhav, Straccia &amp; Cohen · Nature Communications · 2019（数学模型）</Txt>
    </g>
  );
};
/** the camera zooms into the peak dot before the title */
const hookCam = (T: number) => {
  const k = sm(T, cue('H7') + 1.0, DROP1 - cue('H7') - 1.0);
  const lo = hookLo(T), y = lineY(T);
  const cx = px(ACC_STAR, lo), cy = curveY(ACC_STAR, y);
  return { k, cx, cy, s: lerp(1, 4.5, k) };
};

/* =========================== TITLE =========================== */
const Title: React.FC<{ T: number }> = ({ T }) => {
  if (T < DROP1 - 0.05 || T > cue('F1') + 1.2) return null;
  const o = 1 - sm(T, cue('F1') - 0.3, 0.6);
  const ring = prog(T, DROP1, 0.9);
  return (
    <g opacity={o}>
      {ring < 1 && <circle cx={960} cy={540} r={20 + 900 * smooth(ring)} fill="none" stroke={C.yellow} strokeWidth={6 * (1 - ring)} opacity={1 - ring} />}
      <Write x={960} y={590} k={sm(T, DROP1, 0.55)} size={190} font={'"Noto Serif CJK SC", serif'} weight={700} ls="0.12em" w={520}>心流</Write>
      <Txt x={960} y={680} size={46} font={F.math} italic fill={C.grey} o={sm(T, DROP1 + 0.5, 0.5)} ls="0.2em">flow</Txt>
    </g>
  );
};

/* =========================== F: time disappears; four people, one current =========================== */
const Clock: React.FC<{ T: number }> = ({ T }) => {
  const a = cue('F1') - 0.3, o = life(T, a, cue('F3') + 0.2, 0.4, 0.5);
  if (o <= 0) return null;
  const cx = 600, cy = 470, r = 220;
  const hrs = 3 * Math.pow(prog(T, cue('F1', '一抬头'), end('F1') + 0.3 - cue('F1', '一抬头')), 1.6);
  const mA = hrs * 360, hA = hrs * 30 + 300;
  const hand = (ang: number, len: number, w: number, col: string) => { const t = (ang - 90) * Math.PI / 180; return <line x1={cx} y1={cy} x2={cx + len * Math.cos(t)} y2={cy + len * Math.sin(t)} stroke={col} strokeWidth={w} strokeLinecap="round" />; };
  const kb = sm(T, cue('F2') - 0.1, 0.7), kf = sm(T, cue('F2', '像') - 0.1, 0.5);
  return (
    <g opacity={o}>
      <Create d={`M${cx + r},${cy} A${r},${r} 0 1 1 ${cx + r - 0.01},${cy - 0.5}`} k={sm(T, a, 0.7)} stroke={C.white} w={4} />
      {Array.from({ length: 12 }, (_, i) => { const t = i * Math.PI / 6; return <line key={i} x1={cx + (r - 22) * Math.cos(t)} y1={cy + (r - 22) * Math.sin(t)} x2={cx + (r - 6) * Math.cos(t)} y2={cy + (r - 6) * Math.sin(t)} stroke={C.white} strokeWidth={i % 3 ? 2 : 4} opacity={sm(T, a + 0.3, 0.4)} />; })}
      {hand(hA, 110, 7, C.white)}{hand(mA, 170, 4, C.yellow)}
      <circle cx={cx} cy={cy} r={8} fill={C.yellow} />
      <Txt x={cx} y={cy + r + 80} size={44} font={F.math} fill={C.white} o={sm(T, a + 0.3, 0.4)}>{`+${hrs.toFixed(1)} h`}</Txt>
      {/* felt vs real */}
      <g opacity={kb}>
        <Txt x={1000} y={400} size={34} anchor="start" fill={C.grey}>实际</Txt>
        <rect x={1100} y={372} width={640 * kb} height={36} fill={C.blue} opacity={0.85} />
        <Txt x={1100 + 640 * kb + 16} y={401} size={32} anchor="start" font={F.math} fill={C.blue}>3 h</Txt>
      </g>
      <g opacity={kf}>
        <Txt x={1000} y={520} size={34} anchor="start" fill={C.grey}>感觉</Txt>
        <rect x={1100} y={492} width={36 * kf} height={36} fill={C.yellow} />
        <Txt x={1160} y={521} size={32} anchor="start" fill={C.yellow}>几分钟</Txt>
      </g>
    </g>
  );
};
/* the four activities as curves (panel-local, 0..1), resampled to N points so they can morph */
const N = 90;
const ACT: { key: string; label: string; col: string; f: (t: number) => P2 }[] = [
  { key: '下棋', label: '下棋', col: C.blue, f: (t) => { const P: P2[] = [[0.1, 0.85], [0.3, 0.85], [0.3, 0.55], [0.5, 0.55], [0.5, 0.25], [0.6, 0.25], [0.6, 0.45], [0.8, 0.45], [0.8, 0.15], [0.9, 0.15]]; const s = t * (P.length - 1), i = Math.min(P.length - 2, Math.floor(s)), u = s - i; return [lerp(P[i][0], P[i + 1][0], u), lerp(P[i][1], P[i + 1][1], u)]; } },
  { key: '攀岩', label: '攀岩', col: C.teal, f: (t) => [0.08 + 0.84 * t + 0.035 * Math.sin(t * 40), 0.88 - 0.76 * t + 0.07 * Math.sin(t * 23) * Math.sin(t * 7)] },
  { key: '跳舞', label: '跳舞', col: C.green, f: (t) => { const a = t * Math.PI * 2; return [0.5 + 0.38 * Math.sin(a), 0.5 + 0.3 * Math.sin(2 * a)]; } },
  { key: '手术', label: '手术', col: C.yellow, f: (t) => [0.06 + 0.88 * t, 0.5 + 0.22 * Math.sin(t * Math.PI * 9) * (1 - 0.3 * t)] },
];
const PANEL = [[700, 455], [1220, 455], [700, 765], [1220, 765]] as P2[];
const PW = 440, PH = 250;
const People: React.FC<{ T: number }> = ({ T }) => {
  const a = cue('F3') - 0.1, b = cue('C1') + 1.6;
  if (T < a || T > b + 0.5) return null;
  const merge = sm(T, cue('F4') + 0.1, 1.6);          // panel curves → horizontal waves
  const join = sm(T, cue('F4', '像') - 0.2, 1.4);      // waves → one stream
  const toDiag = sm(T, cue('C1') + 0.2, 1.4);          // stream → the diagonal of the chart
  const fadeOut = 1 - sm(T, cue('C4'), 0.6);
  const name = life(T, cue('F3'), cue('F4') + 0.6, 0.5, 0.5);
  // chart geometry (shared with the channel scene)
  const O: P2 = [CH.x0, CH.y0], E: P2 = [CH.x0 + CH.L, CH.y0 - CH.L];
  return (
    <g>
      <FadeUp k={name}>
        <Txt x={960} y={150} size={48} font={F.math} italic fill={C.white}>Mihaly Csikszentmihalyi</Txt>
        <Txt x={960} y={205} size={28} fill={C.grey}>契克森米哈赖 · 1934–2021</Txt>
      </FadeUp>
      {ACT.map((act, k) => {
        const at = cue('F3', act.key) - 0.15;
        const kp = sm(T, at, 0.5), kc = sm(T, at + 0.15, 1.0);
        if (kp <= 0) return null;
        const [pcx, pcy] = PANEL[k];
        const pts: P2[] = Array.from({ length: N + 1 }, (_, i) => {
          const t = i / N, [u, v] = act.f(t);
          const p0: P2 = [pcx - PW / 2 + u * PW, pcy - PH / 2 + v * PH];
          const x = 140 + 1640 * t, ph = T * 3.2;
          const wave: P2 = [x, 540 + (k - 1.5) * lerp(70, 13, join) + 26 * Math.sin(x * 0.009 - ph + k * lerp(1.1, 0.25, join))];
          const s = Math.sqrt(2) / 2, along = (t - 0.04) * CH.L * 1.08, off = 6 * Math.sin(t * 24 - T * 3 + k) + (k - 1.5) * 5;
          const diag: P2 = [O[0] + along * s * Math.SQRT2 * s + off * s, O[1] - along * s * Math.SQRT2 * s + off * s];
          const m1: P2 = [lerp(p0[0], wave[0], merge), lerp(p0[1], wave[1], merge)];
          return [lerp(m1[0], diag[0], toDiag), lerp(m1[1], diag[1], toDiag)];
        });
        const frameO = kp * (1 - merge);
        return (
          <g key={k} opacity={fadeOut}>
            {frameO > 0.01 && <rect x={pcx - PW / 2 - 20} y={pcy - PH / 2 - 20} width={PW + 40} height={PH + 40} rx={10} fill="none" stroke={C.dim} strokeWidth={2} opacity={frameO} />}
            <Txt x={pcx - PW / 2 - 4} y={pcy - PH / 2 - 34} size={30} anchor="start" fill={act.col} o={frameO}>{act.label}</Txt>
            <Create d={poly(pts)} k={kc} stroke={act.col} w={lerp(5, 3.5, join)} o={lerp(1, 0.9, join)} />
          </g>
        );
      })}
      <FadeUp k={life(T, cue('F5', '心流') - 0.2, cue('C1') + 0.3, 0.4, 0.4)}>
        <Txt x={960} y={420} size={64} fill={C.white}>心流</Txt>
        <Txt x={960} y={466} size={30} font={F.math} italic fill={C.grey}>flow · 1975</Txt>
      </FadeUp>
    </g>
  );
};

/* =========================== C: the channel =========================== */
export const CH = { x0: 550, y0: 950, L: 840, band: 70 };
const chPt = (s: number, c: number): P2 => [CH.x0 + s * CH.L, CH.y0 - c * CH.L];
/** the challenge × skill chart; `t` controls which parts are shown */
const Channel: React.FC<{ T: number; axes: number; hard: number; easy: number; band: number; labels: number; lab?: { hard?: string; easy?: string }; o?: number; quad?: number }> = ({ T, axes, hard, easy, band, labels, lab = {}, o = 1, quad = 0 }) => {
  if (o <= 0.001) return null;
  const O = chPt(0, 0), X = chPt(1.05, 0), Y = chPt(0, 1.05);
  const bw = CH.band / Math.SQRT2;
  const bandPoly = `M${CH.x0 + bw},${CH.y0} L${CH.x0 + CH.L},${CH.y0 - CH.L + bw} L${CH.x0 + CH.L},${CH.y0 - CH.L} L${CH.x0 + CH.L - bw},${CH.y0 - CH.L} L${CH.x0},${CH.y0 - bw} L${CH.x0},${CH.y0} Z`;
  return (
    <g opacity={o}>
      {hard > 0 && <path d={`M${CH.x0},${CH.y0 - bw} L${CH.x0 + CH.L - bw},${CH.y0 - CH.L} L${CH.x0},${CH.y0 - CH.L} Z`} fill={C.red} opacity={0.2 * hard} />}
      {easy > 0 && <path d={`M${CH.x0 + bw},${CH.y0} L${CH.x0 + CH.L},${CH.y0 - CH.L + bw} L${CH.x0 + CH.L},${CH.y0} Z`} fill={C.blue} opacity={0.18 * easy} />}
      {band > 0 && <path d={bandPoly} fill={C.yellow} opacity={0.2 * band} />}
      {band > 0 && <Create d={`M${CH.x0 + bw},${CH.y0} L${CH.x0 + CH.L},${CH.y0 - CH.L + bw}`} k={band} stroke={C.yellow} w={3} />}
      {band > 0 && <Create d={`M${CH.x0},${CH.y0 - bw} L${CH.x0 + CH.L - bw},${CH.y0 - CH.L}`} k={band} stroke={C.yellow} w={3} />}
      {quad > 0 && (
        <g opacity={quad}>
          <path d={`M${chPt(0.5, 0.5)[0]},${chPt(0.5, 0.5)[1]} H${chPt(1, 0)[0]} V${chPt(0, 1)[1]} H${chPt(0.5, 0)[0]} Z`} fill={C.yellow} opacity={0.14} />
          <line x1={chPt(0.5, 0)[0]} y1={CH.y0} x2={chPt(0.5, 0)[0]} y2={chPt(0, 1)[1]} stroke={C.white} strokeWidth={2} strokeDasharray="10 9" opacity={0.7} />
          <line x1={CH.x0} y1={chPt(0, 0.5)[1]} x2={chPt(1, 0)[0]} y2={chPt(0, 0.5)[1]} stroke={C.white} strokeWidth={2} strokeDasharray="10 9" opacity={0.7} />
        </g>
      )}
      <Create d={`M${O[0]},${O[1]} L${X[0]},${X[1]}`} k={axes} stroke={C.line} w={3} />
      <Create d={`M${O[0]},${O[1]} L${Y[0]},${Y[1]}`} k={axes} stroke={C.line} w={3} />
      {axes > 0.9 && <path d={`M${X[0] + 14},${X[1]} L${X[0] - 6},${X[1] - 9} L${X[0] - 6},${X[1] + 9} Z`} fill={C.line} />}
      {axes > 0.9 && <path d={`M${Y[0]},${Y[1] - 14} L${Y[0] - 9},${Y[1] + 6} L${Y[0] + 9},${Y[1] + 6} Z`} fill={C.line} />}
      <Txt x={X[0] + 30} y={X[1] + 14} size={42} anchor="start" o={labels}>能力</Txt>
      <Txt x={Y[0] - 70} y={Y[1] + 30} size={42} o={labels}>挑战</Txt>
      <Txt x={chPt(0.26, 0.74)[0]} y={chPt(0.26, 0.74)[1]} size={60} fill={C.red} o={hard * (lab.hard ? 0 : 1)}>焦虑</Txt>
      <Txt x={chPt(0.26, 0.74)[0]} y={chPt(0.26, 0.74)[1]} size={60} fill={C.red} o={hard * (lab.hard ? 1 : 0)}>{lab.hard ?? ''}</Txt>
      <Txt x={chPt(0.74, 0.24)[0]} y={chPt(0.74, 0.24)[1]} size={60} fill={C.blue} o={easy * (lab.easy ? 0 : 1)}>无聊</Txt>
      <Txt x={chPt(0.74, 0.24)[0]} y={chPt(0.74, 0.24)[1]} size={60} fill={C.blue} o={easy * (lab.easy ? 1 : 0)}>{lab.easy ?? ''}</Txt>
      <g transform={`translate(${chPt(0.6, 0.6)[0] + 26},${chPt(0.6, 0.6)[1] - 26}) rotate(-45)`} opacity={band}>
        <Txt x={0} y={14} size={44} fill={C.yellow}>心流</Txt>
      </g>
    </g>
  );
};
/** the staircase: skill up, then challenge up, staying in the band */
const stairPts = (n: number): P2[] => {
  const p: P2[] = [[0.06, 0.06]]; const st = 0.11;
  for (let i = 0; i < n; i++) { const [s, c] = p[p.length - 1]; p.push([s + st, c]); p.push([s + st, c + st]); }
  return p.map(([s, c]) => chPt(s, c));
};
const Stair: React.FC<{ T: number; a: number; d: number; o?: number; steps?: number }> = ({ T, a, d, o = 1, steps = 7 }) => {
  const k = sm(T, a, d); if (k <= 0 || o <= 0) return null;
  const P = stairPts(steps), seg = (P.length - 1) * k, i = Math.min(P.length - 2, Math.floor(seg)), u = seg - i;
  const dot: P2 = [lerp(P[i][0], P[i + 1][0], u), lerp(P[i][1], P[i + 1][1], u)];
  return (
    <g opacity={o}>
      <Create d={poly(P)} k={k} stroke={C.white} w={4} />
      <circle cx={dot[0]} cy={dot[1]} r={13} fill={C.yellow} />
    </g>
  );
};
const ChannelScene: React.FC<{ T: number }> = ({ T }) => {
  const a = cue('C1'), out = cue('W1') - 0.4;
  if (T < a || T > out + 0.6) return null;
  const o = 1 - sm(T, out, 0.5);
  return (
    <g>
      <Channel T={T} o={o} axes={sm(T, a + 0.4, 0.9)} labels={sm(T, cue('C1', '挑战') - 0.1, 0.5)} hard={sm(T, cue('C2') - 0.1, 0.6)} easy={sm(T, cue('C3') - 0.1, 0.6)} band={sm(T, cue('C4', '刚好') - 0.1, 0.8)} />
      <Stair T={T} a={cue('C5')} d={end('C5') - cue('C5') + 0.2} o={o} />
    </g>
  );
};

/* =========================== W: why 85 % — two overlapping bells =========================== */
const BX = { mid: 600, y: 730, s: 92, amp: 300, x0: 90, x1: 1110 };
const delta = (T: number) => {
  const keys: [number, number][] = [[cue('W2'), 140], [cue('W4'), 140], [cue('W4') + 1.4, 300], [cue('W5'), 300], [cue('W5') + 1.2, 34], [cue('W6'), 34], [cue('W6') + 1.4, 330], [cue('W7') - 0.3, 330], [cue('W7') + 1.0, BX.s]];
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) { const [ta, va] = keys[i - 1], [tb, vb] = keys[i]; if (T >= ta) v = lerp(va, vb, smooth(prog(T, ta, tb - ta))); }
  return v;
};
const MG = { x0: 1190, x1: 1760, y0: 820, h: 360 };       // mini graph: learning speed vs accuracy
const mgX = (a: number) => MG.x0 + (MG.x1 - MG.x0) * (a - 0.5) / 0.5;
const mgY = (a: number) => MG.y0 - MG.h * learnRate(a);
const Bells: React.FC<{ T: number }> = ({ T }) => {
  const a = cue('W1') - 0.2, out = cue('R1') - 0.55;
  if (T < a || T > out + 0.8) return null;
  const o = 1 - sm(T, out, 0.5);
  const dl = delta(T), muA = BX.mid - dl, muB = BX.mid + dl;
  const kB = sm(T, cue('W2') - 0.1, 1.0);
  const bell = (mu: number) => poly(Array.from({ length: 161 }, (_, i) => { const x = BX.x0 + (BX.x1 - BX.x0) * i / 160; return [x, BX.y - BX.amp * gauss(x, mu, BX.s)] as P2; }));
  const tail = (mu: number, side: 1 | -1) => {
    const xs = Array.from({ length: 81 }, (_, i) => (side > 0 ? BX.mid + (BX.x1 - BX.mid) * i / 80 : BX.x0 + (BX.mid - BX.x0) * i / 80));
    return `M${xs[0]},${BX.y} ` + xs.map((x) => `L${x.toFixed(1)},${(BX.y - BX.amp * gauss(x, mu, BX.s)).toFixed(1)}`).join(' ') + ` L${xs[xs.length - 1]},${BX.y} Z`;
  };
  const err = Phi(-dl / BX.s), acc = 1 - err;
  const kErr = sm(T, cue('W3') - 0.1, 0.7), kMini = sm(T, cue('W4') + 0.3, 0.9);
  const atPeak = there(T, cue('W7', '正好') - 0.1, 0.5);
  const kSigma = life(T, cue('W7') + 0.9, out, 0.5, 0.4);
  return (
    <g opacity={o}>
      <FadeUp k={life(T, cue('W1') - 0.25, cue('W1', '看') - 0.05, 0.35, 0.3)}>
        <Txt x={960} y={560} size={130} font={F.math} fill={C.yellow}>85%</Txt>
        <Txt x={960} y={660} size={56} fill={C.white}>为什么偏偏是它？</Txt>
      </FadeUp>
      <FadeUp k={life(T, cue('W1', '看') - 0.1, cue('W2') + 1.2, 0.4, 0.5)}>
        <Txt x={960} y={300} size={72} fill={C.white}>A 还是 B ？</Txt>
        <Txt x={960} y={360} size={30} fill={C.grey}>一道二选一的题</Txt>
      </FadeUp>
      <Create d={`M${BX.x0},${BX.y} L${BX.x1},${BX.y}`} k={kB} stroke={C.line} w={3} />
      <Txt x={BX.x1} y={BX.y + 46} size={28} anchor="end" fill={C.grey} o={kB}>脑子里的印象</Txt>
      {kErr > 0 && <path d={tail(muA, 1)} fill={C.red} opacity={0.6 * kErr} />}
      {kErr > 0 && <path d={tail(muB, -1)} fill={C.red} opacity={0.6 * kErr} />}
      {kB > 0.98 && <path d={`${bell(muA)} L${BX.x1},${BX.y} L${BX.x0},${BX.y} Z`} fill={C.teal} opacity={0.12} />}
      {kB > 0.98 && <path d={`${bell(muB)} L${BX.x1},${BX.y} L${BX.x0},${BX.y} Z`} fill={C.purple} opacity={0.12} />}
      <Create d={bell(muA)} k={kB} stroke={C.teal} w={5} />
      <Create d={bell(muB)} k={kB} stroke={C.purple} w={5} />
      <Txt x={muA} y={BX.y - BX.amp - 24} size={52} font={F.math} fill={C.teal} o={kB}>A</Txt>
      <Txt x={muB} y={BX.y - BX.amp - 24} size={52} font={F.math} fill={C.purple} o={kB}>B</Txt>
      {kErr > 0 && <line x1={BX.mid} y1={BX.y + 10} x2={BX.mid} y2={BX.y - BX.amp - 60} stroke={C.white} strokeWidth={2} strokeDasharray="8 8" opacity={0.7 * kErr} />}
      <g opacity={kErr}>
        <Txt x={BX.x0} y={250} size={40} anchor="start" fill={C.red}>答错</Txt>
        <Txt x={BX.x0 + 100} y={252} size={56} anchor="start" font={F.math} fill={C.red}>{`${(err * 100).toFixed(1)}%`}</Txt>
        <Txt x={BX.x0} y={320} size={40} anchor="start" fill={C.white}>答对</Txt>
        <Txt x={BX.x0 + 100} y={322} size={56} anchor="start" font={F.math} fill={atPeak > 0.5 ? C.yellow : C.white}>{`${(acc * 100).toFixed(1)}%`}</Txt>
      </g>
      <Txt x={BX.mid} y={BX.y - 60} size={38} fill={C.white} o={life(T, cue('W5') + 0.5, cue('W6') - 0.1, 0.3, 0.3)}>分不清</Txt>
      <Txt x={BX.mid} y={BX.y - 60} size={38} fill={C.white} o={life(T, cue('W6') + 0.8, cue('W7') - 0.2, 0.3, 0.3)}>不会错</Txt>
      {/* 1σ brace: the dividing line sits exactly one standard deviation from each centre */}
      {kSigma > 0 && (
        <g opacity={kSigma}>
          <path d={brace(muA, BX.mid, BX.y + 18, 22)} stroke={C.yellow} strokeWidth={3} fill="none" />
          <Txt x={(muA + BX.mid) / 2} y={BX.y + 84} size={40} font={F.math} italic fill={C.yellow}>1σ</Txt>
        </g>
      )}
      {/* mini graph */}
      <g opacity={kMini}>
        <line x1={MG.x0} y1={MG.y0} x2={MG.x1 + 20} y2={MG.y0} stroke={C.line} strokeWidth={3} />
        <line x1={MG.x0} y1={MG.y0} x2={MG.x0} y2={MG.y0 - MG.h - 40} stroke={C.line} strokeWidth={3} />
        {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((v) => <Txt key={v} x={mgX(v)} y={MG.y0 + 40} size={24} font={F.math} fill={C.grey}>{`${Math.round(v * 100)}%`}</Txt>)}
        <Txt x={MG.x0 + 14} y={MG.y0 - MG.h - 24} size={26} anchor="start" fill={C.grey}>学得多快</Txt>
        <Txt x={MG.x1 + 20} y={MG.y0 + 80} size={26} anchor="end" fill={C.grey}>正确率</Txt>
        <Create d={poly(Array.from({ length: 101 }, (_, i) => { const a2 = 0.5 + 0.5 * i / 100; return [mgX(a2), mgY(a2)] as P2; }))} k={kMini} stroke={C.blue} w={4} o={0.85} />
        <circle cx={mgX(clamp(acc, 0.5, 1))} cy={mgY(clamp(acc, 0.5, 1))} r={11} fill={C.yellow} />
        {atPeak > 0 && <line x1={mgX(ACC_STAR)} y1={mgY(ACC_STAR)} x2={mgX(ACC_STAR)} y2={MG.y0} stroke={C.yellow} strokeWidth={2} strokeDasharray="8 8" opacity={atPeak} />}
        {atPeak > 0 && <Txt x={mgX(ACC_STAR)} y={mgY(ACC_STAR) - 34} size={40} font={F.math} fill={C.yellow} o={atPeak}>≈ 85%</Txt>}
        <SurRect x={mgX(ACC_STAR) - 82} y={mgY(ACC_STAR) - 78} w={164} h={58} k={there(T, cue('W7', '八十五') - 0.1, 0.5)} />
      </g>
    </g>
  );
};

/* =========================== R: the ridge — learning speed over (skill, challenge), then from above =========================== */
const RS = { cx: CH.x0 + CH.L / 2, cy: CH.y0 - CH.L / 2, L: CH.L, Hh: 330 };
const surfH = (s: number, c: number) => learnRate(Phi(1 + 3.4 * (s - c)));
const Ridge: React.FC<{ T: number }> = ({ T }) => {
  const a = cue('R1') - 0.15, out = cue('P1') + 0.2;
  if (T < a || T > out + 0.8) return null;
  const o = sm(T, a, 0.6) * (1 - sm(T, out, 0.6));
  const rise = sm(T, cue('R1', '高度') - 0.3, 1.6);
  const top = sm(T, cue('R3') - 0.25, DROP2 - cue('R3') + 0.75);   // lands just after drop 2
  const th = lerp(-0.92 + 0.18 * sm(T, cue('R2'), 2.4), 0, top);    // azimuth
  const ph = lerp(0.62, Math.PI / 2, top);                            // elevation
  const Hh = RS.Hh * rise;
  const proj = (s: number, c: number, h: number): [number, number, number] => {
    const X = (s - 0.5) * RS.L, Y = (c - 0.5) * RS.L, Z = h * Hh;
    const x1 = X * Math.cos(th) - Y * Math.sin(th), y1 = X * Math.sin(th) + Y * Math.cos(th);
    const scale = lerp(0.82, 1, top);
    return [RS.cx + x1 * scale, RS.cy - (y1 * Math.sin(ph) + Z * Math.cos(ph)) * scale, y1 * Math.cos(ph) - Z * Math.sin(ph)];
  };
  const n = 34, quads: { d: string; z: number; col: string }[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const s0 = i / n, s1 = (i + 1) / n, c0 = j / n, c1 = (j + 1) / n;
    const hc = surfH((s0 + s1) / 2, (c0 + c1) / 2);
    const P = [proj(s0, c0, surfH(s0, c0)), proj(s1, c0, surfH(s1, c0)), proj(s1, c1, surfH(s1, c1)), proj(s0, c1, surfH(s0, c1))];
    const z = (P[0][2] + P[1][2] + P[2][2] + P[3][2]) / 4;
    const chk = (i + j) % 2 ? 0.9 : 1;
    const t = hc;
    const r = Math.round(lerp(lerp(0x1A, 0x58, clamp(t * 1.6)), 0xFF, clamp((t - 0.6) / 0.4)) * chk), g = Math.round(lerp(lerp(0x3A, 0xC4, clamp(t * 1.6)), 0xFF, clamp((t - 0.6) / 0.4)) * chk), b = Math.round(lerp(lerp(0x5A, 0xDD, clamp(t * 1.6)), 0x40, clamp((t - 0.6) / 0.4)) * chk);
    quads.push({ d: `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)} L${P[1][0].toFixed(1)},${P[1][1].toFixed(1)} L${P[2][0].toFixed(1)},${P[2][1].toFixed(1)} L${P[3][0].toFixed(1)},${P[3][1].toFixed(1)} Z`, z, col: `rgb(${r},${g},${b})` });
  }
  quads.sort((p, q) => q.z - p.z);
  const ax = (s: number, c: number, h: number) => { const p = proj(s, c, h); return [p[0], p[1]] as P2; };
  const O = ax(0, 0, 0), Xa = ax(1.08, 0, 0), Ya = ax(0, 1.08, 0), Za = ax(0, 0, 1.15);
  const ridgeK = sm(T, cue('R2', '山脊') - 0.4, 1.0) * (1 - top);
  const ridge = poly(Array.from({ length: 41 }, (_, i) => ax(i / 40, i / 40, surfH(i / 40, i / 40) + 0.01)));
  const over = sm(T, cue('R4') - 0.1, 0.6);
  return (
    <g opacity={o}>
      {quads.map((q, i) => <path key={i} d={q.d} fill={q.col} stroke="#0C0C0E" strokeWidth={0.6} strokeOpacity={0.35} opacity={0.96} />)}
      <Create d={ridge} k={ridgeK} stroke={C.yellow} w={5} o={ridgeK > 0 ? 1 : 0} />
      <line x1={O[0]} y1={O[1]} x2={Xa[0]} y2={Xa[1]} stroke={C.line} strokeWidth={3} />
      <line x1={O[0]} y1={O[1]} x2={Ya[0]} y2={Ya[1]} stroke={C.line} strokeWidth={3} />
      <line x1={O[0]} y1={O[1]} x2={Za[0]} y2={Za[1]} stroke={C.line} strokeWidth={3} opacity={1 - top} />
      <Txt x={Xa[0] + 30} y={Xa[1] + 12} size={36} anchor="start">能力</Txt>
      <Txt x={lerp(Ya[0], Ya[0] - 70, top)} y={lerp(Ya[1] - 30, Ya[1] + 60, top)} size={lerp(36, 42, top)}>挑战</Txt>
      <Txt x={Za[0]} y={Za[1] - 24} size={32} fill={C.yellow} o={(1 - top) * rise}>学得多快</Txt>
      <Txt x={1820} y={980} size={22} anchor="end" fill={C.grey} o={0.8 * (1 - top)}>示意</Txt>
      {/* from above it is the channel */}
      <Channel T={T} axes={0} hard={over} easy={over} band={over} labels={0} o={over} />
    </g>
  );
};

/* =========================== P: the pager study (work vs leisure) =========================== */
type Ev = { t: number; pager: number; work: boolean; s: number; c: number; flow: boolean };
const EVENTS: Ev[] = (() => {
  const r = rnd(77); const ev: Ev[] = [];
  const t0 = cue('P3') - 0.2, t1 = cue('P4') - 0.25;
  const NW = 150, NL2 = 100; const flowW = Math.round(NW * 0.54), flowL = Math.round(NL2 * 0.17);
  const mk = (work: boolean, flow: boolean): Ev => {
    let s = 0, c = 0;
    do { s = r(); c = r(); } while ((s > 0.5 && c > 0.5) !== flow || Math.abs(s - c) > 0.55);
    return { t: t0 + (t1 - t0) * r(), pager: Math.floor(r() * 78), work, s: 0.06 + 0.88 * s, c: 0.06 + 0.88 * c, flow };
  };
  for (let i = 0; i < NW; i++) ev.push(mk(true, i < flowW));
  for (let i = 0; i < NL2; i++) ev.push(mk(false, i < flowL));
  return ev.sort((a, b) => a.t - b.t);
})();
const PG = { x0: 150, y0: 330, dx: 52, dy: 52, cols: 13 };
const pagerPt = (i: number): P2 => [PG.x0 + (i % PG.cols) * PG.dx, PG.y0 + Math.floor(i / PG.cols) * PG.dy];
const BARS = { work: 330, leis: 640, base: 860, h: 480, w: 170 };
const Pagers: React.FC<{ T: number }> = ({ T }) => {
  const a = cue('P1') - 0.2, out = cue('G1') - 0.3;
  if (T < a || T > out + 0.8) return null;
  const o = 1 - sm(T, out, 0.6);
  // the chart moves to the right half
  const slide = sm(T, cue('P1') + 0.2, 1.2);
  const S = lerp(1, 0.66, slide), tx = lerp(0, 1395 - (CH.x0 + CH.L / 2) * 0.66, slide) + (1 - slide) * 0, ty = lerp(0, 540 - (CH.y0 - CH.L / 2) * 0.66, slide);
  const chartXY = (s: number, c: number): P2 => { const [x, y] = chPt(s, c); return [x * S + tx, y * S + ty]; };
  const kGrid = sm(T, cue('P2') - 0.1, 0.7);
  const kQuad = sm(T, cue('P3', '挑战') - 0.2, 0.7) * (1 - sm(T, cue('P4') + 0.3, 0.6));
  const toBars = sm(T, cue('P4') - 0.1, 1.1);
  const kWork = sm(T, cue('P4', '百分之五十四') - 0.2, 0.9), kLeis = sm(T, cue('P5', '百分之十七') - 0.2, 0.9);
  const chartO = 1 - sm(T, cue('P7') - 0.3, 0.6);
  const gridO = kGrid * (1 - sm(T, cue('P4') - 0.3, 0.5));
  const day = Math.min(7, 1 + Math.floor(7 * prog(T, cue('P3') - 0.2, cue('P4') - cue('P3'))));
  const r = rnd(5);
  const slots = { wF: 0, wN: 0, lF: 0, lN: 0 };
  const flowFrac = { work: 0.54, leis: 0.17 };
  return (
    <g opacity={o}>
      <g transform={`translate(${tx},${ty}) scale(${S})`} opacity={chartO}>
        <Channel T={T} axes={1} hard={1 - 0.6 * kQuad} easy={1 - 0.6 * kQuad} band={1 - 0.6 * kQuad} labels={1} quad={kQuad} />
      </g>
      <Txt x={chartXY(0.5, 1.0)[0]} y={chartXY(0.5, 1.0)[1] - 50} size={32} fill={C.yellow} o={kQuad * chartO}>心流 = 挑战、能力都高于自己的平均</Txt>
      {/* pagers */}
      <g opacity={gridO}>
        <Txt x={PG.x0 - 20} y={PG.y0 - 70} size={38} anchor="start">芝加哥 · <tspan fontFamily={F.math}>78</tspan> 位上班族</Txt>
        <Txt x={PG.x0 - 20} y={PG.y0 + 6 * PG.dy + 36} size={28} anchor="start" fill={C.grey}>{`第 ${day} 天 · 每人一周约 56 次`}</Txt>
        {Array.from({ length: 78 }, (_, i) => {
          const [x, y] = pagerPt(i);
          const last = EVENTS.filter((e) => e.pager === i && e.t <= T).slice(-1)[0];
          const fl = last ? Math.exp(-(T - last.t) * 5) : 0;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={13} fill="none" stroke={fl > 0.05 ? C.yellow : C.grey} strokeWidth={2.5} opacity={sm(T, cue('P2') + i * 0.012, 0.3)} />
              {fl > 0.03 && <circle cx={x} cy={y} r={13 + 22 * (1 - fl)} fill="none" stroke={C.yellow} strokeWidth={2} opacity={fl} />}
            </g>
          );
        })}
      </g>
      {/* answers flying in, then into the bars */}
      {EVENTS.map((e, i) => {
        if (T < e.t) return null;
        const fly = smooth(prog(T, e.t, 0.45));
        const src = pagerPt(e.pager), dst = chartXY(e.s, e.c);
        const mid: P2 = [(src[0] + dst[0]) / 2, Math.min(src[1], dst[1]) - 120];
        const u = fly, pt: P2 = [(1 - u) * (1 - u) * src[0] + 2 * (1 - u) * u * mid[0] + u * u * dst[0], (1 - u) * (1 - u) * src[1] + 2 * (1 - u) * u * mid[1] + u * u * dst[1]];
        // bar slot
        const isW = e.work, flow = e.flow;
        const key = isW ? (flow ? 'wF' : 'wN') : (flow ? 'lF' : 'lN');
        const idx = (slots as Record<string, number>)[key]++;
        const bx = isW ? BARS.work : BARS.leis, frac = isW ? flowFrac.work : flowFrac.leis;
        const nTot = isW ? 150 : 100, nFlow = Math.round(nTot * frac);
        const cols = 10, rowH = BARS.h / Math.ceil(nTot / cols);
        const n0 = flow ? idx : nFlow + idx;
        const tgt: P2 = [bx - BARS.w / 2 + (n0 % cols + 0.5) * BARS.w / cols + (r() - 0.5) * 2, BARS.base - (Math.floor(n0 / cols) + 0.5) * rowH];
        const kb = smooth(clamp((toBars - (i / EVENTS.length) * 0.4) / 0.6));
        const p: P2 = [lerp(pt[0], tgt[0], kb), lerp(pt[1], tgt[1], kb)];
        const col = isW ? C.gold : C.blue;
        const show = isW ? 1 : 1;
        const fillO = Math.max(isW ? kWork : kLeis, 0);
        return <circle key={i} cx={p[0]} cy={p[1]} r={lerp(6, 5, kb)} fill={flow && kb > 0.5 ? (fillO > 0.5 ? C.yellow : col) : col} opacity={show * (kb > 0.5 && !flow ? 0.35 : 0.9) * chartO} />;
      })}
      {/* bars */}
      <g opacity={toBars * chartO}>
        {(['work', 'leis'] as const).map((k) => {
          const bx = BARS[k], frac = flowFrac[k], kk = k === 'work' ? kWork : kLeis;
          return (
            <g key={k}>
              <rect x={bx - BARS.w / 2 - 8} y={BARS.base - BARS.h - 8} width={BARS.w + 16} height={BARS.h + 8} fill="none" stroke={C.dim} strokeWidth={2} />
              <line x1={bx - BARS.w / 2 - 20} y1={BARS.base - BARS.h * frac} x2={bx + BARS.w / 2 + 20} y2={BARS.base - BARS.h * frac} stroke={C.yellow} strokeWidth={3} opacity={kk} />
              <Txt x={bx} y={BARS.base - BARS.h - 36} size={64} font={F.math} fill={C.yellow} o={kk}>{`${Math.round(frac * 100 * kk)}%`}</Txt>
              <Txt x={bx} y={BARS.base + 56} size={38} fill={k === 'work' ? C.gold : C.blue}>{k === 'work' ? '上班' : '下班'}</Txt>
            </g>
          );
        })}
        <Txt x={(BARS.work + BARS.leis) / 2} y={BARS.base + 108} size={26} fill={C.grey}>处在心流里的时刻</Txt>
      </g>
      {/* the paradox */}
      <g opacity={life(T, cue('P6') - 0.1, cue('P7') + 0.2, 0.5, 0.4)}>
        <Arrow a={[BARS.work + 150, BARS.base - BARS.h - 10]} b={[BARS.work + 150, BARS.base - BARS.h - 150]} k={sm(T, cue('P6'), 0.6)} color={C.red} />
        <Txt x={BARS.work + 190} y={BARS.base - BARS.h - 110} size={36} anchor="start" fill={C.red}>却更常想去做别的事</Txt>
      </g>
      {/* TV */}
      <TV T={T} />
      <Txt x={56} y={64} size={22} anchor="start" fill={C.grey} font={F.math} italic o={life(T, cue('P2'), cue('P7'), 0.4, 0.4) * 0.85}>Csikszentmihalyi &amp; LeFevre · J. Personality and Social Psychology · 1989</Txt>
    </g>
  );
};
const TV: React.FC<{ T: number }> = ({ T }) => {
  const k = life(T, cue('P7') - 0.2, cue('G1') - 0.2, 0.6, 0.5);
  if (k <= 0) return null;
  const x = 1140, y = 330;
  const m1 = sm(T, cue('P7', '放松') - 0.1, 0.7), m2 = sm(T, cue('P7', '被动') - 0.1, 0.7);
  return (
    <g opacity={k}>
      <Create d={`M${x},${y} h360 v230 h-360 Z`} k={sm(T, cue('P7') - 0.2, 0.8)} stroke={C.white} w={5} />
      <Create d={`M${x + 130},${y - 70} L${x + 180},${y} L${x + 240},${y - 80}`} k={sm(T, cue('P7'), 0.6)} stroke={C.white} w={4} />
      <Create d={`M${x + 120},${y + 290} L${x + 240},${y + 290}`} k={sm(T, cue('P7'), 0.6)} stroke={C.white} w={5} />
      <Txt x={x - 200} y={y + 420} size={34} anchor="start" fill={C.white}>放松</Txt>
      <rect x={x - 90} y={y + 392} width={560 * 0.85 * m1} height={34} fill={C.green} />
      <Txt x={x - 200} y={y + 490} size={34} anchor="start" fill={C.white}>主动</Txt>
      <rect x={x - 90} y={y + 462} width={560 * 0.18 * m2} height={34} fill={C.red} />
      <Txt x={x + 470} y={y + 540} size={22} anchor="end" fill={C.grey} o={m2}>示意 · Kubey &amp; Csikszentmihalyi 2002</Txt>
    </g>
  );
};

/* =========================== G + E: games keep you on the line; the ending =========================== */
const Games: React.FC<{ T: number }> = ({ T }) => {
  const a = cue('G1') - 0.3, out = cue('E3') - 0.2;
  if (T < a || T > out + 0.8) return null;
  const o = sm(T, a, 0.6) * (1 - sm(T, out, 0.6));
  const kS = sm(T, cue('G2') - 0.1, end('G2') - cue('G2') + 0.4);
  // level line: a short bar just above the dot that steps up as the player gets better
  const P = stairPts(7), seg = (P.length - 1) * kS, i = Math.min(P.length - 2, Math.floor(seg)), u = seg - i;
  const dot: P2 = [lerp(P[i][0], P[i + 1][0], u), lerp(P[i][1], P[i + 1][1], u)];
  const lab = { hard: sm(T, cue('E1', '硬撑') - 0.1, 0.5) > 0.5 ? '硬撑' : undefined, easy: sm(T, cue('E1', '躺平') - 0.1, 0.5) > 0.5 ? '躺平' : undefined };
  const glow = sm(T, cue('E2') - 0.1, 0.6);
  return (
    <g opacity={o}>
      <Channel T={T} axes={1} hard={1} easy={1} band={1 + 0.0 * glow} labels={1} lab={lab} />
      {glow > 0 && <path d={`M${chPt(0.04, 0)[0]},${chPt(0.04, 0)[1]} L${chPt(1, 0.96)[0]},${chPt(1, 0.96)[1]} L${chPt(0.96, 1)[0]},${chPt(0.96, 1)[1]} L${chPt(0, 0.04)[0]},${chPt(0, 0.04)[1]} Z`} fill={C.yellow} opacity={0.25 * glow * (0.75 + 0.25 * Math.sin(T * 5))} />}
      {kS > 0 && <Create d={poly(P)} k={kS} stroke={C.white} w={4} />}
      {kS > 0 && <line x1={dot[0] - 40} y1={dot[1] - 44} x2={dot[0] + 40} y2={dot[1] - 44} stroke={C.red} strokeWidth={5} opacity={0.9 * (1 - glow)} />}
      {kS > 0 && <Txt x={dot[0] + 54} y={dot[1] - 34} size={30} anchor="start" fill={C.red} o={(1 - glow) * sm(T, cue('G2', '差一点点') - 0.1, 0.4)}>差一点点</Txt>}
      <circle cx={kS > 0 ? dot[0] : chPt(0.06, 0.06)[0]} cy={kS > 0 ? dot[1] : chPt(0.06, 0.06)[1]} r={13 + 5 * glow * (0.5 + 0.5 * Math.sin(T * 6))} fill={C.yellow} />
      <Txt x={chPt(1.0, 0.6)[0]} y={chPt(1.0, 0.6)[1]} size={44} fill={C.yellow} o={glow}>刚刚好难</Txt>
    </g>
  );
};
const Ending: React.FC<{ T: number }> = ({ T }) => {
  const a = cue('E3') - 0.2, out = cue('E4') - 0.1;
  const o = life(T, a, out + 0.2, 0.6, 0.5);
  const q = life(T, cue('E4') - 0.1, TL.vo_end + 0.7, 0.5, 0.5);
  const lo = 0, y = 600;
  const mx = px(lerp(0.5, 0.85, sm(T, a + 0.3, 0.9)), lo);
  return (
    <g>
      {o > 0 && (
        <g opacity={o}>
          <line x1={NL.x0 - 30} y1={y} x2={NL.x1 + 40} y2={y} stroke={C.line} strokeWidth={3} />
          {Array.from({ length: 11 }, (_, i) => i / 10).map((v) => <g key={v}><line x1={px(v, lo)} y1={y - 10} x2={px(v, lo)} y2={y + 10} stroke={C.line} strokeWidth={3} /><Txt x={px(v, lo)} y={y + 60} size={42} font={F.math}>{`${Math.round(v * 100)}%`}</Txt></g>)}
          <g transform={`translate(${mx},${y - 26})`}><path d="M0,0 L-15,-24 L15,-24 Z" fill={C.yellow} /><Txt x={0} y={-50} size={96} font={F.math} fill={C.yellow}>{`${Math.round((mx - NL.x0) / (NL.x1 - NL.x0) * 100)}%`}</Txt></g>
          <path d={brace(px(0.85, lo), px(1, lo), y + 80, 26)} stroke={C.red} strokeWidth={3} fill="none" opacity={sm(T, cue('E3', '错') - 0.2, 0.5)} />
          <Txt x={(px(0.85, lo) + px(1, lo)) / 2} y={y + 170} size={50} fill={C.red} o={sm(T, cue('E3', '错') - 0.2, 0.5)}>错一两成</Txt>
        </g>
      )}
      {q > 0 && (
        <g opacity={q}>
          <Write x={960} y={500} k={sm(T, cue('E4') - 0.05, 0.9)} size={72}>你最近一次忘了时间，</Write>
          <Write x={960} y={610} k={sm(T, cue('E4', '是在') - 0.1, 0.8)} size={72} fill={C.yellow}>是在做什么？</Write>
        </g>
      )}
    </g>
  );
};

/* =========================== end card =========================== */
const SOURCES = 'Wilson et al. 2019, Nat. Commun. 10:4646 · Csikszentmihalyi & LeFevre 1989, JPSP 56:815 · Csikszentmihalyi 1975, Beyond Boredom and Anxiety · Nakamura & Csikszentmihalyi 2002 · Kubey & Csikszentmihalyi 2002, Sci. Am.';
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const a = TL.vo_end + 0.5;
  if (T < a) return null;
  const k = sm(T, a, 0.7), fade = 1 - sm(T, FILM_END - 0.6, 0.6);
  const ring = sm(T, a + 0.1, 0.9);
  return (
    <g opacity={k * fade}>
      <Create d={`M${960 + 64},${290} A64,64 0 1 1 ${960 + 63.99},${289.5}`} k={ring} stroke={C.yellow} w={5} />
      <Txt x={960} y={312} size={66} weight={900} fill={C.white}>J</Txt>
      <Txt x={960} y={398} size={20} font={F.mono} ls="0.5em" fill={C.grey}>JUNO</Txt>
      <Write x={960} y={540} k={sm(T, a + 0.3, 0.7)} size={110} font={'"Noto Serif CJK SC", serif'} weight={700} ls="0.1em" w={400}>心流</Write>
      <Txt x={960} y={650} size={40} fill={C.white} o={sm(T, a + 0.8, 0.5)}>你最近一次忘了时间，是在做什么？</Txt>
      <Txt x={960} y={706} size={26} fill={C.grey} o={sm(T, a + 1.0, 0.5)}>@ 那个总说「学不进去」的朋友</Txt>
      <g opacity={sm(T, a + 1.2, 0.5)}>
        <rect x={960 - 300} y={752} width={600} height={60} rx={30} fill="none" stroke={C.yellow} strokeWidth={2.5} />
        <Txt x={960} y={792} size={28} fill={C.yellow} ls="0.12em">关注 Juno · 每期一个反直觉的知识</Txt>
      </g>
      <Txt x={960} y={1010} size={16} font={F.math} fill={C.grey} o={0.8 * sm(T, a + 1.4, 0.5)}>{SOURCES}</Txt>
    </g>
  );
};

/* =========================== captions + corner mark =========================== */
const Captions: React.FC<{ T: number }> = ({ T }) => {
  const s = (TL.segs as Seg[]).find((g) => T >= g.t0 - 0.05 && T < g.t1 + 0.12);
  if (!s || s.id === 'T1') return null;
  const o = Math.min(prog(T, s.t0 - 0.05, 0.12), 1 - prog(T, s.t1 + 0.0, 0.12));
  const txt = s.cap.replace(/[；，。：、]$/, '');
  return <div style={{ position: 'absolute', left: 0, right: 0, bottom: 52, textAlign: 'center', opacity: o, fontFamily: F.zh, fontSize: 36, fontWeight: 500, letterSpacing: '0.04em', color: 'rgba(236,236,236,.92)', textShadow: '0 0 10px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.9)' }}>{txt}</div>;
};

export const Ep13Film: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / 30;
  const cam = hookCam(T);
  const camT = T < DROP1 ? `translate(${cam.cx},${cam.cy}) scale(${cam.s}) translate(${-cam.cx},${-cam.cy})` : undefined;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <FontFaces />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform={camT}><Hook T={T} /></g>
        <Title T={T} />
        <Clock T={T} />
        <People T={T} />
        <ChannelScene T={T} />
        <Bells T={T} />
        <Ridge T={T} />
        <Pagers T={T} />
        <Games T={T} />
        <Ending T={T} />
        <EndCard T={T} />
      </svg>
      <div style={{ position: 'absolute', top: 40, right: 52, fontFamily: F.zh, fontWeight: 700, fontSize: 19, letterSpacing: '0.26em', color: 'rgba(236,236,236,.5)' }}>
        <span style={{ fontFamily: F.mono, color: C.yellow }}>▸ </span>Juno<span style={{ color: C.yellow }}> · </span>VIBE知识大赏
      </div>
      <Captions T={T} />
    </AbsoluteFill>
  );
};

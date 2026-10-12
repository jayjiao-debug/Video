/* The documentary scenes: archive paper, hairline data graphics, name cards, the end card. T = track seconds. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, W, H, BAR, LNUM, Cam, Pool, Slate, Chapter, Note, clamp, pr, eo, eio, lerp, pop, hit, rnd, win, easeOut } from './kit';
import { CUT, bt } from './time';
import { JUNO } from './brand/identity';
import sim from '../sim/sim.json';

/* ---------------------------------------------------------------- S1 · the statement (0 – 8.5) */
const TYPED = [
  'Information received since the Federal Open Market',
  'Committee met in June indicates that economic growth',
  'so far this year has been considerably slower than',
  'the Committee had expected. ...',
];
const KEY_A = '...currently anticipates that economic conditions ... are likely to warrant exceptionally low levels for the federal funds rate ';
const KEY_B = 'at least through mid-2013.';
const typed = (s: string, T: number, a: number, cps: number) => s.slice(0, Math.max(0, Math.floor((T - a) * cps)));
export const Paper: React.FC<{ T: number; t0: number; hiK: number; hiFlicker?: number; full?: boolean }> = ({ T, t0, hiK, hiFlicker = 1, full }) => {
  const drop = eo(T, t0, 0.45);
  const L = (s: string, a: number, cps: number) => (full ? s : typed(s, T, a, cps));
  return (
    <div style={{ position: 'absolute', left: 520, top: 150 - 40 * (1 - drop), width: 960, height: 1180, transform: `rotate(${lerp(-6, -4, drop)}deg)`, transformOrigin: '50% 30%', opacity: clamp(drop * 3) }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(170deg, #efe7d4 0%, ${C.paper} 55%, #cfc3a8 100%)`, boxShadow: '0 40px 80px rgba(0,0,0,.7), 0 4px 12px rgba(0,0,0,.4)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 30% 18%, rgba(255,250,235,.55), rgba(255,250,235,0) 70%)' }} />
      <div style={{ position: 'absolute', left: 80, top: 70, fontFamily: F.type, fontSize: 19, letterSpacing: '0.18em', color: C.ink2 }}>FOR IMMEDIATE RELEASE</div>
      <div style={{ position: 'absolute', left: 80, top: 104, fontFamily: F.type, fontSize: 19, letterSpacing: '0.12em', color: C.ink2 }}>August 9, 2011</div>
      <div style={{ position: 'absolute', left: 80, top: 168, fontFamily: F.lat, fontWeight: 700, fontSize: 34, letterSpacing: '0.04em', color: C.ink }}>Federal Reserve Press Release</div>
      <div style={{ position: 'absolute', left: 80, top: 214, width: 800, height: 1.5, background: C.ink2, opacity: 0.6 }} />
      {TYPED.map((l, i) => <div key={i} style={{ position: 'absolute', left: 80, top: 252 + i * 38, fontFamily: F.type, fontSize: 21, color: C.ink, opacity: 0.55, whiteSpace: 'pre' }}>{L(l, t0 + 0.3 + i * 0.45, 120)}</div>)}
      <div style={{ position: 'absolute', left: 80, top: 430, width: 820, fontFamily: F.type, fontSize: 25, lineHeight: '46px', color: C.ink }}>
        {L(KEY_A, t0 + 1.9, 70)}
        {(full || T > t0 + 1.9 + KEY_A.length / 70) && (
          <span style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: -4, top: 8, height: 32, width: `calc(${clamp(hiK) * 100}% + 8px)`, background: `rgba(227,183,101,${0.85 * hiFlicker})` }} />
            <span style={{ position: 'relative' }}>{L(KEY_B, t0 + 1.9 + KEY_A.length / 70, 30)}</span>
          </span>
        )}
      </div>
      {[0, 1, 2].map((i) => <div key={i} style={{ position: 'absolute', left: 80, top: 640 + i * 38, width: 760 - i * 140, height: 12, background: C.ink, opacity: 0.12 }} />)}
    </div>
  );
};
export const S1: React.FC<{ T: number }> = ({ T }) => {
  const on = T >= 0.4 ? 1 : 0;
  const push = eio(T, 4.6, 3.9);
  const hiK = pr(T, 4.46, 0.55);
  return (
    <AbsoluteFill style={{ background: '#080706' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: on, background: 'radial-gradient(ellipse 60% 70% at 46% 46%, #2a241c 0%, #15120f 55%, #0b0a09 100%)' }} />
      <Cam s={lerp(1.02, 1.32, push)} cx={lerp(960, 1060, push)} cy={lerp(540, 660, push)}>
        {on > 0 && <Pool x={860} y={430} rx={760} ry={520} o={1.3 * (0.6 + 0.4 * eo(T, 0.4, 0.25))} />}
        {on > 0 && <Paper T={T} t0={0.4} hiK={hiK} />}
      </Cam>
      <Slate a="WASHINGTON, D.C." b="2011.08.09  14:15" o={eo(T, 1.0, 0.5) * (1 - pr(T, 4.6, 0.6))} />
      <Chapter n="I" t="一句话" o={eo(T, 1.3, 0.5) * (1 - pr(T, 4.6, 0.6))} />
      {/* the lamp clicks on with the first hit */}
      <div style={{ position: 'absolute', inset: 0, background: '#fff3d8', opacity: 0.18 * hit(T, 0.4, 0.12) }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S2 · the market that afternoon (8.5 – 16.6) */
export const S2: React.FC<{ T: number }> = ({ T }) => {
  const t = T - CUT.yield;
  const MARK = bt(20), LAND = bt(22), STAMP = bt(24);
  // a schematic path: drifting through the day, then the fall after the statement to the close (0.20 %, the record low)
  const N = 90, pts: [number, number][] = [];
  for (let i = 0; i < N; i++) { const u = i / (N - 1); const v = u < 0.62 ? 0.62 + 0.05 * Math.sin(i * 0.55) * (1 - u) : 0.62 - 0.5 * easeOut((u - 0.62) / 0.3); pts.push([u, Math.max(0.12, v)]); }
  const X = (u: number) => 260 + u * 1180, Y = (v: number) => 780 - v * 520;
  const drawK = T < MARK ? lerp(0, 0.62, eo(T, CUT.yield + 0.1, MARK - CUT.yield - 0.1)) : lerp(0.62, 1, eio(T, MARK, LAND - MARK));
  const n = Math.max(2, Math.floor(drawK * (N - 1)) + 1);
  const d = pts.slice(0, n).map(([u, v], i) => `${i ? 'L' : 'M'}${X(u)},${Y(v)}`).join(' ');
  const tip = pts[n - 1];
  const land = pop(T, LAND, 0.3);
  const fade = 1 - pr(T, CUT.title - 0.35, 0.2);
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 55% 50%, #1b1916 0%, #0d0c0b 70%)' }} />
      <Cam s={lerp(1.0, 1.05, pr(T, CUT.yield, 8))} cx={1100} cy={560}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          {[0.2, 0.4, 0.6, 0.8].map((v) => <line key={v} x1={260} x2={1440} y1={Y(v)} y2={Y(v)} stroke={C.hair} strokeWidth={1} strokeDasharray="2 8" opacity={eo(T, CUT.yield, 0.6)} />)}
          <text x={260} y={232} opacity={eo(T, CUT.yield + 0.1, 0.5)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 30, letterSpacing: '0.12em' }} fill={C.cream}>两年期美国国债利率 · 2011年8月9日</text>
          <g opacity={eo(T, MARK, 0.3)}>
            <line x1={X(0.62)} x2={X(0.62)} y1={260} y2={790} stroke={C.gold} strokeOpacity={0.55} strokeWidth={1.2} />
            <text x={X(0.62) + 12} y={286} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 18, letterSpacing: '0.2em' }} fill={C.gold}>14:15 声明发布</text>
          </g>
          <path d={d} fill="none" stroke={C.cream} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={X(tip[0])} cy={Y(tip[1])} r={6} fill={C.goldHi} />
          {land > 0 && (
            <g transform={`translate(${X(1)} ${Y(pts[N - 1][1])})`}>
              <circle r={26 + 40 * hit(T, LAND, 0.25)} fill={C.gold} opacity={0.18} />
              <g transform={`scale(${land})`}>
                <text x={30} y={14} style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 68, ...LNUM }} fill={C.goldHi}>0.20%</text>
                <text x={32} y={54} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em' }} fill={C.gold}>收盘 · 历史最低</text>
              </g>
            </g>
          )}
        </svg>
        <Note x={260} y={812} s="走势为示意 · 收盘 0.20% 为当日实际（CNN Money）" o={eo(T, CUT.yield + 0.6, 0.5)} />
        <div style={{ position: 'absolute', left: 1560, top: 300, width: 240, padding: '22px 0', border: `1.5px solid ${C.hair}`, textAlign: 'center', opacity: eo(T, LAND + 0.3, 0.4) }}>
          <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: C.dim }}>政策利率</div>
          <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 58, color: C.cream, marginTop: 6, ...LNUM }}>0–0.25%</div>
          {T >= STAMP - 0.08 && (
            <div style={{ display: 'inline-block', marginTop: 12, padding: '4px 14px', border: `2px solid ${C.red}`, color: C.red, fontFamily: F.serif, fontWeight: 900, fontSize: 24, letterSpacing: '0.3em', transform: `rotate(-6deg) scale(${lerp(1.6, 1, eo(T, STAMP - 0.08, 0.08))})`, opacity: eo(T, STAMP - 0.08, 0.06) }}>未变</div>
          )}
        </div>
      </Cam>
      <Slate a="NEW YORK" b="同日收盘" o={eo(T, CUT.yield + 0.3, 0.5)} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S3 · title card on the strongest hit (16.6 – 20.66) */
export const S3: React.FC<{ T: number }> = ({ T }) => {
  const HIT = CUT.title;
  const k = pr(T, HIT - 4 / 30, 4 / 30);
  const s = 1 + 0.28 * Math.pow(1 - k, 2);
  const flare = hit(T, HIT, 0.3);
  const ring = eio(T, HIT + 0.1, 0.7);
  const out = 1 - pr(T, CUT.laur - 0.25, 0.25);
  return (
    <AbsoluteFill style={{ background: '#080706', opacity: out }}>
      <Pool x={960} y={500} rx={900} ry={420} o={0.6 + 0.6 * flare} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="t3g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#9a6b2a" /></linearGradient></defs>
        <circle cx={960} cy={360} r={92} fill="none" stroke={C.gold} strokeWidth={1.4} opacity={0.75} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 360)" />
        <circle cx={960} cy={360} r={80} fill="none" stroke={C.gold} strokeWidth={0.8} opacity={0.5 * ring} />
        <g opacity={eo(T, HIT + 0.3, 0.4)}>
          <text x={960} y={352} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 40, letterSpacing: '0.1em', ...LNUM }} fill={C.gold}>2026</text>
          <text x={960} y={388} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 19, letterSpacing: '0.35em' }} fill={C.gold}>经济学奖</text>
        </g>
        <g transform={`translate(960 560) scale(${s}) translate(-960 -560)`} opacity={k}>
          <text x={960} y={590} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 112, letterSpacing: '0.04em' }} fill="url(#t3g)">《一句话，让钱变便宜》</text>
        </g>
        <rect x={360} y={548} width={1200} height={3} fill="#fff1cf" opacity={0.7 * flare} />
        <line x1={700} x2={1220} y1={660} y2={660} stroke={C.gold} strokeOpacity={0.45 * eo(T, HIT + 0.2, 0.5)} />
        <text x={960} y={712} textAnchor="middle" opacity={eo(T, HIT + 0.5, 0.5)} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: '0.42em' }} fill={C.dim}>HALL · WOODFORD · 2026</text>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S4 · the laureates (20.66 – 28.76) */
const Laureate: React.FC<{ x: number; k: number; cn: string; en: string; inst: string; born: string; work: string; workSub: string }> = ({ x, k, cn, en, inst, born, work, workSub }) => (
  <div style={{ position: 'absolute', left: x, top: 230 + 60 * (1 - k), width: 640, height: 600, opacity: clamp(k * 1.5), filter: k < 0.9 ? `blur(${(1 - k) * 8}px)` : undefined }}>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#1c1915,#121110)', border: `1px solid ${C.faint}` }} />
    <div style={{ position: 'absolute', left: 0, top: 0, height: 4, width: `${k * 100}%`, background: C.gold }} />
    <div style={{ position: 'absolute', left: 48, top: 56, fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 30, color: C.gold }}>Laureate · 2026</div>
    <div style={{ position: 'absolute', left: 48, top: 104, fontFamily: F.serif, fontWeight: 900, fontSize: 64, color: C.cream, letterSpacing: '0.04em' }}>{cn}</div>
    <div style={{ position: 'absolute', left: 50, top: 192, fontFamily: F.lat, fontWeight: 600, fontSize: 34, color: C.dim, letterSpacing: '0.04em' }}>{en}</div>
    <div style={{ position: 'absolute', left: 48, top: 262, width: 544, height: 1, background: C.hair }} />
    <div style={{ position: 'absolute', left: 48, top: 290, fontFamily: F.serif, fontWeight: 700, fontSize: 30, color: C.cream }}>{inst}</div>
    <div style={{ position: 'absolute', left: 48, top: 340, fontFamily: F.sans, fontWeight: 500, fontSize: 24, color: C.dim, ...LNUM }}>{born}</div>
    <div style={{ position: 'absolute', left: 48, top: 420, width: 544, height: 128, background: 'linear-gradient(180deg,#e7ddc7,#d3c6a9)', boxShadow: '0 12px 30px rgba(0,0,0,.5)' }}>
      <div style={{ position: 'absolute', left: 24, top: 22, fontFamily: F.lat, fontWeight: 700, fontSize: 30, color: C.ink, ...LNUM }}>{work}</div>
      <div style={{ position: 'absolute', left: 24, top: 70, fontFamily: F.sans, fontWeight: 500, fontSize: 22, color: C.ink2, ...LNUM }}>{workSub}</div>
    </div>
  </div>
);
export const S4: React.FC<{ T: number }> = ({ T }) => {
  const a = eo(T, CUT.laur, 0.5), b = eo(T, CUT.wood, 0.5);
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: eo(T, CUT.laur - 0.05, 0.25) }}>
      <Cam s={lerp(1, 1.04, pr(T, CUT.laur, 8))}>
        <Pool x={600} y={520} rx={600} ry={460} o={0.9 * a} />
        <Pool x={1320} y={520} rx={600} ry={460} o={0.9 * b} />
        <Laureate x={250} k={a} cn="罗伯特·霍尔" en="Robert E. Hall" inst="斯坦福大学" born="1943年生 · 美国" work="J. Political Economy · 1978" workSub="人一辈子怎么花钱" />
        {b > 0 && <Laureate x={1030} k={b} cn="迈克尔·伍德福德" en="Michael Woodford" inst="哥伦比亚大学" born="1955年生 · 美国" work="Interest and Prices · 2003" workSub="央行的一句话为什么管用" />}
      </Cam>
      <Slate a="STOCKHOLM" b="2026.10.12  11:45" o={eo(T, CUT.laur + 0.3, 0.5)} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S6 · the 1970s (32.81 – 49.01)
   Annual averages: CPI inflation (BLS, via usinflationcalculator.com) and civilian unemployment (BLS, via SSA Trustees Report). */
const INFL: Record<number, number> = { 1961: 1.0, 1962: 1.0, 1963: 1.3, 1964: 1.3, 1965: 1.6, 1966: 2.9, 1967: 3.1, 1968: 4.2, 1969: 5.5, 1970: 5.7, 1971: 4.4, 1972: 3.2, 1973: 6.2, 1974: 11.0, 1975: 9.1, 1976: 5.8, 1977: 6.5, 1978: 7.6, 1979: 11.3, 1980: 13.5, 1981: 10.3, 1982: 6.2 };
const UNEMP: Record<number, number> = { 1961: 6.7, 1962: 5.6, 1963: 5.6, 1964: 5.2, 1965: 4.5, 1966: 3.8, 1967: 3.8, 1968: 3.6, 1969: 3.5, 1970: 5.0, 1971: 6.0, 1972: 5.6, 1973: 4.9, 1974: 5.6, 1975: 8.5, 1976: 7.7, 1977: 7.1, 1978: 6.1, 1979: 5.9, 1980: 7.2, 1981: 7.6, 1982: 9.7 };
export const S6: React.FC<{ T: number }> = ({ T }) => {
  const X = (u: number) => 330 + (u - 3) * 150, Y = (p: number) => 820 - p * 44;
  const sixties = Array.from({ length: 9 }, (_, i) => 1961 + i), seventies = Array.from({ length: 13 }, (_, i) => 1970 + i);
  const yearIn = (i: number, a: number, step: number) => pop(T, a + i * step, 0.25);
  const A60 = CUT.oil + 1.6, A70 = bt(80);
  const curveK = eio(T, A60 + 9 * 0.36 + 0.2, 0.8);
  const broken = eo(T, A70, 0.5);
  const yr = 1973;
  const intro = 1 - pr(T, CUT.oil + 1.2, 0.5);
  const camS = lerp(1.12, 1.0, eio(T, A70 - 0.2, 1.2));
  const dot = (y: number, col: string, k: number, big = false) => k <= 0 ? null : (
    <g key={y} transform={`translate(${X(UNEMP[y])} ${Y(INFL[y])}) scale(${k})`}>
      <circle r={big ? 9 : 7} fill={col} />
      <circle r={20} fill={col} opacity={0.15} />
      <text x={12} y={-12} style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 22, ...LNUM }} fill={C.dim}>{`'${String(y).slice(2)}`}</text>
    </g>
  );
  const path = (ys: number[], kOf: (i: number) => number) => ys.filter((_, i) => kOf(i) > 0.5).map((y, i) => `${i ? 'L' : 'M'}${X(UNEMP[y])},${Y(INFL[y])}`).join(' ');
  const tags = ['房租', '工资', '面包', '车票', '学费'];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 50% 45%, #241c14 0%, #0d0b09 75%)' }} />
      <Cam s={camS} cx={720} cy={720}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }} opacity={1 - intro * 0.85}>
          {[0, 4, 8, 12].map((p) => <g key={p}><line x1={330} x2={1400} y1={Y(p)} y2={Y(p)} stroke={C.hair} strokeDasharray="2 8" /><text x={306} y={Y(p) + 7} textAnchor="end" style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 24, ...LNUM }} fill={C.dim}>{p}%</text></g>)}
          {[3, 5, 7, 9].map((u) => <text key={u} x={X(u)} y={850} textAnchor="middle" style={{ fontFamily: F.lat, fontWeight: 600, fontSize: 24, ...LNUM }} fill={C.dim}>{u}%</text>)}
          <text x={330} y={232} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em' }} fill={C.cream}>美国：物价涨幅（纵）× 失业率（横）</text>
          {/* the 1960s: the old rule */}
          <path d={path(sixties, (i) => yearIn(i, A60, 0.36))} fill="none" stroke={C.teal} strokeWidth={1.4} opacity={0.6} />
          {sixties.map((y, i) => dot(y, C.teal, yearIn(i, A60, 0.36)))}
          <path d={`M${X(3.3)},${Y(6.2)} C${X(3.9)},${Y(2.4)} ${X(5.0)},${Y(1.2)} ${X(7.0)},${Y(0.7)}`} fill="none" stroke={C.teal} strokeWidth={3.2} pathLength={1} strokeDasharray={broken > 0 ? '0.02 0.02' : '1 1'} strokeDashoffset={broken > 0 ? 0 : 1 - curveK} opacity={lerp(1, 0.35, broken)} />
          <text x={X(5.6)} y={Y(2.0)} opacity={curveK * (1 - 0.6 * broken)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26 }} fill={C.teal}>1960年代：物价涨，工作就好找</text>
          {/* the 1970s break away */}
          <path d={path(seventies, (i) => yearIn(i, A70, 0.24))} fill="none" stroke={C.red} strokeWidth={2.2} opacity={0.85} />
          {seventies.map((y, i) => dot(y, C.red, yearIn(i, A70, 0.24), y === 1974 || y === 1980))}
          <text x={X(7.6)} y={Y(13.9)} opacity={eo(T, A70 + 2.6, 0.4)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.red}>1970年代：两样一起涨</text>
        </svg>
        <Note x={330} y={880} s="年均 · 美国劳工统计局（BLS）数据" o={eo(T, A60, 0.5)} />
      </Cam>
      {/* the year slams first */}
      {intro > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: intro }}>
          <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 260, color: C.goldHi, letterSpacing: '0.04em', transform: `scale(${1 + 0.22 * Math.pow(1 - pr(T, CUT.oil - 4 / 30, 4 / 30), 2)})`, ...LNUM }}>{yr}</div>
          <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 40, letterSpacing: '0.5em', color: C.cream, marginTop: -20 }}>石油危机</div>
        </div>
      )}
      {/* people learn: prices and wages go up ahead of time */}
      {T > bt(88) && (
        <div style={{ position: 'absolute', left: 1460, top: 300, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {tags.map((tg, i) => {
            const k = pop(T, bt(88) + 0.1 + i * 0.42, 0.3);
            return (
              <div key={tg} style={{ opacity: clamp(k), transform: `translateY(${(1 - clamp(k)) * 20}px)`, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 22px', border: `1.5px solid ${C.hair}`, background: 'rgba(20,16,12,.8)' }}>
                <span style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 30, color: C.cream }}>{tg}</span>
                <span style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 30, color: C.red }}>↑</span>
                <span style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 20, color: C.dim }}>先涨了</span>
              </div>
            );
          })}
        </div>
      )}
      <Chapter n="II" t="老办法失灵" o={1 - intro} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S7 · Hall (49.01 – 63.18) */
export const S7: React.FC<{ T: number }> = ({ T }) => {
  const inc = (sim as any).hall.income as number[], con = (sim as any).hall.cons as number[];
  const X = (q: number) => 200 + q * 8.6, Y = (v: number) => 840 - (v - 90) * 5.2;
  const D0 = 52.9, D1 = 61.5;
  const q = Math.floor(lerp(0, 159, clamp((T - D0) / (D1 - D0))));
  const d = (a: number[]) => a.slice(0, q + 1).map((v, i) => `${i ? 'L' : 'M'}${X(i)},${Y(v)}`).join(' ');
  const tq = (qq: number) => D0 + (qq / 159) * (D1 - D0);
  // the opening: one light, one household
  const one = 1 - pr(T, CUT.hall + 2.6, 0.6);
  const glow = eo(T, CUT.hall, 1.2);
  const chartO = eo(T, CUT.hall + 2.8, 0.6);
  const formula = pr(T, 59.6, 1.0);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 40% 55%, #1a1814 0%, #0c0b0a 75%)', opacity: chartO }} />
      {one > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: one }}>
          <Pool x={960} y={540} rx={120 + 260 * glow} ry={120 + 260 * glow} o={1.6} />
          <div style={{ position: 'absolute', left: 945, top: 520, width: 30, height: 40, background: 'linear-gradient(180deg,#ffe4a8,#f0b456)', boxShadow: '0 0 40px rgba(255,205,120,.6)', transform: `scale(${lerp(0.3, 1.6, glow)})` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: F.serif, fontWeight: 700, fontSize: 32, letterSpacing: '0.4em', color: C.cream, opacity: eo(T, CUT.hall + 0.6, 0.6) }}>一个家庭</div>
        </div>
      )}
      <Cam s={lerp(1.0, 1.04, pr(T, CUT.hall + 2.8, 12))} cx={800} cy={600} o={chartO}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <line x1={200} x2={1580} y1={Y(100)} y2={Y(100)} stroke={C.hair} strokeDasharray="2 8" />
          <text x={200} y={232} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.1em' }} fill={C.teal}>— 收入</text>
          <text x={340} y={232} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.1em' }} fill={C.goldHi}>— 花钱</text>
          {q > 0 && <path d={d(inc)} fill="none" stroke={C.teal} strokeWidth={2.2} opacity={0.85} />}
          {q > 0 && <path d={d(con)} fill="none" stroke={C.goldHi} strokeWidth={5} strokeLinejoin="round" />}
          <g opacity={eo(T, tq(21), 0.3)}>
            <text x={X(20) + 14} y={Y(160) + 6} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26 }} fill={C.teal}>奖金</text>
            <path d={`M${X(20) + 10},${Y(160) + 20} Q${X(26)},${Y(140)} ${X(24)},${Y(104)}`} stroke={C.teal} strokeWidth={1.4} fill="none" />
            <text x={X(24) + 12} y={Y(104) - 12} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22 }} fill={C.dim}>花钱几乎不动</text>
          </g>
          <g opacity={eo(T, tq(60), 0.3)}>
            <line x1={X(60)} x2={X(60)} y1={300} y2={840} stroke={C.gold} strokeOpacity={0.55} strokeDasharray="4 6" />
            <text x={X(60) + 14} y={330} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.goldHi}>涨薪的消息</text>
            <text x={X(60) + 14} y={366} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 22 }} fill={C.dim}>花钱线立刻整体抬升</text>
          </g>
        </svg>
        <Note x={200} y={880} s="一个人 40 年 · 按霍尔 1978 模型模拟（示意）" />
        {formula > 0 && (
          <div style={{ position: 'absolute', right: 150, top: 220, textAlign: 'right', clipPath: `inset(0 ${(1 - formula) * 100}% 0 0)` }}>
            <div style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 92, color: C.goldHi, textShadow: '0 0 30px rgba(227,183,101,.25)' }}>
              C<sub style={{ fontSize: 46 }}>t+1</sub> = C<sub style={{ fontSize: 46 }}>t</sub> + <span style={{ fontFamily: F.serif, fontStyle: 'normal', fontWeight: 900, fontSize: 70 }}>新消息</span>
            </div>
            <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, color: C.dim, marginTop: 4, letterSpacing: '0.12em' }}>明天花多少 = 今天花多少 + 意外</div>
          </div>
        )}
      </Cam>
      <Chapter n="III" t="霍尔" o={chartO} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S11 · the experiment (89.51 – 97.61) */
export const S11: React.FC<{ T: number }> = ({ T }) => {
  const fg = (sim as any).fg;
  const X = (q: number) => 260 + q * 52, Y = (v: number) => 560 - v * 30;
  const q = Math.floor(lerp(1, 24, eio(T, CUT.fg + 0.3, 3.2)));
  const d = (a: number[]) => a.slice(0, q + 1).map((v: number, i: number) => `${i ? 'L' : 'M'}${X(i)},${Y(v)}`).join(' ');
  const gapK = eo(T, 93.5, 0.6);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 45% 50%, #1b1916 0%, #0c0b0a 75%)' }} />
      <Cam s={lerp(1.0, 1.05, pr(T, CUT.fg, 8))} cx={760} cy={560}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <line x1={260} x2={1520} y1={Y(0)} y2={Y(0)} stroke={C.hair} />
          <text x={236} y={Y(0) + 8} textAnchor="end" style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22 }} fill={C.dim}>正常</text>
          <rect x={X(0)} y={250} width={X(8) - X(0)} height={620} fill={C.teal} opacity={0.06} />
          <text x={X(0) + 12} y={280} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.16em' }} fill={C.teal}>经济下滑 · 利率已经是 0</text>
          <path d={d(fg.x_no)} fill="none" stroke={C.red} strokeWidth={3.4} />
          <path d={d(fg.x_fg)} fill="none" stroke={C.goldHi} strokeWidth={5} />
          <text x={X(3)} y={Y(fg.x_no[3]) + 46} opacity={eo(T, CUT.fg + 1.2, 0.4)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.red}>只管今天</text>
          <text x={X(10)} y={Y(fg.x_fg[10]) - 40} opacity={eo(T, CUT.fg + 2.4, 0.4)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28 }} fill={C.goldHi}>先说一句"低利率会保持更久"</text>
          {gapK > 0 && (
            <g opacity={gapK}>
              <line x1={X(2)} x2={X(2)} y1={Y(fg.x_fg[2]) + 8} y2={lerp(Y(fg.x_fg[2]) + 8, Y(fg.x_no[2]) - 8, gapK)} stroke={C.gold} strokeWidth={2} />
              <text x={X(2) + 16} y={(Y(fg.x_fg[2]) + Y(fg.x_no[2])) / 2} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26 }} fill={C.gold}>一句话的差别</text>
            </g>
          )}
          <text x={260} y={232} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em' }} fill={C.cream}>经济活动 · 伍德福德模型实验</text>
        </svg>
        <Note x={260} y={890} s="按新凯恩斯模型模拟 · 只示意方向" />
        <div style={{ position: 'absolute', left: 1580, top: 330, width: 230, padding: '20px 0', border: `1.5px solid ${C.hair}`, textAlign: 'center' }}>
          <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: C.dim }}>利率</div>
          <div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 70, color: C.cream, ...LNUM }}>0%</div>
          <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 22, color: C.gold, letterSpacing: '0.2em' }}>一分没动</div>
        </div>
      </Cam>
      <Chapter n="IV" t="伍德福德" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S12 · central banks, the smoothing (97.61 – 105.71) */
const Colonnade: React.FC<{ x: number; w: number; h: number; lit: number }> = ({ x, w, h, lit }) => {
  const base = 820, cols = Math.max(4, Math.round(w / 46));
  return (
    <g>
      <path d={`M${x - 14},${base - h} L${x + w / 2},${base - h - h * 0.28} L${x + w + 14},${base - h} Z`} fill="#16140f" stroke="#2b2620" />
      <rect x={x - 10} y={base - h} width={w + 20} height={14} fill="#1c1914" />
      {Array.from({ length: cols }, (_, i) => <rect key={i} x={x + 6 + i * ((w - 22) / (cols - 1))} y={base - h + 16} width={12} height={h - 30} fill="#1a1712" />)}
      <rect x={x - 16} y={base - 14} width={w + 32} height={14} fill="#1c1914" />
      <rect x={x - 24} y={base} width={w + 48} height={10} fill={`rgba(246,213,142,${0.15 + 0.85 * lit})`} />
      <rect x={x - 24} y={base} width={w + 48} height={10} fill="#f6d58e" opacity={0.6 * lit} filter="url(#s12blur)" />
    </g>
  );
};
export const S12: React.FC<{ T: number }> = ({ T }) => {
  const B = [{ x: 140, w: 240, h: 230 }, { x: 470, w: 300, h: 280 }, { x: 860, w: 220, h: 210 }, { x: 1170, w: 320, h: 300 }, { x: 1580, w: 220, h: 220 }];
  const smooth = eio(T, 101.9, 2.6);
  const N = 240;
  const cyc = (u: number) => { const big = 120 * Math.sin(u * 18) + 50 * Math.sin(u * 41 + 1); return lerp(big, big * 0.25, smooth); };
  const draw = eo(T, CUT.banks + 1.4, 2.0);
  const d = Array.from({ length: N }, (_, i) => i / (N - 1)).filter((u) => u <= draw).map((u, i) => `${i ? 'L' : 'M'}${140 + u * 1660},${360 + cyc(u)}`).join(' ');
  return (
    <AbsoluteFill style={{ background: '#090807' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 70%, #1e1a14 0%, #090807 75%)' }} />
      <Cam s={lerp(1.0, 1.05, pr(T, CUT.banks, 8))} cx={960} cy={700}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs><filter id="s12blur" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="8" /></filter></defs>
          {B.map((b, i) => <Colonnade key={i} {...b} lit={eo(T, CUT.banks + i * 0.18, 0.4)} />)}
          <line x1={100} x2={1820} y1={835} y2={835} stroke={C.gold} strokeOpacity={0.5 * eo(T, CUT.banks + 1, 0.6)} />
          {draw > 0 && <path d={d} fill="none" stroke={C.cream} strokeWidth={2.6} opacity={0.85} />}
          <text x={140} y={232} opacity={eo(T, CUT.banks + 1.4, 0.5)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.12em' }} fill={C.dim}>经济的起伏（示意）</text>
        </svg>
      </Cam>
      <Chapter n="V" t="一句话的力量" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- S12b · trust: back to the paper (105.71 – 113.81) */
export const S12b: React.FC<{ T: number }> = ({ T }) => {
  const doubt = T >= 109.0 && T < 111.7;
  const flick = doubt ? 0.25 + 0.5 * (Math.floor(T * 12) % 3 === 0 ? 0 : 1) * (1 - pr(T, 109.0, 2.2)) : 1;
  const crack = eo(T, 109.05, 0.5) * (1 - eo(T, 111.7, 0.5));
  return (
    <AbsoluteFill style={{ background: '#080706' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 46% 46%, #2a241c 0%, #15120f 55%, #0b0a09 100%)' }} />
      <Cam s={lerp(1.3, 1.42, pr(T, CUT.trust, 8))} cx={1060} cy={660}>
        <Pool x={860} y={430} rx={760} ry={520} o={1.3} />
        <Paper T={T} t0={CUT.trust - 2} hiK={1} hiFlicker={flick} full />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }} opacity={crack}>
          <path d="M700,560 L780,600 L760,640 L880,690 L860,720 L1010,760 L990,800 L1160,850" fill="none" stroke="#1d1a16" strokeWidth={2.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - crack} />
        </svg>
      </Cam>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', opacity: doubt ? 0.6 : 0 }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- end card (113.81 – 121.9) */
export const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const t = T - CUT.end;
  const ring = eio(t, 0, 0.8), f = (a: number) => eo(t, a, 0.4);
  const black = pr(T, CUT.fin - 0.6, 0.6);
  return (
    <AbsoluteFill style={{ background: '#06050a' }}>
      <Pool x={960} y={420} rx={900} ry={420} o={0.7} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="ecg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#9a6b2a" /></linearGradient></defs>
        <circle cx={960} cy={232} r={46} fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 232)" />
        <text x={960} y={252} textAnchor="middle" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 64 }} fill={C.gold} opacity={f(0.4)}>J</text>
        <text x={960} y={304} textAnchor="middle" style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 18, letterSpacing: '0.5em' }} fill={C.gold} opacity={0.8 * f(0.6)}>JUNO</text>
        <text x={960} y={430} textAnchor="middle" opacity={f(0.5)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 92 }} fill="url(#ecg)">《一句话，让钱变便宜》</text>
        <text x={960} y={540} textAnchor="middle" opacity={f(0.9)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 46, letterSpacing: '0.06em' }} fill={C.cream}>央行的一句话，会改变你的打算吗？</text>
        <text x={960} y={590} textAnchor="middle" opacity={f(1.1)} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 25, letterSpacing: '0.12em' }} fill={C.dim}>评论区聊聊：你会等降息再做决定吗？</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: f(1.4) }}>
        <div style={{ padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${C.gold}`, fontFamily: F.sans, fontWeight: 500, fontSize: 28, letterSpacing: '0.2em', color: C.gold }}>{JUNO.follow}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center', opacity: f(1.8), fontFamily: F.sans, fontSize: 17, letterSpacing: '0.03em', color: 'rgba(239,232,218,.42)', lineHeight: '28px', ...LNUM }}>
        <div>资料：瑞典皇家科学院 2026 经济学奖公告 · Hall, J. Political Economy 1978 · Hall & Mishkin, Econometrica 1982 · Woodford, Interest and Prices 2003</div>
        <div>美联储 2011-08-09 声明 · CNN Money 2011-08-09 · 美国劳工统计局（BLS）· 文中模拟按两位得主的模型计算，仅作示意</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

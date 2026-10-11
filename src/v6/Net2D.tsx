import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import { b, D, prog, easeOut, easeInOut, lerp, clamp, zlerp, pop, win, Subs, SubBand, Chapter, Stat, Note, Line, CAST, Avatar, GOLD, BLUE, RED, CREAM, NIGHT, ZH, EN, GOLD_TEXT } from './ui6';
import { Mood } from '../v4/Why';
import { mulberry } from '../v1/data';
import { Vignette, Grain } from '../ui';

/* S3 b57 -> b96: the dorm network. S4 b96 -> b129: who gets counted, Feld 1991, pull back to a big network.
   S5 b129 -> b160: Harvard 2009 flu on the same network. 2D, every frame a pure function of T. */
export const S3_IN = b(56.6), S4_IN = b(96), S5_IN = b(114), S5_OUT = b(122.6);
const LINES: Line[] = [
  [b(57.4), b(64) - 0.08, '小张以为，是自己{人缘太差}', "Xiao Zhang thought he just wasn't likeable."],
  [b(64) + 0.06, b(72) - 0.08, '其实，他只是输给了一道[算术题]', 'Actually, he lost to a piece of arithmetic.'],
  [b(72) + 0.06, b(80) - 0.08, '宿舍6个人，朋友关系是这样的', "Six roommates. Here's who is friends with whom."],
  [b(80) + 0.06, b(89) - 0.08, '小张有2个朋友，他们平均有[3.5]个', 'Xiao Zhang has 2 friends. They have 3.5 on average.'],
  [b(89) + 0.06, b(96) - 0.08, '6个人里，[5个]不如朋友热闹', 'Five of the six have fewer friends than their friends.'],
  [b(97) + 0.06, b(107) - 0.08, '因为老王朋友最多，他出现在[5个人]的列表里', "Lao Wang has the most friends, so he's on five lists."],
  [b(107) + 0.06, b(114) - 0.08, '人缘越好，[被数的次数越多]', "The more friends you have, the more often you're counted."],
  [b(114) + 0.06, b(122) - 0.1, '只要朋友有多有少，就[一定成立]', 'As long as some have more friends than others, it always holds.'],
];
const DM = D.dorm, BG = D.big;
const NB: number = BG.d.length;
const DP: number[][] = DM.pos;
const EDGES: number[][] = DM.edges;
const MOODS: Mood[] = ['worry', 'laugh', 'calm', 'calm', 'calm', 'calm'];
const CARD_X = (i: number) => 250 + i * 284;
/* the flu sample: random students and one named friend each (illustrative) */
const SAMPLE = (() => {
  const r = mulberry(2009);
  const picks: number[] = [], friends: number[] = [];
  while (picks.length < 18) {
    const n = 6 + Math.floor(r() * (NB - 6));
    if (picks.includes(n)) continue;
    const nbs = BG.e.filter((e: number[]) => e[0] === n || e[1] === n).map((e: number[]) => (e[0] === n ? e[1] : e[0]));
    if (!nbs.length) continue;
    picks.push(n); friends.push(nbs[Math.floor(r() * nbs.length)]);
  }
  return { picks, friends };
})();
const BB = (() => {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const [x, y] of BG.p) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
})();
const DC = [DP.reduce((s, p) => s + p[0], 0) / 6, DP.reduce((s, p) => s + p[1], 0) / 6];
const DIST = BG.p.map(([x, y]: number[]) => Math.hypot(x - DC[0], y - DC[1]));
const MAXDIST = Math.max(...DIST);

/* camera: scale s about focus (fx, fy), focus drawn at (960, ay) */
const cam = (T: number) => {
  const k = easeInOut(prog(T, b(114.6), b(119.6)));
  let s = zlerp(1, 0.33, k), fx = lerp(DC[0], BB.cx, k), fy = lerp(DC[1] + 30, BB.cy, k), ay = lerp(470, 440, k);
  s *= 1 + 0.03 * prog(T, S3_IN, b(96)); // a slow push while the dorm is explained
  const m = easeInOut(prog(T, b(129.2), b(131)));
  s *= 1 + 0.06 * m;
  // flu chart: the network slides left
  const ch = easeInOut(prog(T, b(144.1), b(145.3))) * (1 - easeInOut(prog(T, b(150.6), b(151.8))));
  const paperShift = 0;
  return { s: s * (1 - 0.22 * ch), fx, fy, ay, ax: 960 - 470 * ch - 240 * paperShift };
};

const Badge: React.FC<{ x: number; y: number; n: string; o: number; c?: string }> = ({ x, y, n, o, c = CREAM }) => o <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * o})`} opacity={Math.min(1, o)}>
    <circle r={25} fill="#0d1220" stroke={c} strokeWidth={3} />
    <text y={10} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 30, fill: c }}>{n}</text>
  </g>
);

export const Net2D: React.FC<{ T: number }> = ({ T }) => {
  if (T < S3_IN - 0.05 || T > S5_OUT + 0.05) return null;
  const { s, fx, fy, ay, ax } = cam(T);
  const fadeIn = easeOut(prog(T, S3_IN, S3_IN + 0.8));
  // phases
  const spot = easeInOut(prog(T, b(57.3), b(58))) * (1 - easeInOut(prog(T, b(64), b(64.8))));
  const cards = easeInOut(prog(T, b(97.1), b(98.6))) * (1 - easeInOut(prog(T, b(113.9), b(115.1))));
  const anon = easeInOut(prog(T, b(129.2), b(130.4))); // dorm avatars become ordinary students
  const big = (i: number) => (i < 6 ? 1 : easeOut(prog(T, b(115) + (DIST[i] / MAXDIST) * 3.0, b(115) + (DIST[i] / MAXDIST) * 3.0 + 0.5)));
  const verdict = easeOut(prog(T, b(89.2), b(89.9)));
  const bigColour = easeOut(prog(T, b(118.2), b(119.6)));
  // flu
  const sampleK = easeOut(prog(T, b(136.3), b(136.9)));
  const friendK = easeOut(prog(T, b(139.6), b(140.3)));
  const fluFade = 1 - easeInOut(prog(T, b(150.8), b(151.6)));
  const dayRate = (t: number) => 9.5 * (1 - prog(t, b(155), b(156.5))); // days per second, freezes in the musical gap
  const day = T < b(151.4) ? -1 : (() => { let d = 0; const steps = 30; const t0 = b(151.4); const dt = (T - t0) / steps; for (let i = 0; i < steps; i++) d += dayRate(t0 + (i + 0.5) * dt) * dt; return d; })();
  const lastRed = 1 - easeInOut(prog(T, b(157.6), b(158.8)));
  const SEED = BG.inf.indexOf(0);

  const scr = (x: number, y: number) => [ax + (x - fx) * s, ay + (y - fy) * s];
  const nodeR = (i: number) => (i < 6 ? 0 : (4 + 2.1 * Math.sqrt(BG.d[i])));

  /* ---- big network (world -> screen manually so stroke widths stay in px) ---- */
  const bigLayer = T > b(114.8) ? (
    <g>
      {BG.e.map(([u, v]: number[], k: number) => {
        const o = Math.min(big(u), big(v));
        if (o <= 0 || (u < 6 && v < 6 && anon <= 0)) return null;
        const [x1, y1] = scr(BG.p[u][0], BG.p[u][1]), [x2, y2] = scr(BG.p[v][0], BG.p[v][1]);
        const hot = day >= 0 && BG.inf[u] >= 0 && BG.inf[v] >= 0 && Math.max(BG.inf[u], BG.inf[v]) <= day;
        return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? RED : '#9fb4dd'} strokeWidth={1.2} opacity={o * (hot ? 0.45 : 0.22) * (u < 6 && v < 6 ? anon : 1) * (T > b(157.6) ? lastRed : 1)} />;
      })}
      {BG.p.map(([x, y]: number[], i: number) => {
        const o = big(i);
        if (o <= 0 || (i < 6 && anon <= 0)) return null;
        const [X, Y] = scr(x, y);
        const fewer = BG.f[i] === 1;
        let c = fewer ? BLUE : GOLD;
        if (bigColour <= 0) c = '#d8d0bf';
        const inf = day >= 0 && BG.inf[i] >= 0 && BG.inf[i] <= day;
        if (inf) c = RED;
        const r = i < 6 ? 5 + 2.1 * Math.sqrt(BG.d[i]) : nodeR(i);
        const keep = i === SEED ? 1 : (T > b(157.6) ? lastRed : 1);
        return <circle key={i} cx={X} cy={Y} r={r * (0.4 + 0.6 * o)} fill={c} opacity={o * (i < 6 ? anon : 1) * (fewer && !inf ? 0.75 : 1) * keep} />;
      })}
      {/* flu sample rings */}
      {sampleK > 0 && SAMPLE.picks.map((n, k) => {
        const [X, Y] = scr(BG.p[n][0], BG.p[n][1]);
        const f = SAMPLE.friends[k];
        const [X2, Y2] = scr(BG.p[f][0], BG.p[f][1]);
        return (
          <g key={k} opacity={fluFade * (T > b(151.4) ? 1 - prog(T, b(151.4), b(152.2)) : 1)}>
            {friendK > 0 && <line x1={X} y1={Y} x2={lerp(X, X2, friendK)} y2={lerp(Y, Y2, friendK)} stroke={GOLD} strokeWidth={2} opacity={0.7} />}
            <circle cx={X} cy={Y} r={(nodeR(n) + 7) * sampleK} fill="none" stroke="#ffffff" strokeWidth={2.5} />
            {friendK > 0 && <circle cx={X2} cy={Y2} r={(nodeR(f) + 8) * friendK} fill="none" stroke={GOLD} strokeWidth={3} />}
          </g>
        );
      })}
    </g>
  ) : null;

  /* ---- the dorm: six avatars ---- */
  const avR = 74 * s;
  const dormLayer = anon < 1 ? (
    <g opacity={1 - anon}>
      {EDGES.map(([u, v], k) => {
        const d = easeOut(prog(T, b(72.2) + k * 0.17, b(72.2) + k * 0.17 + 0.3));
        if (d <= 0 || cards >= 0.99) return null;
        const mine = u === 0 || v === 0;
        const g = mine ? easeOut(prog(T, b(80.1), b(80.6))) * (1 - prog(T, b(89.2), b(89.8))) : 0;
        const [x1, y1] = scr(DP[u][0], DP[u][1]), [x2, y2] = scr(DP[v][0], DP[v][1]);
        return <line key={k} x1={x1} y1={y1} x2={lerp(x1, x2, d)} y2={lerp(y1, y2, d)} stroke={g > 0 ? GOLD : '#c9d6f5'} strokeWidth={(3 + 3 * g) * Math.max(0.5, s)} opacity={(0.55 + 0.45 * g) * (1 - cards)} />;
      })}
      {DP.map(([x, y], i) => {
        // in the card phase the avatars line up on top
        const [nx, ny] = scr(x, y);
        const X = lerp(nx, CARD_X(i), cards), Y = lerp(ny, 210, cards);
        const R = lerp(avR, 58, cards) * (i === 0 ? 1 + 0.12 * spot : 1);
        const p = pop(T, S3_IN + 0.25 + i * 0.14, 0.35);
        const dim = i === 0 ? 1 : 1 - 0.6 * spot;
        const fewer = i !== 1;
        const ring = verdict > 0 ? (fewer ? BLUE : GOLD) : i === 0 && spot > 0 ? GOLD : undefined;
        const mood: Mood = i === 0 && T > b(108) ? 'calm' : MOODS[i];
        return (
          <g key={i} opacity={dim} transform={`translate(${X} ${Y})`}>
            {p < 1 && <circle r={10 + 12 * (1 - p)} fill={GOLD} opacity={1 - p} />}
            <g transform={`scale(${Math.max(0.001, p)})`}>
              <Avatar who={CAST[i]} mood={mood} r={R} ring={ring ?? 'rgba(255,255,255,0.25)'} ringW={ring ? 5 : 2} id={`d${i}`} bg="#1e2740" />
              <text y={R + 36} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 28, fill: i === 0 ? GOLD : CREAM }} opacity={s > 0.6 ? 1 : 0}>{CAST[i].name}</text>
            </g>
          </g>
        );
      })}
    </g>
  ) : null;

  /* ---- counts and verdicts (S3) ---- */
  const deg: number[] = DM.deg, favg: number[] = DM.favg;
  const cardsOff = 1 - cards;
  const countLayer = (
    <g opacity={cardsOff * (1 - prog(T, b(114.6), b(115.6)))}>
      {DP.map(([x, y], i) => {
        const [X, Y] = scr(x, y);
        const at = i === 0 ? b(80.3) : (i === 1 || i === 2) ? b(81.2) : b(89.2);
        const o = easeOut(prog(T, at, at + 0.3));
        const fewer = i !== 1;
        return (
          <g key={i}>
            <Badge x={X + avR * 0.78} y={Y - avR * 0.78} n={String(deg[i])} o={o} c={i === 1 ? GOLD : CREAM} />
            {verdict > 0 && (
              <text x={X} y={Y + avR + 74} textAnchor="middle" opacity={verdict} style={{ fontFamily: EN, fontWeight: 600, fontSize: 30, fill: fewer ? '#a9c2ee' : GOLD }}>
                {deg[i]} {fewer ? '<' : '>'} {favg[i].toFixed(1)}
              </text>
            )}
          </g>
        );
      })}
      {/* 小张's sum */}
      {(() => {
        const o = win(T, b(84), b(89.4), 0.4, 0.3);
        if (o <= 0) return null;
        const [X, Y] = scr(DP[0][0], DP[0][1]);
        return (
          <g opacity={o} transform={`translate(${X - 330} ${Y + 40})`}>
            <rect x={-20} y={-44} width={300} height={104} rx={14} fill="rgba(10,14,26,0.85)" stroke="rgba(246,207,120,0.5)" />
            <text x={130} y={-10} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 24, fill: 'rgba(243,237,226,0.75)' }}>他朋友们的平均</text>
            <text x={130} y={38} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 38, fill: CREAM }}>(5 + 2) ÷ 2 = <tspan style={GOLD_TEXT as any} fill={GOLD}>3.5</tspan></text>
          </g>
        );
      })()}
    </g>
  );

  /* ---- friend-list cards (S4) ---- */
  const appear: number[] = DM.appear;
  const cardLayer = cards > 0 ? (
    <g opacity={cards}>
      {DP.map((_, i) => {
        const nbs = EDGES.filter(([u, v]) => u === i || v === i).map(([u, v]) => (u === i ? v : u));
        const X = CARD_X(i);
        const o = easeOut(prog(T, b(98.3) + i * 0.08, b(98.3) + i * 0.08 + 0.4));
        return (
          <g key={i} transform={`translate(${X} 330)`} opacity={o}>
            <rect x={-112} y={0} width={224} height={338} rx={18} fill="rgba(14,19,34,0.88)" stroke="rgba(201,214,245,0.25)" />
            <text y={38} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 21, letterSpacing: '0.12em', fill: 'rgba(243,237,226,0.6)' }}>好友列表</text>
            {nbs.map((n, k) => {
              const hot = n === 1 ? easeOut(prog(T, b(101.2), b(101.7))) : 0;
              return (
                <g key={k} transform={`translate(${-60} ${84 + k * 54})`}>
                  {hot > 0 && <rect x={-36} y={-30} width={192} height={60} rx={30} fill={GOLD} opacity={0.18 * hot} />}
                  <Avatar who={CAST[n]} mood={MOODS[n]} r={24} id={`c${i}-${k}`} ring={hot > 0 ? GOLD : undefined} ringW={3} bg="#2a3348" />
                  <text x={40} y={9} style={{ fontFamily: ZH, fontWeight: 600, fontSize: 24, fill: hot > 0 ? GOLD : CREAM }}>{CAST[n].name}</text>
                </g>
              );
            })}
          </g>
        );
      })}
      {/* how many times each person is counted */}
      {DP.map((_, i) => {
        const o = easeOut(prog(T, b(107.3), b(107.8)));
        if (o <= 0) return null;
        return (
          <g key={i} transform={`translate(${CARD_X(i)} 760)`} opacity={o}>
            <text textAnchor="middle" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.6)' }}>被数到</text>
            <text y={0} x={0} dy={-30} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 44, fill: i === 1 ? GOLD : CREAM }}>{appear[i]} 次</text>
          </g>
        );
      })}
      {(() => {
        const o = easeOut(prog(T, b(101.3), b(101.8)));
        return o > 0 && <g transform={`translate(${CARD_X(1) + 70} 160)`} opacity={o}><text style={{ fontFamily: EN, fontWeight: 700, fontSize: 40, fill: GOLD }}>×5</text></g>;
      })()}
    </g>
  ) : null;

  /* ---- Feld's paper ---- */
  const paperO = win(T, b(114.5), b(129.2), 0.5, 0.4);
  const paper = paperO > 0 ? (
    <g opacity={paperO} transform={`translate(1290 120)`}>
      <rect width={570} height={226} rx={10} fill="#efe6d0" />
      <rect width={570} height={226} rx={10} fill="none" stroke="#c9a45c" strokeWidth={2} />
      <text x={30} y={44} style={{ fontFamily: EN, fontSize: 22, fill: '#6b5b3a', letterSpacing: '0.08em' }}>AMERICAN JOURNAL OF SOCIOLOGY · 1991</text>
      <text x={30} y={92} style={{ fontFamily: EN, fontWeight: 700, fontSize: 30, fill: '#2b2118' }}>Why Your Friends Have More</text>
      <text x={30} y={126} style={{ fontFamily: EN, fontWeight: 700, fontSize: 30, fill: '#2b2118' }}>Friends Than You Do</text>
      <text x={30} y={162} style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 24, fill: '#4a3d2a' }}>Scott L. Feld</text>
      <text x={30} y={204} style={{ fontFamily: ZH, fontSize: 21, fill: '#4a3d2a' }}>朋友的平均朋友数 = 平均数 + 方差 ÷ 平均数</text>
    </g>
  ) : null;

  /* ---- flu chart (S5) ---- */
  const chartO = easeInOut(prog(T, b(144.3), b(145.2))) * (1 - easeInOut(prog(T, b(150.6), b(151.4))));
  const chart = chartO > 0 ? (() => {
    const X0 = 1010, X1 = 1840, Y0 = 640, Y1 = 170;
    const rev = easeInOut(prog(T, b(144.8), b(148.4)));
    const path = (arr: number[]) => {
      const n = Math.max(2, Math.floor(arr.length * rev));
      return arr.slice(0, n).map((v, d) => `${d ? 'L' : 'M'} ${lerp(X0, X1, d / 121).toFixed(1)} ${lerp(Y0, Y1, v * 0.92).toFixed(1)}`).join(' ');
    };
    const pk = (sh: number) => lerp(X0, X1, (62 - sh) / 121);
    const arrow = easeOut(prog(T, b(148.6), b(149.2)));
    return (
      <g opacity={chartO}>
        <rect x={X0 - 40} y={Y1 - 60} width={X1 - X0 + 80} height={Y0 - Y1 + 130} rx={18} fill="rgba(10,14,26,0.8)" stroke="rgba(201,214,245,0.15)" />
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="rgba(243,237,226,0.4)" strokeWidth={2} />
        {['9月', '10月', '11月', '12月'].map((m, i) => <text key={m} x={lerp(X0, X1, (i * 30.5) / 121)} y={Y0 + 34} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.6)' }}>{m}</text>)}
        <text x={X0} y={Y1 - 22} style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.6)' }}>每天新增病例（示意）</text>
        <path d={path(D.flu.random)} stroke="#e8e4da" strokeWidth={4} fill="none" />
        <path d={path(D.flu.friends)} stroke={GOLD} strokeWidth={5} fill="none" />
        <text x={pk(0) + 14} y={Y1 + 10} style={{ fontFamily: ZH, fontWeight: 600, fontSize: 24, fill: '#e8e4da' }} opacity={prog(rev, 0.6, 0.8)}>随机组</text>
        <text x={pk(14.7) - 110} y={Y1 + 10} style={{ fontFamily: ZH, fontWeight: 600, fontSize: 24, fill: GOLD }} opacity={prog(rev, 0.45, 0.6)}>朋友组</text>
        {arrow > 0 && (
          <g opacity={arrow}>
            <line x1={pk(0)} y1={Y1 + 60} x2={lerp(pk(0), pk(14.7), arrow) + 10} y2={Y1 + 60} stroke={GOLD} strokeWidth={3} />
            <path d={`M ${pk(14.7)} ${Y1 + 60} l 16 -10 l 0 20 Z`} fill={GOLD} />
            <text x={(pk(0) + pk(14.7)) / 2} y={Y1 + 100} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: GOLD }}>早 14.7 天</text>
          </g>
        )}
      </g>
    );
  })() : null;

  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, opacity: fadeIn * (1 - prog(T, b(121.8), S5_OUT)) }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 42%, #141c34 0%, #070a14 72%)' }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {bigLayer}
        {dormLayer}
        {countLayer}
        {cardLayer}
        {sampleK > 0 && (
          <g opacity={win(T, b(136.3), b(144.2), 0.4, 0.4)} transform="translate(1500 130)">
            <rect x={-30} y={-40} width={390} height={friendK > 0 ? 136 : 76} rx={14} fill="rgba(7,10,20,0.8)" />
            <circle cx={0} cy={0} r={13} fill="none" stroke="#fff" strokeWidth={3} />
            <text x={30} y={10} style={{ fontFamily: ZH, fontWeight: 600, fontSize: 28, fill: CREAM }}>随机抽的学生</text>
            {friendK > 0 && <g opacity={friendK}>
              <circle cx={0} cy={60} r={13} fill="none" stroke={GOLD} strokeWidth={3.5} />
              <text x={30} y={70} style={{ fontFamily: ZH, fontWeight: 600, fontSize: 28, fill: GOLD }}>他们点名的朋友</text>
            </g>}
          </g>
        )}
        {chart}
        {T > b(157.6) && (() => {
          const [X, Y] = scr(BG.p[SEED][0], BG.p[SEED][1]);
          const g = easeInOut(prog(T, b(158.4), S5_OUT));
          return <circle cx={lerp(X, 960, g)} cy={lerp(Y, 480, g)} r={10 + 1400 * Math.pow(g, 2.4)} fill={RED} opacity={1 - 0.65 * prog(T, S5_OUT - 0.25, S5_OUT)} />;
        })()}
      </svg>
      <Chapter T={T} at={S3_IN + 0.5} out={b(96)} text="宿 舍 · 6 个 人" />
      <Stat T={T} at={b(90)} out={b(96.4)} top={110} value={5} unit="/ 6" label="不如朋友们热闹" gold count={0.6} />
      <Note T={T} at={b(72.5)} out={b(114.5)} text="示意：一间虚构的宿舍" />
      <Note T={T} at={b(117.5)} out={b(122.4)} text="示意网络：金色 = 朋友比朋友们多　蓝色 = 比朋友们少" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

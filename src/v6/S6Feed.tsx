import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, D, prog, easeOut, easeInOut, lerp, clamp, win, Subs, SubBand, Chapter, Note, Line, CAST, Avatar, GOLD, BLUE, RED, CREAM, NIGHT, ZH, EN } from './ui6';
import { Phone, Feed, Post, PW, PH, flickScroll } from './Phone';
import { mulberry } from '../v1/data';
import { Mood } from '../v4/Why';
import { Vignette, Grain } from '../ui';

/* S6 drop 2, b160 -> b194: the same arithmetic in your feed; Twitter 2017, the happiness paradox. */
export const S6_IN = b(160), S6_OUT = b(194);
const LINES: Line[] = [
  [S6_IN + 0.15, b(168) - 0.08, '同一道算术题，也在[你的朋友圈]里', 'The same arithmetic is in your feed.'],
  [b(168) + 0.06, b(175) - 0.08, '朋友多的人，被[更多人]看见', 'People with many friends are seen by many more.'],
  [b(176) + 0.06, b(183) - 0.08, '2017年，3.9万个Twitter用户', '2017: 39,000 Twitter users.'],
  [b(184) + 0.06, S6_OUT - 0.1, '按发帖情绪算，[58.5%]的人没有朋友们开心', 'By the mood of their posts, 58.5% were less happy than their friends.'],
];
const FEED_B: Post[] = [
  { who: 1, text: '周五五排，冲！', n: 5, bg: '#2f5a6e', likes: 88, seed: 12 },
  { who: 2, text: '生日快乐！谢谢12个兄弟', n: 12, bg: '#6b4a7a', likes: 46, seed: 11 },
  { who: 1, text: '烧烤局，下次还约', n: 14, bg: '#8a4a3a', likes: 95, seed: 15 },
  { who: 1, text: '球赛赢了！', n: 11, bg: '#3a6a3a', likes: 64, seed: 16 },
  { who: 3, text: '社团迎新 · 38人', n: 38, bg: '#7a5a3a', likes: 120, seed: 13 },
  { who: 1, text: '通宵自习，卷起来', n: 6, bg: '#4a4a7a', likes: 71, seed: 17 },
  { who: 4, text: '毕业旅行 Day 3', n: 9, bg: '#3a7a8a', likes: 73, seed: 14 },
  { who: 1, text: '新学期第一顿火锅', n: 8, bg: '#7a3a3a', likes: 102, seed: 18 },
  { who: 2, text: '社团篮球赛冠军！', n: 10, bg: '#3a5a8a', likes: 77, seed: 19 },
];
const PK = 0.95, PX = 380, PY = 92;
/* the dorm network in the right panel */
const NP = [[1040, 520], [1380, 330], [1060, 260], [1700, 300], [1720, 600], [1400, 650]];
const EDGES: number[][] = D.dorm.edges;
const MOODS: Mood[] = ['worry', 'laugh', 'calm', 'calm', 'calm', 'calm'];
/* Twitter dots: 3,911 dots, one per 10 users; 58.5% less happy than their friends */
const COLS = 79, ROWS = 50, NDOT = 3911;
const SAD = (() => {
  const r = mulberry(2017);
  const idx = Array.from({ length: NDOT }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const sad = new Uint8Array(NDOT);
  for (let i = 0; i < Math.round(NDOT * 0.585); i++) sad[idx[i]] = 1;
  return sad;
})();

export const S6Feed: React.FC<{ T: number }> = ({ T }) => {
  if (T < S6_IN - 0.02 || T > S6_OUT + 0.05) return null;
  const red = 1 - easeOut(prog(T, S6_IN, S6_IN + 0.5));
  const scroll = flickScroll(T, [[S6_IN + 0.2, 380, 1.4], [b(171), 330, 1.2], [b(180), 360, 1.3], [b(188), 300, 1.2]], 290) + 14 * (T - S6_IN);
  const netO = win(T, S6_IN + 0.3, b(176.2), 0.6, 0.5);
  const dotsO = easeOut(prog(T, b(176.1), b(176.9)));
  // signals along the edges: 老王 posts (to 5 friends), then 老李 (to 1)
  const signal = (who: number, at: number) => {
    const k = prog(T, at, at + 0.7);
    if (k <= 0 || k >= 1.6) return null;
    const tg = EDGES.filter(([u, v]) => u === who || v === who).map(([u, v]) => (u === who ? v : u));
    return tg.map((t, i) => {
      const e = easeInOut(clamp(k));
      const [x1, y1] = NP[who], [x2, y2] = NP[t];
      return <circle key={`${who}-${i}`} cx={lerp(x1, x2, e)} cy={lerp(y1, y2, e)} r={9} fill={GOLD} opacity={1 - prog(T, at + 0.75, at + 1.0)} />;
    });
  };
  const seen = (who: number, at: number) => EDGES.filter(([u, v]) => u === who || v === who).map(([u, v]) => (u === who ? v : u)).map((t) => [t, at + 0.7] as [number, number]);
  const lit = [...seen(1, b(168.4)), ...seen(5, b(171.6))];
  const recol = (i: number) => easeOut(prog(T, b(184.3) + ((i % COLS) / COLS) * 0.6, b(184.3) + ((i % COLS) / COLS) * 0.6 + 0.25));
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 42%, #141c34 0%, #070a14 72%)' }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${PX} ${PY}) scale(${PK})`}>
          <Phone id="s6" glow={1.2}><Feed posts={FEED_B} scroll={scroll} id="s6f" /></Phone>
        </g>
        {netO > 0 && (
          <g opacity={netO}>
            <text x={1040} y={150} style={{ fontFamily: ZH, fontSize: 24, letterSpacing: '0.14em', fill: 'rgba(243,237,226,0.6)' }}>谁的动态，被谁看见</text>
            {EDGES.map(([u, v], k) => <line key={k} x1={NP[u][0]} y1={NP[u][1]} x2={NP[v][0]} y2={NP[v][1]} stroke="#c9d6f5" strokeWidth={3} opacity={0.4} />)}
            {signal(1, b(168.4))}
            {signal(5, b(171.6))}
            {NP.map(([x, y], i) => {
              const l = lit.filter(([t]) => t === i).reduce((m, [, at]) => Math.max(m, easeOut(prog(T, at, at + 0.25))), 0);
              const big = i === 1 ? 1 + 0.25 * easeOut(prog(T, b(168.3), b(169))) : 1;
              return (
                <g key={i} transform={`translate(${x} ${y})`}>
                  {l > 0 && <circle r={70} fill={GOLD} opacity={0.18 * l} />}
                  <Avatar who={CAST[i]} mood={MOODS[i]} r={52 * big} ring={l > 0 ? GOLD : i === 1 ? GOLD : 'rgba(255,255,255,0.25)'} ringW={l > 0 || i === 1 ? 4 : 2} id={`s6n${i}`} bg="#1e2740" />
                  <text y={52 * big + 34} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 24, fill: i === 0 ? GOLD : CREAM }}>{CAST[i].name}</text>
                </g>
              );
            })}
            {[[1, b(169.2), '老王发一条 → [5] 个人看见'], [5, b(172.4), '老李发一条 → [1] 个人看见']].map(([who, at, s]: any) => {
              const o = easeOut(prog(T, at, at + 0.35));
              if (o <= 0) return null;
              const parts = String(s).split(/\[|\]/);
              return (
                <text key={who} x={1040} y={who === 1 ? 760 : 800} opacity={o} style={{ fontFamily: ZH, fontWeight: 600, fontSize: 30, fill: CREAM }}>
                  {parts[0]}<tspan fill={GOLD} fontWeight={800}>{parts[1]}</tspan>{parts[2]}
                </text>
              );
            })}
          </g>
        )}
        {dotsO > 0 && (
          <g opacity={dotsO}>
            <text x={940} y={136} style={{ fontFamily: EN, fontWeight: 600, fontSize: 60, fill: CREAM }}>39,110<tspan style={{ fontFamily: ZH, fontSize: 30 }} fill="rgba(243,237,226,0.7)">  个 Twitter 用户　·　1 点 = 10 人</tspan></text>
            {Array.from({ length: NDOT }, (_, i) => {
              const c = i % COLS, r = Math.floor(i / COLS);
              const k = recol(i);
              const appear = easeOut(prog(T, b(176.1) + (r / ROWS) * 0.7, b(176.1) + (r / ROWS) * 0.7 + 0.2));
              const fill = k <= 0 ? '#d8d0bf' : SAD[i] ? BLUE : GOLD;
              return <rect key={i} x={944 + c * 11} y={170 + r * 11} width={8} height={8} rx={2} fill={fill} opacity={appear * (SAD[i] && k > 0 ? 0.85 : 1)} />;
            })}
            {(() => {
              const o = easeOut(prog(T, b(184.9), b(185.5)));
              if (o <= 0) return null;
              return (
                <g opacity={o}>
                  <rect x={1190} y={300} width={500} height={210} rx={18} fill="rgba(7,10,20,0.86)" stroke="rgba(125,159,216,0.5)" />
                  <text x={1440} y={410} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 104, fill: '#a9c2ee' }}>58.5%</text>
                  <text x={1440} y={460} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 600, fontSize: 28, fill: CREAM }}>没有朋友们开心</text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: RED, opacity: 0.35 * red }} />
      <Chapter T={T} at={b(176.3)} out={S6_OUT} text="2017 · TWITTER" />
      <Note T={T} at={b(177)} out={S6_OUT} text="Bollen 等，《The happiness paradox: your friends are happier than you》，EPJ Data Science，2017" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

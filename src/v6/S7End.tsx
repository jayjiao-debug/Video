import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, D, prog, easeOut, easeInOut, lerp, clamp, zlerp, win, Subs, SubBand, Line, CAST, Who, GOLD, BLUE, CREAM, NIGHT, ZH, EN, FILM_END, easeIn3 } from './ui6';
import { Head, Mood, SK, SKD, INK } from '../v4/Why';
import { Phone, Feed, Post } from './Phone';
import { Room, Shoulder, PK, PX, PY } from './S1Cold';
import { GoldTitle } from '../brand/Brand';
import { JUNO } from '../brand/identity';
import { Vignette, Grain } from '../ui';

/* S7, b194 -> end: the whole dorm at 1 a.m.; 阿杰's phone shows 小张's photo; the punchline; the end card. */
export const S7_IN = b(194), OTS_IN = b(210), OTS_OUT = b(220), END_IN = b(244);
const LINES: Line[] = [
  [S7_IN + 0.12, b(201) - 0.08, '你刷到的，不是平均的人生', "What you scroll past isn't the average life."],
  [b(201) + 0.06, b(208) - 0.08, '是网里[最亮的那几个人]', "It's the brightest few in the network."],
  [b(208) + 0.06, b(218) - 0.1, '你发的那张合照，也在[别人的凌晨一点]', "Your group photo is someone else's 1 a.m., too."],
  [b(220) + 0.06, b(230) - 0.1, '不是你不行，是[数学在偏心]', "It's not you. The math is biased."],
  [b(230) + 0.06, END_IN - 0.2, '你朋友圈里，谁出现得最多？', 'Who shows up most in your feed?'],
];
/* beds: three bunks; seat i -> [bed, deck] */
const BED_X = [70, 690, 1310], DECK = [380, 690];
const SEATS: [number, number][] = [[0, 0], [1, 0], [0, 1], [1, 1], [2, 0], [2, 1]]; // 小张, 老王, 阿杰, 大刘, 小陈, 老李
const headAt = (i: number) => { const [bd, dk] = SEATS[i]; return [BED_X[bd] + 96, DECK[dk] - 48]; };

const SleepFace: React.FC = () => (
  <g>
    <ellipse cx={-14} cy={-6} rx={9} ry={8} fill={SK} /><ellipse cx={15} cy={-6} rx={9} ry={8} fill={SK} />
    <path d="M -22 -5 Q -14 0 -6 -5 M 7 -5 Q 15 0 23 -5" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);
/* someone lying on their side facing us, on a bunk deck; phone held in front of the face */
const Lying: React.FC<{ i: number; T: number; mood: Mood; phone: number; asleep?: boolean }> = ({ i, T, mood, phone, asleep }) => {
  const [bd, dk] = SEATS[i];
  const x0 = BED_X[bd], y = DECK[dk];
  const who: Who = CAST[i];
  const breathe = Math.sin(T * (1.3 + i * 0.17) + i) * 3;
  return (
    <g>
      <ellipse cx={x0 + 110} cy={y - 24} rx={90} ry={30} fill="#d8d3c8" opacity={0.9} />
      {/* blanket over the body */}
      <path d={`M ${x0 + 150} ${y} Q ${x0 + 150} ${y - 92 - breathe} ${x0 + 290} ${y - 88 - breathe} Q ${x0 + 470} ${y - 80} ${x0 + 520} ${y} Z`} fill={['#3b5b8f', '#8a4a3a', '#4f7a5a', '#6a5a8e', '#a07a3a', '#55606e'][i]} />
      <path d={`M ${x0 + 150} ${y - 40} Q ${x0 + 300} ${y - 60} ${x0 + 520} ${y - 30}`} stroke="rgba(0,0,0,0.18)" strokeWidth={6} fill="none" />
      <g transform={`translate(${x0 + 96} ${y - 48}) rotate(-12) scale(0.9)`}>
        <Head hair={who.hair} hairColor={who.hairColor} mood={asleep ? 'calm' : mood} lx={asleep ? 0 : 6} ly={asleep ? 0 : 6} />
        {asleep && <SleepFace />}
        {who.glasses && <g stroke={INK} strokeWidth={3.5} fill="rgba(255,255,255,0.12)" transform="translate(6 6)"><circle cx={-14} cy={-6} r={12} /><circle cx={15} cy={-6} r={12} /></g>}
      </g>
      {/* face glow + phone back */}
      {phone > 0 && !asleep && (
        <g opacity={phone}>
          <circle cx={x0 + 120} cy={y - 50} r={95} fill="#7fa4ff" opacity={0.16} />
          <g transform={`translate(${x0 + 168} ${y - 96}) rotate(-8)`}>
            <rect x={-20} y={-36} width={40} height={74} rx={8} fill="#15171e" stroke="#2c2f38" strokeWidth={2} />
            <rect x={-19} y={-37} width={38} height={3} fill="#9fbcff" opacity={0.8} />
          </g>
          <path d={`M ${x0 + 150} ${y - 10} Q ${x0 + 150} ${y - 60} ${x0 + 168} ${y - 70}`} stroke={SK} strokeWidth={20} strokeLinecap="round" fill="none" />
        </g>
      )}
      {asleep && (
        <g>
          <g transform={`translate(${x0 + 300} ${y - 100})`}>
            <rect x={-40} y={-10} width={80} height={14} rx={4} fill="#9fbcff" opacity={0.5 + 0.2 * Math.sin(T * 2.3)} />
            <circle cx={0} cy={-24} r={34} fill="#9fbcff" opacity={0.12} />
            <rect x={-30} y={-62} width={66} height={30} rx={15} fill="#ff4d4d" />
            <text x={3} y={-40} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 22, fill: '#fff' }}>99+</text>
          </g>
          {[0, 1, 2].map((k) => {
            const ph = ((T * 0.5 + k / 3) % 1);
            return <text key={k} x={x0 + 150 + ph * 50} y={y - 120 - ph * 70} style={{ fontFamily: EN, fontStyle: 'italic', fontWeight: 600, fontSize: 26 + ph * 10, fill: CREAM }} opacity={Math.sin(ph * Math.PI) * 0.7}>z</text>;
          })}
        </g>
      )}
    </g>
  );
};
const Bunks: React.FC = () => (
  <g>
    {BED_X.map((x) => (
      <g key={x}>
        <rect x={x - 10} y={200} width={16} height={600} fill="#1d2539" /><rect x={x + 534} y={200} width={16} height={600} fill="#1d2539" />
        {DECK.map((y) => <g key={y}><rect x={x - 10} y={y} width={560} height={24} fill="#252f48" /><rect x={x} y={y - 8} width={540} height={10} fill="#e8e2d2" opacity={0.85} /></g>)}
        <rect x={x - 10} y={250} width={560} height={10} fill="#1d2539" />
        {/* ladder */}
        <g stroke="#1d2539" strokeWidth={8}><line x1={x + 470} y1={DECK[0] + 24} x2={x + 470} y2={DECK[1]} /><line x1={x + 520} y1={DECK[0] + 24} x2={x + 520} y2={DECK[1]} />
          {[0, 1, 2, 3].map((k) => <line key={k} x1={x + 470} y1={DECK[0] + 80 + k * 62} x2={x + 520} y2={DECK[0] + 80 + k * 62} />)}</g>
      </g>
    ))}
  </g>
);
const wideCam = (T: number) => {
  const [hx, hy] = headAt(0);
  if (T < OTS_IN) {
    const k = easeInOut(prog(T, S7_IN, b(200)));
    let s = zlerp(2.5, 1.0, k), fx = lerp(hx + 70, 960, k), fy = lerp(hy - 20, 540, k);
    const [ax, ay] = headAt(2);
    const p = Math.pow(prog(T, b(208.2), OTS_IN), 1.6);
    if (p > 0) { s = zlerp(1, 2.6, p); fx = lerp(960, ax + 90, p); fy = lerp(540, ay - 30, p); }
    return { s, fx, fy };
  }
  const k = easeInOut(prog(T, OTS_OUT, b(240)));
  return { s: zlerp(1.7, 2.3, k), fx: hx + 80, fy: hy + 10 };
};

const POST_ZH: Post = { who: 0, text: '周末五排，终于赢了', n: 5, bg: '#2f5a6e', likes: 23, seed: 31, mood: 'laugh', star: 2 };

export const S7End: React.FC<{ T: number }> = ({ T }) => {
  if (T < S7_IN - 0.02) return null;
  const ots = T >= OTS_IN && T < OTS_OUT;
  const { s, fx, fy } = wideCam(T);
  const netO = win(T, b(201.4), b(208.4), 0.6, 0.5);
  const zhPhone = 1 - easeInOut(prog(T, b(224), b(225.4)));
  const zhMood: Mood = T > b(223) ? 'calm' : 'worry';
  const t = T - END_IN;
  const f = t * 30;
  const card = easeInOut(prog(t, 0, 0.8));
  const black = easeIn3(prog(T, FILM_END - 0.7, FILM_END));
  const o = (a: number, d = 0.5) => easeOut(prog(t, a, a + d));
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, opacity: easeOut(prog(T, S7_IN - 0.02, S7_IN + 0.3)) }}>
      {!ots && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(960 540) scale(${s}) translate(${-fx} ${-fy})`}>
            <rect x={-400} y={-300} width={2720} height={1700} fill="#0b101d" />
            <rect x={-400} y={800} width={2720} height={600} fill="#090d18" />
            <Bunks />
            {[0, 1, 2, 3, 4, 5].map((i) => <Lying key={i} i={i} T={T} mood={i === 0 ? zhMood : 'worry'} phone={i === 0 ? zhPhone : 1} asleep={i === 1} />)}
            {netO > 0 && (
              <g opacity={netO}>
                {(D.dorm.edges as number[][]).map(([u, v], k) => {
                  const [x1, y1] = headAt(u), [x2, y2] = headAt(v);
                  const d = easeOut(prog(T, b(201.4) + k * 0.08, b(201.4) + k * 0.08 + 0.35));
                  const hub = u === 1 || v === 1;
                  return <line key={k} x1={x1} y1={y1} x2={lerp(x1, x2, d)} y2={lerp(y1, y2, d)} stroke={hub ? GOLD : '#c9d6f5'} strokeWidth={hub ? 4 : 3} opacity={hub ? 0.8 : 0.45} />;
                })}
                {(() => { const [x, y] = headAt(1); return <circle cx={x} cy={y} r={70} fill={GOLD} opacity={0.22} />; })()}
              </g>
            )}
          </g>
        </svg>
      )}
      {ots && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(960 540) scale(${1.04 + 0.04 * prog(T, OTS_IN, OTS_OUT)}) translate(-990 -540)`}>
            <Room T={T} />
            <ellipse cx={1060} cy={470} rx={520} ry={420} fill="#5f86d8" opacity={0.1} />
            <g transform={`translate(${PX} ${PY}) scale(${PK})`}>
              <Phone id="s7" glow={1.1}>
                <Feed posts={[POST_ZH, { who: 1, text: '烧烤局，下次还约', n: 14, bg: '#8a4a3a', likes: 95, seed: 15 }]} scroll={300 - 40 * easeOut(prog(T, OTS_IN, OTS_IN + 1.2))} me={2} meMood="worry" id="s7f" />
              </Phone>
            </g>
            <Shoulder T={T} thumbY={0} cap hood="#3f5a44" />
          </g>
        </svg>
      )}
      {/* end card */}
      {t > -0.05 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <rect width={1920} height={1080} fill="#05060b" opacity={0.84 * card} />
          <text x={960} y={250} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(0.2)}>THE FRIENDSHIP PARADOX · 朋友悖论</text>
          <GoldTitle text="为什么别人都比我热闹" f={f} at={8} size={92} y={390} />
          <g transform="translate(960 478)" opacity={o(0.9)}>
            {(D.dorm.edges as number[][]).map(([u, v], k) => {
              const P = [[-90, 10], [0, -22], [-150, -18], [110, -20], [150, 16], [40, 26]];
              return <line key={k} x1={P[u][0]} y1={P[u][1]} x2={P[v][0]} y2={P[v][1]} stroke={u === 1 || v === 1 ? GOLD : '#c9d6f5'} strokeWidth={2} opacity={0.7} />;
            })}
            {[[-90, 10], [0, -22], [-150, -18], [110, -20], [150, 16], [40, 26]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 1 ? 12 : 7} fill={i === 1 ? GOLD : BLUE} />)}
          </g>
          <text x={960} y={590} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 46, fill: CREAM, letterSpacing: '0.06em' }} opacity={o(1.4)}>觉得自己没朋友热闹的，扣 1</text>
          <text x={960} y={640} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.1em' }} opacity={o(1.8)}>评论区说说：你朋友圈里，谁出现得最多？</text>
          <g opacity={o(2.3)}>
            <rect x={960 - 330} y={690} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
            <text x={960} y={727} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
          </g>
          <g opacity={o(2.7)} style={{ fontFamily: ZH, fontSize: 17, letterSpacing: '0.03em', fill: 'rgba(243,237,226,0.42)' }}>
            <text x={960} y={940} textAnchor="middle">资料：Feld, American Journal of Sociology (1991) · Ugander 等, The Anatomy of the Facebook Social Graph (2011)</text>
            <text x={960} y={968} textAnchor="middle">Christakis & Fowler, PLoS ONE (2010) · Bollen 等, EPJ Data Science (2017)</text>
            <text x={960} y={996} textAnchor="middle">宿舍关系网、星系网络、流感曲线与朋友圈画面均为示意</text>
          </g>
          <rect width={1920} height={1080} fill="#000" opacity={black} />
        </svg>
      )}
      {t < 0 && <SubBand o={0.85} />}
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.5} />
      <Grain />
    </AbsoluteFill>
  );
};

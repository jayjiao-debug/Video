import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, win, pop, Subs, SubBand, Chapter, Note, Line, CAST, Who, Avatar, GOLD, CREAM, NIGHT, ZH, EN, GOLD_TEXT } from '../v6/ui6';
import { Mood } from '../v4/Why';
import { Vignette, Grain } from '../ui';
import geo from './geo.json';

/* S3, b57 -> b96: Milgram's letter (1967; Travers & Milgram 1969). A 2D US map; the route is illustrative. */
export const S3_IN = b(56.8), S3_OUT = b(96);
const LINES: Line[] = [
  [b(57.4), b(64) - 0.08, '1967年，有人用一封信做实验', '1967: an experiment with a letter.'],
  [b(64) + 0.06, b(72) - 0.08, '寄给波士顿，一个陌生人', 'Addressed to a stranger in Boston.'],
  [b(72) + 0.06, b(80) - 0.08, '规则：只能转给你[认识的人]', 'Rule: you may only pass it to someone you know.'],
  [b(80) + 0.06, b(89) - 0.08, '信就这样，一站一站往东传', 'So it travelled east, hand to hand.'],
  [b(89) + 0.06, S3_OUT - 0.1, '送到的信，平均只经过[5.2]个人', 'The letters that arrived passed through 5.2 people on average.'],
];
const G = geo as any;
const MK = 1.38, MX = (1920 - 975 * MK) / 2, MY = 60;
const at = (k: string) => [MX + G.pts[k][0] * MK, MY + G.pts[k][1] * MK];
const ROUTE = ['Omaha', 'DesMoines', 'Chicago', 'Cleveland', 'Pittsburgh', 'NewYork', 'Boston'];
// hop start times: a human pace, not on the beat
const HOPS = [0, 0.8, 1.45, 2.3, 3.0, 3.75, 4.55].map((d) => b(80.3) + d);
const PEOPLE: { who: Who; mood: Mood; label: string }[] = [
  { who: { ...CAST[2], name: '农场主', shirt: '#7a6a3a' }, mood: 'calm', label: '农场主' },
  { who: { ...CAST[4], name: '老同学', shirt: '#4f7a5a' }, mood: 'calm', label: '老同学' },
  { who: { ...CAST[1], name: '表哥', shirt: '#b5523f' }, mood: 'laugh', label: '表哥' },
  { who: { ...CAST[3], name: '同事', shirt: '#6a5a8e' }, mood: 'calm', label: '同事' },
  { who: { ...CAST[0], name: '大学室友', shirt: '#3b5b8f' }, mood: 'calm', label: '大学室友' },
  { who: { ...CAST[5], name: '邻居', shirt: '#55606e' }, mood: 'calm', label: '邻居' },
  { who: { name: '股票经纪人', hair: 'slick', hairColor: '#3a2a1f', shirt: '#1d2233', glasses: false }, mood: 'smug', label: '目标：股票经纪人' },
];

const Envelope: React.FC<{ w: number; flip?: number }> = ({ w }) => (
  <g>
    <rect x={-w / 2} y={-w * 0.32} width={w} height={w * 0.64} rx={w * 0.03} fill="#efe6d0" stroke="#c9b98f" strokeWidth={w * 0.006} />
    <path d={`M ${-w / 2} ${-w * 0.32} L 0 ${w * 0.05} L ${w / 2} ${-w * 0.32}`} fill="none" stroke="#c9b98f" strokeWidth={w * 0.006} />
    <rect x={w * 0.3} y={-w * 0.27} width={w * 0.13} height={w * 0.16} fill="#b8483b" />
    <rect x={w * 0.315} y={-w * 0.255} width={w * 0.1} height={w * 0.13} fill="none" stroke="#efe6d0" strokeWidth={w * 0.004} strokeDasharray={`${w * 0.01} ${w * 0.008}`} />
  </g>
);

export const LetterScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < S3_IN - 0.05 || T > S3_OUT + 0.05) return null;
  const o = Math.min(easeOut(prog(T, S3_IN, S3_IN + 0.6)), 1 - prog(T, S3_OUT - 0.35, S3_OUT));
  const mapO = 0.35 + 0.65 * easeInOut(prog(T, b(63.6), b(64.6)));
  const big = 1 - easeInOut(prog(T, b(63.8), b(65)));          // the big envelope flies to Omaha
  const [ox, oy] = at('Omaha'), [bx, by] = at('Boston');
  const neb = easeOut(prog(T, b(64.3), b(65)));
  const mas = easeOut(prog(T, b(65.6), b(66.2)));
  const rule = win(T, b(72.3), b(89), 0.4, 0.4);
  // where the letter is during the hops
  let lx = ox, ly = oy, hopIdx = 0;
  for (let i = 0; i < HOPS.length - 1; i++) {
    const k = easeInOut(prog(T, HOPS[i] + 0.25, HOPS[i + 1]));
    if (T >= HOPS[i] + 0.25) { const [x1, y1] = at(ROUTE[i]), [x2, y2] = at(ROUTE[i + 1]); lx = lerp(x1, x2, k); ly = lerp(y1, y2, k) - Math.sin(k * Math.PI) * 40; hopIdx = i + (k >= 1 ? 1 : 0); }
  }
  const stats = easeOut(prog(T, b(89.4), b(90.2)));
  const count = (v: number, a: number) => Math.round(v * easeOut(prog(T, a, a + 0.9)));
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, opacity: o }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 42%, #141c34 0%, #070a14 72%)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={mapO} transform={`translate(${MX} ${MY}) scale(${MK})`}>
          <path d={G.nation} fill="#1a2440" stroke="#3a4a70" strokeWidth={1.2} />
          <path d={G.borders} fill="none" stroke="#2e3a5c" strokeWidth={0.8} />
          <path d={G.nebraska} fill={GOLD} opacity={0.35 * neb} />
          <path d={G.mass} fill={GOLD} opacity={0.5 * mas} />
        </g>
        {neb > 0 && <text x={ox - 120} y={oy + 36} textAnchor="middle" opacity={neb * mapO} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 28, fill: CREAM }}>内布拉斯加</text>}
        {mas > 0 && <g opacity={mas}>
          <circle cx={bx} cy={by} r={12 + 10 * Math.max(0, Math.sin((T - b(65.6)) * 3))} fill="none" stroke={GOLD} strokeWidth={3} />
          <circle cx={bx} cy={by} r={8} fill={GOLD} />
          <text x={bx + 18} y={by - 26} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 28, fill: GOLD }}>波士顿</text>
        </g>}
        {/* the route, drawn as the letter travels */}
        {ROUTE.slice(0, -1).map((k, i) => {
          const p = easeInOut(prog(T, HOPS[i] + 0.25, HOPS[i + 1]));
          if (p <= 0) return null;
          const [x1, y1] = at(k), [x2, y2] = at(ROUTE[i + 1]);
          const n = 24, pts: string[] = [];
          for (let j = 0; j <= n * p; j++) { const t = j / n; pts.push(`${lerp(x1, x2, t).toFixed(1)},${(lerp(y1, y2, t) - Math.sin(t * Math.PI) * 40).toFixed(1)}`); }
          return <polyline key={i} points={pts.join(' ')} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="8 7" opacity={0.85} />;
        })}
        {/* people at each stop */}
        {ROUTE.map((k, i) => {
          const a = i === 0 ? b(80.1) : HOPS[i] + 0.05;
          const p = pop(T, a, 0.3);
          if (p <= 0) return null;
          const [x, y] = at(k);
          const up = i % 2 === 0 ? -1 : 1;
          const ay = y + up * 92;
          const last = i === ROUTE.length - 1;
          return (
            <g key={k} opacity={Math.min(1, p)}>
              <line x1={x} y1={y} x2={x} y2={ay - up * 40} stroke="rgba(243,237,226,0.35)" strokeWidth={2} />
              <circle cx={x} cy={y} r={6} fill={last ? GOLD : CREAM} />
              <g transform={`translate(${x} ${ay}) scale(${p})`}>
                <Avatar who={PEOPLE[i].who} mood={PEOPLE[i].mood} r={40} ring={last ? GOLD : 'rgba(255,255,255,0.35)'} ringW={last ? 4 : 2} id={`lt${i}`} bg="#2a3348" />
                <text y={up < 0 ? -52 : 70} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 600, fontSize: 22, fill: last ? GOLD : CREAM }}>{PEOPLE[i].label}</text>
              </g>
              {i > 0 && !last && <text x={x} y={ay + up * (up < 0 ? -78 : 104)} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 26, fill: GOLD }}>{i}</text>}
            </g>
          );
        })}
        {/* the small letter while it travels */}
        {T > b(64.6) && T < b(89.6) && <g transform={`translate(${lx} ${ly - 4})`} opacity={1 - prog(T, b(89), b(89.6))}><Envelope w={54} /></g>}
        {/* the big envelope */}
        {big > 0 && (
          <g transform={`translate(${lerp(ox, 960, big)} ${lerp(oy, 470, big)}) scale(${Math.max(0.05, big)}) rotate(${-4 * big})`} opacity={Math.min(1, pop(T, b(57.2), 0.4))}>
            <Envelope w={720} />
            <text x={-300} y={-120} style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 46, fill: '#6b5b3a' }}>Nebraska, 1967</text>
            <text x={-300} y={40} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, fill: '#2b2118' }}>请转交：波士顿</text>
            <text x={-300} y={98} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, fill: '#2b2118' }}>一位股票经纪人</text>
            <text x={-300} y={160} style={{ fontFamily: ZH, fontSize: 30, fill: '#6b5b3a' }}>（你不认识他）</text>
          </g>
        )}
        {/* the rule */}
        {rule > 0 && (
          <g opacity={rule} transform="translate(80 120)">
            <rect width={470} height={150} rx={16} fill="#efe6d0" />
            <text x={30} y={52} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: '#8a3b3b' }}>规则</text>
            <text x={30} y={98} style={{ fontFamily: ZH, fontWeight: 600, fontSize: 28, fill: '#2b2118' }}>认识他？直接寄给他。</text>
            <text x={30} y={134} style={{ fontFamily: ZH, fontWeight: 600, fontSize: 28, fill: '#2b2118' }}>不认识？转给一个熟人。</text>
          </g>
        )}
        {/* results */}
        {stats > 0 && (
          <g opacity={stats} transform="translate(80 470)">
            <rect width={420} height={268} rx={18} fill="rgba(7,10,20,0.86)" stroke="rgba(246,207,120,0.4)" />
            <text x={34} y={66} style={{ fontFamily: EN, fontWeight: 700, fontSize: 52, fill: CREAM }}>{count(296, b(89.4))}<tspan style={{ fontFamily: ZH, fontSize: 26 }} fill="rgba(243,237,226,0.7)">  封信出发</tspan></text>
            <text x={34} y={140} style={{ fontFamily: EN, fontWeight: 700, fontSize: 52, fill: CREAM }}>{count(64, b(90.4))}<tspan style={{ fontFamily: ZH, fontSize: 26 }} fill="rgba(243,237,226,0.7)">  封送到</tspan></text>
            <text x={34} y={226} style={{ fontFamily: EN, fontWeight: 700, fontSize: 76, fill: GOLD }}>5.2<tspan style={{ fontFamily: ZH, fontSize: 28 }} fill="rgba(243,237,226,0.8)">  人，平均经过</tspan></text>
          </g>
        )}
      </svg>
      <Chapter T={T} at={S3_IN + 0.5} out={S3_OUT - 0.3} text="1967 · 米 尔 格 拉 姆 的 信" />
      <Note T={T} at={b(80.5)} out={S3_OUT - 0.2} text="路线与人物为示意　数据：Travers & Milgram, Sociometry, 1969" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

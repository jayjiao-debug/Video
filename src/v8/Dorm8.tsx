import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, zlerp, pop, Subs, SubBand, Chapter, Line, CAST, GOLD, CREAM, NIGHT, ZH, EN } from '../v6/ui6';
import { Seated, Standing } from '../v7/people7';
import { Mood } from '../v4/Why';
import { Cup, RedPacket } from './common8';
import { Vignette, Grain } from '../ui';

/* The dorm desk (2D). S1 cold open b16 -> b32; the ending b159.6 -> b194.
   阿杰 hides a red envelope under one of three cups. He knows where it is, always lifts an empty cup, and always asks. */
export const S1_OUT = b(32), END_IN8 = b(159.6), CARD8 = b(194);
const DESK_Y = 640, FLOOR = 860, CUPS = [760, 960, 1160], WIN = 1; // cup 2 (index 1) has the envelope
const LINES: Line[] = [
  [-0.4, b(22) - 0.08, '三个杯子，一个下面有红包', 'Three cups. One hides a red envelope.'],
  [b(22) + 0.06, b(29.6), '阿杰翻开一个空杯：[换不换？]', 'A-Jie lifts an empty cup: switch or stay?'],
];
const LINES_END: Line[] = [
  [b(160) + 0.12, b(168) - 0.08, '鸽子不讲道理，它只看结果', "The pigeon doesn't argue. It just watches what wins."],
  [b(168) + 0.06, b(176) - 0.08, '人却总舍不得[自己最初的选择]', "People can't let go of their first choice."],
  [b(176) + 0.06, b(185) - 0.08, '下次有人问你：换不换？', 'Next time someone asks: switch or stay?'],
  [b(185) + 0.06, CARD8 - 0.25, '先别急着守住[第一个选择]', "Don't rush to guard your first pick."],
];
const Say: React.FC<{ x: number; y: number; text: string; o: number; flip?: boolean }> = ({ x, y, text, o, flip }) => {
  if (o <= 0) return null;
  const w = 60 + text.length * 50;
  return (
    <g transform={`translate(${x} ${y}) scale(${(0.7 + 0.3 * Math.min(1, o)) * (flip ? -1 : 1)} ${0.7 + 0.3 * Math.min(1, o)})`} opacity={Math.min(1, o)}>
      <path d="M 0 0 L 20 -42 L 54 -42 Z" fill="#f6efe1" />
      <rect x={-12} y={-136} width={w} height={96} rx={44} fill="#f6efe1" />
      <text x={w / 2 - 12} y={-72} textAnchor="middle" transform={flip ? `scale(-1 1) translate(${-(w - 24)} 0)` : undefined} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 46, fill: '#1d1c22' }}>{text}</text>
    </g>
  );
};
const Room: React.FC<{ T: number }> = ({ T }) => (
  <g>
    <rect x={-500} y={-400} width={2920} height={1900} fill="#262b3a" />
    <rect x={-500} y={FLOOR} width={2920} height={700} fill="#171b26" />
    {/* window */}
    <rect x={120} y={140} width={330} height={360} rx={6} fill="#101a30" stroke="#353c50" strokeWidth={10} />
    <path d="M 285 140 L 285 500 M 120 320 L 450 320" stroke="#353c50" strokeWidth={8} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={140 + (i * 53) % 290} y={360 + (i * 29) % 120} width={9} height={12} fill="#e8c27a" opacity={0.3 + 0.2 * (i % 3)} />)}
    {/* bunk bed behind */}
    <g opacity={0.8}>
      <rect x={1580} y={120} width={14} height={740} fill="#1c2130" /><rect x={2000} y={120} width={14} height={740} fill="#1c2130" />
      <rect x={1580} y={330} width={434} height={24} fill="#1e2433" /><rect x={1580} y={640} width={434} height={24} fill="#1e2433" />
      <path d="M 1600 330 Q 1700 280 1850 300 Q 1950 290 2000 330 Z" fill="#33425f" />
    </g>
    {/* poster */}
    <rect x={560} y={170} width={180} height={240} rx={4} fill="#3a3550" />
    <circle cx={650} cy={260} r={50} fill="#c9a45c" opacity={0.5} />
    {/* lamp light */}
    <ellipse cx={1380} cy={560} rx={420} ry={300} fill="#ffd69a" opacity={0.08 + 0.01 * Math.sin(T * 2)} />
  </g>
);
const Desk: React.FC = () => (
  <g>
    <rect x={420} y={DESK_Y - 8} width={1080} height={26} rx={6} fill="#8a6a4a" />
    <rect x={420} y={DESK_Y + 18} width={1080} height={FLOOR - DESK_Y - 18} fill="#5e4632" />
    <rect x={440} y={DESK_Y + 40} width={300} height={140} rx={6} fill="#6b513a" />
    <rect x={570} y={DESK_Y + 104} width={40} height={10} rx={5} fill="#c9a45c" />
    {/* lamp */}
    <g transform="translate(1420 632)">
      <rect x={-40} y={-10} width={80} height={10} rx={4} fill="#2b2b33" />
      <path d="M 0 -10 L 20 -150 L -40 -200" stroke="#2b2b33" strokeWidth={8} fill="none" />
      <path d="M -80 -230 L -10 -180 L -60 -150 Z" fill="#c9a45c" />
    </g>
  </g>
);
export const DormScene: React.FC<{ T: number; end?: boolean }> = ({ T, end }) => {
  // pick marker: cup 1, then (ending) moves to cup 2
  const moveK = end ? easeInOut(prog(T, b(170.2), b(171))) : 0;
  const markX = lerp(CUPS[0], CUPS[1], moveK);
  const lift3 = easeOut(prog(T, end ? -1 : b(22.2), end ? 0 : b(22.9)));      // cup 3 lifted (and stays lifted in the ending)
  const lift2 = end ? easeOut(prog(T, b(172), b(172.7))) : 0;
  const found = end ? easeOut(prog(T, b(172.4), b(173))) : 0;
  const ask = end ? 0 : pop(T, b(23), 0.35) * (1 - prog(T, b(29), b(29.4)));
  const hey = end ? pop(T, b(170.4), 0.35) * (1 - prog(T, b(174), b(174.5))) : 0;
  const rule = end ? 0 : Math.min(easeOut(prog(T, b(18.8), b(19.4))), 1 - prog(T, b(29), b(29.4)));
  const ajMood: Mood = end ? (T > b(172.6) ? 'shout' : 'smug') : 'smug';
  const zhMood: Mood = end ? (T > b(172.6) ? 'laugh' : 'worry') : 'worry';
  // camera
  let s = 1.14, fx = 930, fy = 540;
  if (!end) {
    const p = prog(T, b(29.4), S1_OUT);
    if (p > 0) { const e = Math.pow(p, 2.2); s = zlerp(1.14, 22, e); fx = lerp(930, CUPS[0], easeInOut(Math.min(1, p * 1.4))); fy = lerp(540, DESK_Y - 80, easeInOut(Math.min(1, p * 1.4))); }
  } else {
    const k = easeInOut(prog(T, b(165.8), b(168.6)));
    s = zlerp(2.6, 1.14, k); fx = lerp(360, 930, k); fy = lerp(560, 540, k);
    s *= 1 + 0.06 * easeInOut(prog(T, b(176), CARD8));
  }
  const white = end ? 0 : prog(T, S1_OUT - 0.2, S1_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(960 540) scale(${s}) translate(${-fx} ${-fy})`}>
          <Room T={T} />
          {/* 阿杰 behind the desk */}
          <g transform={`translate(1290 ${FLOOR})`}><Standing who={CAST[2]} mood={ajMood} /></g>
          <Desk />
          {/* the envelope under cup 2 (seen only when lifted) */}
          {found > 0 && <g transform={`translate(${CUPS[WIN]} ${DESK_Y}) scale(${0.6 + 0.4 * found})`} opacity={found}><RedPacket s={0.9} />
            {[0, 1, 2, 3, 4, 5].map((k) => { const a = (k / 6) * Math.PI * 2 + T; return <circle key={k} cx={Math.cos(a) * 90} cy={-60 + Math.sin(a) * 70} r={5} fill={GOLD} opacity={0.8 * found} />; })}
          </g>}
          {/* gold marker on the picked cup */}
          <g transform={`translate(${markX} ${DESK_Y + 6})`}>
            <ellipse rx={90} ry={16} fill={GOLD} opacity={0.35} />
            <text y={56} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: GOLD }}>{end && moveK > 0.5 ? '换了！' : '你选的'}</text>
          </g>
          {CUPS.map((x, i) => {
            const up = i === 2 ? lift3 : i === 1 ? lift2 : 0;
            return <g key={i} transform={`translate(${x + up * 40} ${DESK_Y - up * 190}) rotate(${up * 14})`}><Cup n={i + 1} glow={i === 0 && !end ? 0.6 : 0} /></g>;
          })}
          {lift3 > 0.6 && <text x={CUPS[2]} y={DESK_Y - 14} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: 'rgba(243,237,226,0.7)' }} opacity={lift3}>空</text>}
          {/* 小张 on a stool at the left end */}
          <g transform={`translate(330 ${FLOOR})`}>
            <rect x={-60} y={-128} width={120} height={18} rx={6} fill="#4a3a2c" /><rect x={-50} y={-110} width={12} height={110} fill="#3a2c20" /><rect x={38} y={-110} width={12} height={110} fill="#3a2c20" />
            <Seated who={CAST[0]} mood={zhMood} lx={8} ly={2} />
          </g>
          <Say x={1220} y={420} text="换不换？" o={ask} flip />
          <Say x={420} y={330} text="换！" o={hey} />
        </g>
      </svg>
      {rule > 0 && (
        <div style={{ position: 'absolute', left: 64, top: 100, opacity: rule, padding: '16px 24px', background: 'rgba(239,230,208,0.95)', borderRadius: 14, fontFamily: ZH, color: '#2b2118', fontSize: 26, lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, color: '#8a3b3b' }}>规则</div>
          <div>阿杰知道红包在哪</div>
          <div>他一定会翻开一个空杯，再问你换不换</div>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: '#efe9dc', opacity: white }} />
      <SubBand o={0.85} />
      {!end && <Chapter T={T} at={b(16.4)} out={b(18.6)} text="宿 舍 · 晚 上 十 点" />}
      <Subs T={T} lines={end ? LINES_END : LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

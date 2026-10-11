import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, zlerp, pop, win, Subs, SubBand, Chapter, Note, Line, Bust, Who, GOLD, CREAM, NIGHT, ZH, EN, GOLD_TEXT } from '../v6/ui6';
import { mulberry } from '../v1/data';
import { SIM100K } from './common8';
import { Vignette, Grain } from '../ui';

/* S3, b57 -> b96: 1990, the column, the letters, Erdős and the computer. 2D. */
export const S3_IN = b(53.25), S3_OUT = b(80.2);
const LINES: Line[] = [
  [b(53.4), b(58) - 0.08, '1990年，玛丽莲：[换]', '1990: Marilyn vos Savant says: switch.'],
  [b(58) + 0.06, b(63) - 0.08, '一万多封信：[你错了]', 'Over ten thousand letters said she was wrong.'],
  [b(63) + 0.06, b(68) - 0.08, '不少还是[博士]写的', 'Many were from PhDs.'],
  [b(68) + 0.06, b(73) - 0.08, '数学家埃尔德什也不信', 'Even Paul Erdős refused to believe it.'],
  [b(73) + 0.06, S3_OUT - 0.2, '直到电脑跑了[10万局]', 'Until a computer played 100,000 games.'],
];
const ENV = (() => { const r = mulberry(1990); return Array.from({ length: 420 }, () => ({ x: r(), d: r(), rot: r() - 0.5, phd: r() < 0.12, s: 0.7 + 0.5 * r() })); })();
const MARILYN: Who = { name: '玛丽莲', hair: 'updo', hairColor: '#7a4a2a', shirt: '#7a3b4a' };
const ERDOS: Who = { name: '埃尔德什', hair: 'bald', hairColor: '#cfcfcf', shirt: '#3a3f4a', glasses: true };

const Envelope: React.FC<{ s: number; phd: boolean; stamp: number }> = ({ s, phd, stamp }) => (
  <g transform={`scale(${s})`}>
    <rect x={-40} y={-26} width={80} height={52} rx={4} fill="#efe6d0" stroke="#c9b98f" strokeWidth={1.5} />
    <path d="M -40 -26 L 0 4 L 40 -26" fill="none" stroke="#c9b98f" strokeWidth={1.5} />
    {phd && <text x={0} y={20} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 15, fill: '#6b5b3a' }}>Ph.D.</text>}
    {stamp > 0 && <g opacity={stamp} transform="rotate(-14)"><rect x={-32} y={-14} width={64} height={28} rx={4} fill="none" stroke="#c4392f" strokeWidth={3} /><text x={0} y={7} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 18, fill: '#c4392f' }}>你错了</text></g>}
  </g>
);

export const HistoryScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < S3_IN - 0.05 || T > S3_OUT + 0.05) return null;
  const o = easeOut(prog(T, S3_IN, S3_IN + 0.6));
  // phases
  const page = win(T, b(53), b(68.2), 0.4, 0.4);
  const rain = prog(T, b(58.2), b(62));
  const pile = 1 - prog(T, b(67.6), b(68.2));
  const stamp = easeOut(prog(T, b(63.1), b(63.4)));
  const erd = win(T, b(68.2), b(80.3), 0.5, 0.01);
  const pc = easeOut(prog(T, b(73.1), b(73.7)));
  const games = Math.round(100000 * easeInOut(prog(T, b(73.3), b(76.4))));
  const swWins = Math.round(SIM100K.sw * (games / 100000));
  const stWins = games - swWins;
  // dive into the computer screen at the end
  const dive = Math.pow(prog(T, b(78.6), S3_OUT), 2.2);
  const s = zlerp(1, 9, dive);
  const count = Math.round(10000 * easeOut(prog(T, b(58.3), b(61.5))));
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, opacity: o, transform: `translate(${16 * Math.exp(-(T - b(63.1)) * 6) * (T > b(63.1) ? 1 : 0) * Math.sin(T * 80)}px, 0px)` }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 42%, #1b2136 0%, #070a14 72%)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(960 470) scale(${s}) translate(-960 -470)`}>
          {/* the column */}
          {page > 0 && (
            <g opacity={page} transform={`translate(${lerp(960, 640, easeInOut(prog(T, b(57.6), b(58.4))))} 470) rotate(-3) scale(${lerp(1, 0.78, easeInOut(prog(T, b(57.6), b(58.4))))})`}>
              <rect x={-360} y={-330} width={720} height={640} rx={6} fill="#f2ead8" />
              <text x={-320} y={-262} style={{ fontFamily: EN, fontWeight: 700, fontSize: 52, fill: '#2b2118' }}>Ask Marilyn</text>
              <text x={-320} y={-218} style={{ fontFamily: ZH, fontSize: 24, fill: '#6b5b3a' }}>《Parade》杂志专栏 · 1990年9月9日</text>
              <line x1={-320} y1={-196} x2={320} y2={-196} stroke="#c9b98f" strokeWidth={2} />
              <g transform="translate(250 -260)"><circle r={58} fill="#d9cdb2" /><Bust who={MARILYN} mood="smug" r={32} /></g>
              <text x={-320} y={-140} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 28, fill: '#2b2118' }}>读者问：三扇门，选了一扇，</text>
              <text x={-320} y={-98} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 28, fill: '#2b2118' }}>主持人开了一扇空门，要换吗？</text>
              {[0, 1, 2, 3].map((k) => <rect key={k} x={-320} y={-62 + k * 34} width={560 - k * 60} height={10} rx={5} fill="#d6ccb4" />)}
              <rect x={-330} y={90} width={660} height={120} rx={10} fill="#f6cf78" opacity={0.35 * easeOut(prog(T, b(54.6), b(55.1)))} />
              <text x={-310} y={146} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 44, fill: '#8a3b3b' }}>玛丽莲：应该换。</text>
              <text x={-310} y={192} style={{ fontFamily: ZH, fontSize: 26, fill: '#4a3d2a' }}>换，赢的机会是 2/3。</text>
            </g>
          )}
          {/* the letters */}
          {ENV.map((e, i) => {
            const t0 = e.d * 0.85;
            const k = clamp((rain - t0) / 0.15);
            if (k <= 0) return null;
            const x = 980 + e.x * 820, yEnd = 640 - Math.floor(i / 28) * 16 + (i % 2) * 6;
            const y = lerp(-80, yEnd, easeIn(k));
            return <g key={i} opacity={pile} transform={`translate(${x} ${y}) rotate(${e.rot * 40 * (1 - k) + e.rot * 18})`}><Envelope s={e.s * 0.85} phd={e.phd} stamp={stamp} /></g>;
          })}
          {rain > 0 && pile > 0 && (
            <text x={1390} y={150} textAnchor="middle" opacity={pile} style={{ fontFamily: EN, fontWeight: 700, fontSize: 92, fill: CREAM }}>{count.toLocaleString('en-US')}<tspan style={{ fontFamily: ZH, fontSize: 34 }} fill="rgba(243,237,226,0.7)"> 多封信</tspan></text>
          )}
          {/* Erdős */}
          {erd > 0 && (
            <g opacity={erd}>
              <g transform="translate(600 520)">
                <circle r={170} fill="#1e2740" />
                <Bust who={ERDOS} mood={T > b(75.2) ? 'worry' : 'shout'} r={92} />
                <text y={250} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, fill: CREAM }}>保罗·埃尔德什</text>
                <text y={290} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 22, fill: 'rgba(243,237,226,0.6)' }}>匈牙利数学家（示意画像）</text>
              </g>
              {pop(T, b(68.8), 0.35) > 0 && T < b(73.1) && (
                <g transform={`translate(760 300) scale(${Math.min(1, pop(T, b(68.8), 0.35))})`}>
                  <path d="M 0 60 L 30 10 L 70 10 Z" fill="#f6efe1" />
                  <rect x={-10} y={-90} width={300} height={104} rx={46} fill="#f6efe1" />
                  <text x={140} y={-22} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 52, fill: '#1d1c22' }}>不可能！</text>
                </g>
              )}
              {/* the computer */}
              {pc > 0 && (
                <g opacity={pc} transform="translate(1290 470)">
                  <rect x={-300} y={-230} width={600} height={430} rx={30} fill="#cfc6b0" />
                  <rect x={-260} y={-195} width={520} height={340} rx={18} fill="#0a1a10" />
                  <text x={-230} y={-140} style={{ fontFamily: 'monospace', fontSize: 30, fill: '#7dff9a' }}>GAMES  {games.toLocaleString('en-US')}</text>
                  <text x={-230} y={-60} style={{ fontFamily: 'monospace', fontSize: 30, fill: '#7dff9a' }}>STAY   WON {stWins.toLocaleString('en-US')}</text>
                  <text x={-230} y={10} style={{ fontFamily: 'monospace', fontSize: 30, fill: '#f6cf78' }}>SWITCH WON {swWins.toLocaleString('en-US')}</text>
                  <rect x={-230} y={50} width={460 * (games ? stWins / games : 0)} height={20} fill="#7dff9a" opacity={0.7} />
                  <rect x={-230} y={86} width={460 * (games ? swWins / games : 0)} height={20} fill="#f6cf78" />
                  <rect x={-80} y={200} width={160} height={40} fill="#b9b09a" />
                  <rect x={-180} y={240} width={360} height={24} rx={8} fill="#a89f88" />
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
      {T > b(63.1) && T < b(68) && (() => {
        const k = clamp((T - b(63.1)) / 0.18), sc = lerp(2.6, 1, easeOut(k)), out = 1 - prog(T, b(67.4), b(68));
        return <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: k * out, transform: `scale(${sc}) rotate(-12deg)` }}>
          <span style={{ display: 'inline-block', padding: '10px 40px', border: '10px solid #d23a2f', borderRadius: 18, fontFamily: ZH, fontWeight: 900, fontSize: 150, color: '#d23a2f', background: 'rgba(239,230,208,0.08)' }}>你错了！</span>
        </div>;
      })()}
      <div style={{ position: 'absolute', inset: 0, background: '#0a1a10', opacity: prog(T, S3_OUT - 0.35, S3_OUT) }} />
      <Chapter T={T} at={S3_IN + 0.5} out={b(68)} text="1990 · 一 万 多 封 信" />
      <Chapter T={T} at={b(68.4)} out={S3_OUT - 0.5} text="1995 · 埃 尔 德 什" />
      <Note T={T} at={b(73.3)} out={S3_OUT - 0.4} text="屏幕上为代码实时模拟的 10 万局　资料：CHANCE（美国统计学会）, Hoffman《The Man Who Loved Only Numbers》" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};
const easeIn = (x: number) => x * x;

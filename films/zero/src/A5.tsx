import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, cut, prog, easeOut, easeIn, rnd, EN, ZH, INK, FILM_END } from './lib';
import { Subs, SubBand, type Line } from './ui';
import { GoldTitle } from './Title';
import { Can2D, Cube2D, Glass2D, Counter2D } from './Kit2D';
import { JUNO } from './brand/identity';

/* A5 (b192–end), 2D. Back to the counter: the nine cubes of the opening sit beside the red can and dissolve as the line
   says the swap saves 35 g; a hard cut on the bar to a glass of still water ("but it isn't water"); then a short end card
   (~3.5 s) with the question, the follow line and the sources. The music fades out over the last 3 s. */
export const A5_IN = cut(192), END_IN = cut(206);

export const LINES_A5: Line[] = [
  [b(192) + 0.06, b(200) - 0.1, '把含糖可乐换成无糖的，确实少了[35克]糖；', 'Swapping to the sugar-free can does spare you 35 g of sugar;'],
  [b(200) + 0.06, b(206) - 0.15, '但它，不该当水喝。', 'but it isn\'t water.'],
];

const S = 46;
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const t = T - END_IN;
  if (t < 0) return null;
  const black = easeIn(prog(T, FILM_END - 0.5, FILM_END));
  const o = (a: number, d = 0.35) => easeOut(prog(t, a, a + d));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060b' }}>
      <svg width={1920} height={1080}>
        <defs><radialGradient id="a5-end" cx="0.5" cy="0.42" r="0.5"><stop offset="0" stopColor="#f6cf78" stopOpacity="0.1" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
        <rect width={1920} height={1080} fill="url(#a5-end)" />
        <GoldTitle text="零糖" T={T} at={END_IN} size={110} y={360} id="a5t" />
        <text x={960} y={500} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 56, fill: INK, letterSpacing: '0.06em' }} opacity={o(0.5)}>你的舌头，还需要多少甜？</text>
        <text x={960} y={558} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 28, fill: 'rgba(243,237,226,0.62)', letterSpacing: '0.12em' }} opacity={o(0.8)}>评论区说说：你一天喝几瓶“无糖”？</text>
        <g opacity={o(1.1)}>
          <rect x={960 - 330} y={612} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={649} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(1.3)} style={{ fontFamily: ZH, fontSize: 17, letterSpacing: '0.03em', fill: 'rgba(243,237,226,0.42)' }}>
          <text x={960} y={958} textAnchor="middle">资料：世界卫生组织（2023.5 代糖指南；2023.7 阿斯巴甜评估）· 美国 FDA · Witkowski 等, Nature Medicine (2023) · GB 28050 · 勤策消费研究 (2025)</text>
          <text x={960} y={986} textAnchor="middle">中国互联网联合辟谣平台 · 凤凰网 · 国家卫生健康委员会解读　|　分子结构由 RDKit 生成，受体为示意</text>
          <text x={960} y={1014} textAnchor="middle">瓶罐均为示意，非真实产品包装　|　本片不构成医学或饮食建议</text>
        </g>
        <rect width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};

export const A5: React.FC<{ T: number }> = ({ T }) => {
  if (T < A5_IN) return null;
  const shot = T < cut(200) ? 1 : 2;
  const gone = prog(T, b(195), b(196) + 0.4); // the cubes dissolve as the line says "35 g less"
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      {shot === 1 && (
        <>
          <Counter2D top={820} pool={[900, 820]} seed={6} />
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 9 }, (_, i) => {
              const x = 420 + ((i % 3) - 1) * S, y = 820 - Math.floor(i / 3) * S;
              if (gone >= 1) return null;
              const g = Math.max(0, Math.min(1, gone * 1.6 - (8 - i) * 0.07));
              return <g key={i}>
                <Cube2D x={x} y={y - 30 * g} s={S} o={1 - g} />
                {g > 0 && Array.from({ length: 6 }, (_, j) => <circle key={j} cx={x + (rnd(i * 7 + j, 1) - 0.5) * 120 * g} cy={y - 140 * g * rnd(i * 7 + j, 2)} r={2} fill="#f6cf78" opacity={(1 - g) * 0.9} />)}
              </g>;
            })}
            <Can2D kind="red" cx={760} base={820} h={420} id="a5r" />
            <Can2D kind="black" cx={1120} base={820} h={420} id="a5b" />
            <Glass2D cx={1480} base={820} h={330} id="a5g" />
          </svg>
        </>
      )}
      {shot === 2 && (
        <>
          <Counter2D top={900} pool={[1100, 900]} seed={7} />
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
            <Can2D kind="black" cx={560} base={900} h={640} id="a5b2" />
            <Glass2D cx={1180} base={900} h={600} id="a5g2" />
          </svg>
        </>
      )}
      <SubBand o={T < END_IN ? 1 : 0} />
      <Subs T={T} lines={LINES_A5} />
      <EndCard T={T} />
    </AbsoluteFill>
  );
};


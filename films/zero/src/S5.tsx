import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, EN, ZH, INK, FILM_END, type Key } from './lib';
import { Subs, SubBand, type Line } from './ui';
import { Counter3D, Bokeh, type CanState } from './Counter3D';
import { GoldTitle, CubeIcon } from './Title';
import { JUNO } from './brand/identity';

/* S5 (b294–end): back to the counter of the cold open, now with a glass of still water beside the two cans. Then the end card
   (last ~6 s, from b310): title, the question for the comments, the follow line, sources. */
export const S5_IN = b(294) - 0.4, END_IN = b(310);

export const LINES_S5: Line[] = [
  [b(294) + 0.1, b(302) - 0.1, '把含糖可乐换成无糖的，确实少了[35克]糖；', 'Swapping to the sugar-free can does spare you 35 g of sugar;'],
  [b(302) + 0.06, END_IN - 0.25, '但它，不该当水喝。', 'but it isn\'t water.'],
];

const KEYS: Key[] = [
  [S5_IN, [-0.6, 1.2, 3.6], [-0.4, 0.65, 0]],
  [END_IN, [0.3, 1.45, 4.9], [0.1, 0.6, 0]],
  [FILM_END, [0.35, 1.5, 5.2], [0.1, 0.6, 0]],
];

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const t = T - END_IN;
  if (t < -0.1) return null;
  const bg = easeInOut(prog(t, 0, 0.8));
  const black = easeIn(prog(T, FILM_END - 0.5, FILM_END));
  const o = (a: number, d = 0.5) => easeOut(prog(t, a, a + d));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <rect width={1920} height={1080} fill="#05060b" opacity={0.82 * bg} />
        <text x={960} y={250} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(0.2)}>ZERO SUGAR · 甜 味 剂</text>
        <GoldTitle text="零糖" T={T} at={END_IN + 0.3} size={110} y={400} id="end" />
        {Array.from({ length: 9 }, (_, k) => <CubeIcon key={k} x={960 + (k - 4) * 44} y={490} s={13} o={o(0.8 + k * 0.05, 0.4) * 0.5} />)}
        <text x={960} y={610} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 52, fill: INK, letterSpacing: '0.06em' }} opacity={o(1.4)}>你的舌头，还需要多少甜？</text>
        <text x={960} y={660} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.12em' }} opacity={o(1.8)}>评论区说说：你一天喝几瓶“无糖”？</text>
        <g opacity={o(2.3)}>
          <rect x={960 - 330} y={712} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={749} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(2.7)} style={{ fontFamily: ZH, fontSize: 17, letterSpacing: '0.03em', fill: 'rgba(243,237,226,0.42)' }}>
          <text x={960} y={958} textAnchor="middle">资料：世界卫生组织（2023.5 代糖指南；2023.7 阿斯巴甜评估）· 美国 FDA · Witkowski 等, Nature Medicine (2023) · GB 28050 · 勤策消费研究 (2025)</text>
          <text x={960} y={986} textAnchor="middle">Science History Institute · Chemistry World · 布里斯托大学 Molecule of the Month · 每日经济新闻 · 凤凰网 · 中国互联网联合辟谣平台</text>
          <text x={960} y={1014} textAnchor="middle">瓶罐均为示意，非真实产品包装　|　分子结构由 RDKit 生成，受体为示意　|　本片不构成医学或饮食建议</text>
        </g>
        <rect width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};

export const S5: React.FC<{ T: number }> = ({ T }) => {
  if (T < S5_IN) return null;
  const o = easeOut(prog(T, S5_IN, S5_IN + 0.8));
  const cans: CanState[] = [{ kind: 'red', p: [-0.95, 0, 0], ry: -0.15 }, { kind: 'black', p: [0.0, 0, 0.05], ry: 0.12 }];
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      <AbsoluteFill style={{ opacity: o }}>
        <Bokeh />
        <Counter3D T={T} keys={KEYS} cans={cans} glass={{ p: [0.95, 0, 0.1], level: 0.8 }} />
      </AbsoluteFill>
      <SubBand o={1 - prog(T, END_IN - 0.3, END_IN + 0.3)} />
      <Subs T={T} lines={LINES_S5} />
      <EndCard T={T} />
    </AbsoluteFill>
  );
};

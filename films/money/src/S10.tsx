import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeIn, easeInOut, camAt, FILM_END, EN, ZH, INK, type Key } from './lib';
import { Subs, SubBand, type Line } from './ui';
import { useModels, useAsset } from './useModels';
import { loadBillTex } from './kit';
import { TableSet, loadBar } from './S1';
import { GoldTitle, CoinOnBill } from './Title';
import { JUNO } from './brand/identity';

/* S10 (b294–b311): back at the noodle-shop table of the cold open. The camera rises off the note and the lights of the
   street behind multiply: billions of people believing together. Then the end card (last ~6 s, music keeps playing). */
export const S10_IN = b(294) - 0.5, END_IN = b(311);
const TOP = 0.76;

export const LINES_S10: Line[] = [
  [b(294) + 0.3, b(302) - 0.1, '所以，一张纸能换一顿饭，', 'So a slip of paper buys a meal'],
  [b(302) + 0.06, END_IN - 0.25, '是因为[几十亿人]一起相信它。', 'because billions of people believe in it together.'],
];

const KEYS: Key[] = [
  [S10_IN, [-0.075, TOP + 0.24, 0.15], [-0.08, TOP, 0.06]],
  [b(302), [0.0, TOP + 0.3, 0.5], [0.0, TOP + 0.05, 0.0]],
  [END_IN, [0.08, TOP + 0.3, 0.85], [0.0, TOP + 0.1, -0.6]],
  [FILM_END, [0.09, TOP + 0.31, 0.92], [0.0, TOP + 0.1, -0.6]],
];

const Monogram: React.FC<{ T: number; at: number; x: number; y: number }> = ({ T, at, x, y }) => {
  const r = 46, per = 2 * Math.PI * r;
  const d = easeInOut(prog(T, at, at + 0.9));
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#f1c56d" strokeWidth={2} strokeDasharray={per} strokeDashoffset={per * (1 - d)} transform={`rotate(-90 ${x} ${y})`} />
      <text x={x} y={y + 22} textAnchor="middle" style={{ fontFamily: EN, fontStyle: 'italic', fontWeight: 600, fontSize: 64, fill: '#f1c56d' }} opacity={easeOut(prog(T, at + 0.4, at + 0.9))}>J</text>
      <text x={x} y={y + r + 34} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 18, letterSpacing: '0.5em', fill: 'rgba(241,197,109,0.8)' }} opacity={easeOut(prog(T, at + 0.6, at + 1.1))}>JUNO</text>
    </g>
  );
};

const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const t = T - END_IN;
  if (t < -0.1) return null;
  const bg = easeInOut(prog(t, 0, 0.8));
  const black = easeIn(prog(T, FILM_END - 0.5, FILM_END));
  const o = (a: number, d = 0.5) => easeOut(prog(t, a, a + d));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: '#05060b', opacity: 0.86 * bg }} />
      <AbsoluteFill style={{ opacity: o(0.9, 0.6) }}>
        <CoinOnBill T={T} land={END_IN + 1.2} h={0.9} look={0.024} light={o(0.8, 0.6)} />
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <Monogram T={T} at={END_IN + 0.1} x={960} y={130} />
        <GoldTitle text="钱凭什么" T={T} at={END_IN + 0.3} size={100} y={330} id="end" />
        <text x={960} y={660} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 50, fill: INK, letterSpacing: '0.06em' }} opacity={o(1.5)}>现金、黄金、数字，你最信哪一种？</text>
        <text x={960} y={708} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.14em' }} opacity={o(1.8)}>评论区选一个</text>
        <g opacity={o(2.3)}>
          <rect x={960 - 330} y={748} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={785} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(2.7)} style={{ fontFamily: ZH, fontSize: 17, letterSpacing: '0.03em', fill: 'rgba(243,237,226,0.42)' }}>
          <text x={960} y={944} textAnchor="middle">资料：美联储（印钞成本 2023）· 世界黄金协会（2024）· 美联储历史（1944 / 1971）· 英格兰银行季刊（2014）· officialdata.org（美国CPI）</text>
          <text x={960} y={972} textAnchor="middle">UNESCO 殷墟 · LBMA / World History Encyclopedia（吕底亚）· 中新网 · 吴钩《宋朝的纸币》· Furness《The Island of Stone Money》(1910)</text>
          <text x={960} y={1000} textAnchor="middle">模型（Sketchfab, CC BY / CC0）：JFN · Coozy · Digital Atlas of Ancient Life · Frank McMains · Incg5764 · dukat.andrej · DITCH.WAV　|　钞票图像：美国印钞局（公有领域）　|　交子、方孔钱为示意</text>
        </g>
      </svg>
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

export const S10: React.FC<{ T: number }> = ({ T }) => {
  const m = useModels(['noodles', 'table']);
  const tex = useAsset('billtex', loadBillTex);
  const bar = useAsset('goldbar1', loadBar);
  if (T < S10_IN || !m || !tex || !bar) return null;
  const o = easeOut(prog(T, S10_IN, S10_IN + 0.8));
  const { pos, look } = camAt(KEYS, T);
  const focus = Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]);
  // the street lights behind multiply on "billions"
  const crowd = 220 * easeInOut(prog(T, b(302), b(309)));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060b' }}>
      <AbsoluteFill style={{ opacity: o }}>
        <TableSet T={T} keys={KEYS} bar={false} focus={T < b(302) ? focus : 0.9} aperture={T < b(302) ? 0.02 : 0.012} noodle={m.noodles} table={m.table} barMesh={bar} tex={tex} crowd={crowd} />
      </AbsoluteFill>
      <SubBand o={1 - prog(T, END_IN - 0.3, END_IN + 0.3)} />
      <Subs T={T} lines={LINES_S10} />
      <EndCard T={T} />
    </AbsoluteFill>
  );
};

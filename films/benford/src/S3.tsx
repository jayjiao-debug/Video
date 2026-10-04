import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, rnd, EN, ZH, GOLD, INK } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { PersonCard } from './PersonCard';

/* S3, 1938 (b104–b128, the quiet break): one slow pan along a wall of card-catalogue drawers, one drawer per
   category in Benford's 1938 table (20 categories, 20,229 numbers; Proc. Am. Phil. Soc. 78(4)). Each brass label
   lights as it is counted and the total climbs; the count runs on its own clock and stops on 20,229. */
export const S3_IN = b(104) - 0.3, S3_OUT = b(128) + 0.3;

export const LINES_S3: Line[] = [
  [b(104) + 0.2, b(112) - 0.1, '57年后，物理学家本福特重新发现了它。', 'Fifty-seven years later, the physicist Frank Benford found it again.'],
  [b(112) + 0.06, b(120) - 0.1, '他数了20类、[20,229]个数：', 'He counted 20,229 numbers of 20 kinds:'],
  [b(120) + 0.06, b(128) - 0.15, '河流面积、城市人口、物理常数……', 'river areas, populations, physical constants...'],
];

// Benford (1938), Table I: the 20 data sets and their sizes (sum 20,229)
const SETS: [string, number][] = [
  ['河流面积', 335], ['人口', 3259], ['物理常数', 104], ['报纸上的数', 100], ['比热', 1389], ['压强', 703], ['马力损失', 690],
  ['分子量', 1800], ['流域面积', 159], ['原子量', 91], ['数列 1/n, √n', 5000], ['设计数据', 560], ['《读者文摘》', 308],
  ['成本数据', 741], ['X 光电压', 707], ['棒球统计', 1458], ['黑体辐射', 1165], ['门牌号', 342], ['阶乘等', 900], ['死亡率', 418],
];
const COLS = 10, DW = 300, DH = 180, GX = 20, GY = 22;
const C0 = b(112) - 0.4, C1 = b(122); // counting window
const countAt = (k: number) => C0 + (C1 - C0) * Math.pow((k + 1) / SETS.length, 0.8);

export const S3: React.FC<{ T: number }> = ({ T }) => {
  if (T < S3_IN || T > S3_OUT) return null;
  const o = easeOut(prog(T, S3_IN, S3_IN + 0.8)) * (1 - easeInOut(prog(T, S3_OUT - 0.6, S3_OUT)));
  const pan = easeInOut(prog(T, S3_IN, S3_OUT)); // one slow move across the wall
  const wallW = COLS * (DW + GX);
  const x0 = lerp(140, 1920 - wallW - 140, pan);
  const total = SETS.reduce((s, [, n], k) => s + (T >= countAt(k) ? n : 0), 0);
  const roll = (k: number) => easeOut(prog(T, countAt(k) - 0.25, countAt(k) + 0.15));
  return (
    <AbsoluteFill style={{ backgroundColor: '#0c0d12', opacity: o }}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="oak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a3a22" /><stop offset="1" stopColor="#3a2414" /></linearGradient>
          <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8c27a" /><stop offset="1" stopColor="#9a6e2c" /></linearGradient>
          <radialGradient id="pool" cx="0.5" cy="0.35" r="0.65"><stop offset="0" stopColor="#ffd9a0" stopOpacity="0.32" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="#14110e" />
        <g transform={`translate(${x0},150)`}>
          <rect x={-30} y={-30} width={wallW + 40} height={2 * (DH + GY) + 40} rx={6} fill="#2a1a0e" />
          {SETS.map(([name, n], k) => {
            const cx = (k % COLS) * (DW + GX), cy = Math.floor(k / COLS) * (DH + GY);
            const lit = roll(k);
            return (
              <g key={k} transform={`translate(${cx},${cy})`}>
                <rect width={DW} height={DH} rx={4} fill="url(#oak)" stroke="#1c1108" strokeWidth={3} />
                {Array.from({ length: 6 }, (_, i) => <rect key={i} x={10} y={14 + i * 26} width={DW - 20} height={2} fill="#2a1a0e" opacity={0.35 + 0.2 * rnd(k * 7 + i, 41)} />)}
                {/* brass label holder: category and its count */}
                <rect x={DW / 2 - 110} y={34} width={220} height={74} rx={4} fill="url(#brass)" opacity={0.55 + 0.45 * lit} />
                <rect x={DW / 2 - 102} y={41} width={204} height={60} rx={2} fill="#efe4c8" />
                <text x={DW / 2} y={68} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 24, fill: '#2a1d10' }}>{name}</text>
                <text x={DW / 2} y={95} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 24, fill: lit > 0.5 ? '#9a6418' : '#5a4a32', fontVariantNumeric: 'lining-nums' }}>{n.toLocaleString('en-US')}</text>
                {/* brass pull */}
                <rect x={DW / 2 - 40} y={128} width={80} height={16} rx={8} fill="url(#brass)" />
                <rect width={DW} height={DH} rx={4} fill="#ffcf80" opacity={0.22 * lit * (1 - prog(T, countAt(k) + 0.2, countAt(k) + 1.4))} />
              </g>
            );
          })}
        </g>
        <rect width={1920} height={1080} fill="url(#pool)" />
        {/* the running total */}
        <g opacity={easeOut(prog(T, C0 - 0.3, C0 + 0.3))}>
          <text x={960} y={720} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 700, fontSize: 120, fill: T >= C1 ? GOLD : INK, fontVariantNumeric: 'lining-nums tabular-nums' }}>{total.toLocaleString('en-US')}</text>
          <text x={960} y={770} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 28, letterSpacing: '0.2em', fill: 'rgba(243,237,226,0.6)' }}>个 数</text>
        </g>
      </svg>
      <SubBand />
      <Chapter T={T} at={b(104)} out={b(128)} text="1938 · 通 用 电 气 研 究 实 验 室" />
      <PersonCard T={T} at={b(105)} out={b(112)} name="FRANK BENFORD" zh="弗兰克·本福特" years="1883 – 1948" role="物理学家 · 通用电气研究实验室" beard={false} glasses x={110} y={560} />
      <Subs T={T} lines={LINES_S3} />
    </AbsoluteFill>
  );
};

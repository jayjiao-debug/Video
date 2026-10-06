import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, FontFaces, poly, P2, learnRate, ACC_STAR, Txt } from './kit13';

/* Douyin covers: the learning-speed curve with its peak at ≈85 %, the hook number, the title. */
export const Cover13: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const tall = h > w;
  const gx0 = tall ? 120 : 140, gx1 = w - (tall ? 120 : 140), gy = tall ? 1060 : 800, GH = tall ? 420 : 380;
  const X = (a: number) => gx0 + (gx1 - gx0) * (a - 0.5) / 0.5, Y = (a: number) => gy - GH * learnRate(a);
  const pts: P2[] = Array.from({ length: 121 }, (_, i) => { const a = 0.5 + 0.5 * i / 120; return [X(a), Y(a)]; });
  const px = X(ACC_STAR), py = Y(ACC_STAR);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <FontFaces />
      <svg width={w} height={h}>
        <line x1={gx0} y1={gy} x2={gx1 + 20} y2={gy} stroke={C.line} strokeWidth={4} />
        <line x1={gx0} y1={gy} x2={gx0} y2={gy - GH - 60} stroke={C.line} strokeWidth={4} />
        {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((v) => <Txt key={v} x={X(v)} y={gy + 52} size={34} font={F.math} fill={C.grey}>{`${Math.round(v * 100)}%`}</Txt>)}
        <path d={poly(pts)} stroke={C.blue} strokeWidth={9} fill="none" strokeLinecap="round" />
        <line x1={px} y1={py} x2={px} y2={gy} stroke={C.yellow} strokeWidth={4} strokeDasharray="12 12" />
        <circle cx={px} cy={py} r={16} fill={C.yellow} />
        <rect x={px - 170} y={py - 150} width={340} height={118} fill="none" stroke={C.yellow} strokeWidth={4} />
        <Txt x={px} y={py - 62} size={92} font={F.math} fill={C.yellow}>85%</Txt>
        {tall ? (
          <g>
            <Txt x={w / 2} y={190} size={72} weight={900} fill={C.white}>有一个数字，</Txt>
            <Txt x={w / 2} y={290} size={72} weight={900} fill={C.white}>决定你学得快不快</Txt>
            <Txt x={w / 2} y={1290} size={150} font={'"Noto Serif CJK SC", serif'} weight={700} ls="0.12em" fill={C.white}>心流</Txt>
            <Txt x={w / 2} y={1370} size={28} ls="0.3em" fill={C.grey}><tspan fill={C.yellow}>▸ </tspan>Juno · VIBE知识大赏</Txt>
          </g>
        ) : (
          <g>
            <Txt x={w / 2} y={150} size={74} weight={900} fill={C.white}>有一个数字，决定你学得快不快</Txt>
            <Txt x={w - 70} y={1010} size={100} anchor="end" font={'"Noto Serif CJK SC", serif'} weight={700} ls="0.1em" fill={C.white}>心流</Txt>
            <Txt x={70} y={1010} size={26} anchor="start" ls="0.3em" fill={C.grey}><tspan fill={C.yellow}>▸ </tspan>Juno · VIBE知识大赏</Txt>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
export const Cover13Wide: React.FC = () => <Cover13 w={1440} h={1080} />;
export const Cover13Tall: React.FC = () => <Cover13 w={1080} h={1440} />;

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { prog, easeOut, easeInOut, easeIn3, CREAM, ZH, EN } from '../v6/ui6';
import { GoldTitle } from '../brand/Brand';
import { JUNO } from '../brand/identity';
import { CARD8 } from './Dorm8';
import { FILM_END8 } from './common8';

export const EndCard8: React.FC<{ T: number }> = ({ T }) => {
  const t = T - CARD8;
  if (t < -0.05) return null;
  const f = t * 30;
  const card = easeInOut(prog(t, 0, 0.8));
  const black = easeIn3(prog(T, FILM_END8 - 0.7, FILM_END8));
  const o = (a: number, d = 0.5) => easeOut(prog(t, a, a + d));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <rect width={1920} height={1080} fill="#05060b" opacity={0.84 * card} />
        <text x={960} y={262} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(0.2)}>THE MONTY HALL PROBLEM · 三 门 问 题</text>
        <GoldTitle text="换不换" f={f} at={8} size={112} y={405} />
        <g transform="translate(960 480)" opacity={o(0.9)}>
          {[-70, 0, 70].map((x, i) => <rect key={i} x={x - 22} y={-30} width={44} height={60} rx={4} fill="none" stroke={i === 1 ? '#f6cf78' : '#e9e4da'} strokeWidth={i === 1 ? 4 : 2} opacity={i === 2 ? 0.35 : 1} />)}
        </g>
        <text x={960} y={590} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 46, fill: CREAM, letterSpacing: '0.06em' }} opacity={o(1.4)}>第一反应：换扣 1，不换扣 2</text>
        <text x={960} y={640} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.1em' }} opacity={o(1.8)}>@ 一个你觉得会选错的朋友</text>
        <g opacity={o(2.3)}>
          <rect x={960 - 330} y={690} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={727} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(2.7)} style={{ fontFamily: ZH, fontSize: 17, letterSpacing: '0.03em', fill: 'rgba(243,237,226,0.42)' }}>
          <text x={960} y={968} textAnchor="middle">资料：CHANCE（美国统计学会）"Monty Hall and the Leibniz Illusion" · Herbranson & Schroeder, Journal of Comparative Psychology (2010)</text>
          <text x={960} y={996} textAnchor="middle">Hoffman《The Man Who Loved Only Numbers》(1998)　模拟结果为代码实时计算；宿舍、人物与曲线为示意</text>
        </g>
        <rect width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};

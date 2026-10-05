import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { Counter3D, type CanState } from './Counter3D';
import { cubesAt, RED_X, BLACK_X } from './S0';
import { EN, ZH, INK, type Key } from './lib';
import { Vignette, Grain } from './ui';
import { JUNO } from './brand/identity';

/* Douyin covers, drawn natively at size from the film's own counter (S0): the red can with its nine sugar cubes and
   the black sugar-free can, under the same lamp. Hook in two lines ("一罐 0 克糖 / 凭什么甜？", the second gold), the
   35 g → 0 g line, the gold title and the series line. wide = 1440×1080 (4:3), tall = 1080×1440 (3:4; lower 18%
   kept clear). */
type Layout = 'wide' | 'tall';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '700 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"'].map((f) => document.fonts.load(f, '测试0123克').catch(() => null)))
      .then(() => continueRender(handle));
  }, [handle]);
};

const CAM: Record<Layout, Key[]> = {
  wide: [[0, [-1.66, 1.45, 7.6], [-1.49, 1.0, 0]], [1, [-1.66, 1.45, 7.6], [-1.49, 1.0, 0]]],
  tall: [[0, [-0.3, 1.75, 7.1], [-0.3, 1.22, 0]], [1, [-0.3, 1.75, 7.1], [-0.3, 1.22, 0]]],
};
const CANS: CanState[] = [{ kind: 'red', p: [RED_X, 0, 0], ry: -0.12 }, { kind: 'black', p: [BLACK_X, 0, 0], ry: 0.1 }];

const Gold: React.FC<{ id: string; children: React.ReactNode; y: number; size: number; x: number; anchor: 'start' | 'middle' }> = ({ id, children, y, size, x, anchor }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1={y - size * 0.85} x2="0" y2={y + size * 0.15} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#f3cd7a" /><stop offset="0.72" stopColor="#c99140" /><stop offset="1" stopColor="#8a5a22" />
      </linearGradient>
    </defs>
    <text x={x} y={y} textAnchor={anchor} fill={`url(#${id})`} style={{ fontFamily: ZH, fontWeight: 900, fontSize: size, filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.85))', fontVariantNumeric: 'lining-nums' }}>{children}</text>
  </>
);

export const Cover: React.FC<{ layout: Layout }> = ({ layout }) => {
  useFonts();
  const wide = layout === 'wide';
  const w = wide ? 1440 : 1080, h = wide ? 1080 : 1440;
  const ax = wide ? 96 : w / 2, anchor = wide ? 'start' : 'middle';
  const y = wide
    ? { kicker: 236, l1: 396, l2: 590, sub: 676, title: 850, series: 912 }
    : { kicker: 150, l1: 300, l2: 486, sub: 566, title: 668, series: 722 };
  const big = wide ? 120 : 124, gold = wide ? 168 : 176;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      <Counter3D T={0.5} keys={CAM[layout]} cans={CANS} cubes={cubesAt(60)} lamp={1.05} />
      {/* darken behind the text so it reads at thumbnail size */}
      <AbsoluteFill style={{ background: wide
        ? 'linear-gradient(90deg, rgba(3,5,10,0.94) 0%, rgba(3,5,10,0.8) 36%, rgba(3,5,10,0) 58%)'
        : 'linear-gradient(180deg, rgba(3,5,10,0.94) 0%, rgba(3,5,10,0.8) 42%, rgba(3,5,10,0) 56%, rgba(3,5,10,0) 80%, rgba(3,5,10,0.7) 100%)' }} />
      <Vignette strength={0.55} />
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <text x={ax} y={y.kicker} textAnchor={anchor} style={{ fontFamily: EN, fontWeight: 700, fontSize: 26, letterSpacing: '0.38em', fill: JUNO.colors.gold }}>ZERO SUGAR · 甜味剂</text>
        <text x={ax} y={y.l1} textAnchor={anchor} style={{ fontFamily: ZH, fontWeight: 900, fontSize: big, fill: INK, letterSpacing: '0.02em', filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.85))' }}>
          一罐<tspan fontFamily={EN} fontWeight={700} fontSize={big * 1.25} style={{ fontVariantNumeric: 'lining-nums' }}> 0 </tspan>克糖
        </text>
        <Gold id="cv-gold" x={ax} y={y.l2} size={gold} anchor={anchor}>凭什么甜？</Gold>
        <text x={ax} y={y.sub} textAnchor={anchor} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, fill: 'rgba(243,237,226,0.8)', letterSpacing: '0.06em' }}>
          含糖那罐<tspan fontFamily={EN} fontWeight={700} fontSize={44} fill={JUNO.colors.gold} style={{ fontVariantNumeric: 'lining-nums' }}> 35 </tspan>克 · 无糖这罐<tspan fontFamily={EN} fontWeight={700} fontSize={44} fill={JUNO.colors.gold} style={{ fontVariantNumeric: 'lining-nums' }}> 0 </tspan>克
        </text>
        <Gold id="cv-title" x={ax} y={y.title} size={wide ? 64 : 70} anchor={anchor}>《零糖》</Gold>
        <text x={ax} y={y.series} textAnchor={anchor} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 26, letterSpacing: '0.3em', fill: 'rgba(243,237,226,0.72)' }}>{JUNO.series}</text>
      </svg>
      <div style={{ position: 'absolute', top: wide ? 64 : 64, right: wide ? 86 : 66, fontFamily: ZH, fontWeight: 500, fontSize: 22, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.6)' }}>
        <span style={{ color: JUNO.colors.gold }}>◆ </span>{JUNO.mark}
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

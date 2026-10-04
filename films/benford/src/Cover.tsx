import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { Globe, C, worldOf, project, spinFor } from './globe';
import { EN, ZH, INK, GOLD, type Key } from './lib';
import { COUNT } from './S01';
import { Vignette, Grain } from './ui';
import { JUNO } from './brand/identity';

/* Douyin covers, drawn natively at size from the film's own Earth (S9): the night-side globe with the 65 countries
   whose population begins with 1 lit gold. Hook in two lines ("1开头的数 / 竟占30%", the second gold), the nine bars,
   the gold title and the series line. wide = 1440×1080 (4:3), tall = 1080×1440 (3:4; lower 18% kept clear). */
type Layout = 'wide' | 'tall';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '700 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"'].map((f) => document.fonts.load(f, '测试0123%').catch(() => null)))
      .then(() => continueRender(handle));
  }, [handle]);
};

const SPIN = spinFor(40);
const CAM: Record<Layout, Key[]> = {
  wide: [[0, [-4.6, 1.0, 18], [-4.6, 0.3, 0]], [1, [-4.6, 1.0, 18], [-4.6, 0.3, 0]]],
  tall: [[0, [0, 6.2, 19.5], [0, 6.6, 0]], [1, [0, 6.2, 19.5], [0, 6.6, 0]]],
};
const ONES = C.filter((c) => c.d === 1);

const Gold: React.FC<{ id: string; children: React.ReactNode; y: number; size: number; x: number; anchor: 'start' | 'middle'; font?: string }> = ({ id, children, y, size, x, anchor, font = ZH }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1={y - size * 0.85} x2="0" y2={y + size * 0.15} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#f3cd7a" /><stop offset="0.72" stopColor="#c99140" /><stop offset="1" stopColor="#8a5a22" />
      </linearGradient>
    </defs>
    <text x={x} y={y} textAnchor={anchor} fill={`url(#${id})`} style={{ fontFamily: font, fontWeight: 900, fontSize: size, filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.85))', fontVariantNumeric: 'lining-nums' }}>{children}</text>
  </>
);

export const Cover: React.FC<{ layout: Layout }> = ({ layout }) => {
  useFonts();
  const wide = layout === 'wide';
  const w = wide ? 1440 : 1080, h = wide ? 1080 : 1440;
  const keys = CAM[layout];
  const ax = wide ? 96 : w / 2, anchor = wide ? 'start' : 'middle';
  // text block positions
  const y = wide
    ? { kicker: 236, l1: 400, l2: 600, bars: 700, title: 868, series: 930 }
    : { kicker: 214, l1: 380, l2: 590, bars: 640, title: 836, series: 896 };
  const barX = (k: number) => (wide ? ax + k * 40 : ax + (k - 4) * 40 - 13);
  return (
    <AbsoluteFill style={{ backgroundColor: '#02040a' }}>
      <Globe T={0.5} keys={keys} spin={SPIN} dim={0.92} />
      {ONES.map((c) => {
        const p = project(keys, 0.5, worldOf(c.lat, c.lon, SPIN, 5.05), w, h);
        const a = Math.max(0, Math.min(1, (p.facing - 0.05) / 0.2));
        if (a <= 0.01) return null;
        return <div key={c.code} style={{ position: 'absolute', left: p.x - 8, top: p.y - 8, width: 16, height: 16, borderRadius: 8, background: GOLD, opacity: a, boxShadow: '0 0 18px 5px rgba(246,207,120,0.75)' }} />;
      })}
      {/* darken behind the text so it reads at thumbnail size */}
      <AbsoluteFill style={{ background: wide
        ? 'linear-gradient(90deg, rgba(2,4,10,0.92) 0%, rgba(2,4,10,0.75) 38%, rgba(2,4,10,0) 62%)'
        : 'linear-gradient(180deg, rgba(2,4,10,0.92) 0%, rgba(2,4,10,0.7) 45%, rgba(2,4,10,0) 62%)' }} />
      <Vignette strength={0.55} />
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="cv-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6a8" /><stop offset="1" stopColor="#c8913a" /></linearGradient></defs>
        <text x={ax} y={y.kicker} textAnchor={anchor} style={{ fontFamily: EN, fontWeight: 700, fontSize: 26, letterSpacing: '0.38em', fill: JUNO.colors.gold }}>BENFORD'S LAW · 本福特定律</text>
        <text x={ax} y={y.l1} textAnchor={anchor} style={{ fontFamily: ZH, fontWeight: 900, fontSize: wide ? 128 : 136, fill: INK, letterSpacing: '0.02em', filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.85))' }}>1开头的数</text>
        <Gold id="cv-gold" x={ax} y={y.l2} size={wide ? 176 : 184} anchor={anchor}>竟占<tspan fontFamily={EN} fontSize={wide ? 220 : 228}>30%</tspan></Gold>
        {Array.from({ length: 9 }, (_, k) => {
          const bh = (COUNT(k + 1) / 65) * 92;
          return <rect key={k} x={barX(k)} y={y.bars + 92 - bh} width={26} height={bh} fill="url(#cv-bar)" opacity={k === 0 ? 1 : 0.55} />;
        })}
        <Gold id="cv-title" x={ax} y={y.title} size={wide ? 64 : 70} anchor={anchor}>《第一位数字》</Gold>
        <text x={ax} y={y.series} textAnchor={anchor} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 26, letterSpacing: '0.3em', fill: 'rgba(243,237,226,0.72)' }}>{JUNO.series}</text>
      </svg>
      <div style={{ position: 'absolute', top: wide ? 64 : 70, right: wide ? 86 : 66, fontFamily: ZH, fontWeight: 500, fontSize: 22, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.6)' }}>
        <span style={{ color: JUNO.colors.gold }}>◆ </span>{JUNO.mark}
      </div>
      <Grain />
    </AbsoluteFill>
  );
};

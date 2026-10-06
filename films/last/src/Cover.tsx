import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { SANS, MONO, INK, DIM, RED, rnd } from './lib';
import { TitleLockup } from './logo';
import { JUNO } from './brand/identity';

/* Douyin covers for 《最后一面》, in the film's own look (near-black, hard white, signal red, Noto Sans Black + mono;
   the owner asked this episode's identity to follow the film rather than gold). The hero is the film's pair, 你 (white)
   and TA (red), flying apart with their trails, a dashed line still between them. Hook: "第10年起 / 近六成，再也不见"
   with the model assumption under it, then the title lockup. wide = 1440×1080 (4:3), tall = 1080×1440 (3:4; the
   lower 18% kept clear for Douyin's UI). */
type Layout = 'wide' | 'tall';

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['400 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '400 40px "JunoMono"', '700 40px "JunoMono"']
      .map((f) => document.fonts.load(f, '测试0123P%')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
};

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };

export const Cover: React.FC<{ layout: Layout }> = ({ layout }) => {
  useFonts();
  const wide = layout === 'wide';
  const w = wide ? 1440 : 1080, h = wide ? 1080 : 1440, cx = w / 2;
  const y = wide
    ? { kicker: 168, l1: 318, l2: 486, sub: 566, pair: 704, logo: 936, logoSize: 92 }
    : { kicker: 176, l1: 352, l2: 524, sub: 606, pair: 790, logo: 1064, logoSize: 96 };
  const l1 = wide ? 132 : 128, l2 = wide ? 142 : 116;
  const half = wide ? 470 : 380;
  const A = [cx - half, y.pair], B = [cx + half, y.pair];
  const trail = (p: number[], dir: number, col: string) => Array.from({ length: 16 }, (_, i) => (
    <circle key={i} cx={p[0] + dir * i * 9} cy={p[1]} r={24 - i * 1.1} fill={col} opacity={0.3 * (1 - i / 16)} />
  ));
  const G = 56;
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < w / G + 1; i++) for (let j = 0; j < h / G + 1; j++) dots.push(<circle key={`${i}-${j}`} cx={i * G + 20} cy={j * G + 18} r={1.2} fill="rgba(242,240,234,0.09)" />);
  const dust = Array.from({ length: 60 }, (_, i) => {
    const z = 0.3 + rnd(i, 1) * 1.2;
    return <circle key={i} cx={rnd(i, 2) * w} cy={rnd(i, 3) * h} r={0.8 + z * 1.4} fill={INK} opacity={0.06 + 0.14 * z} />;
  });
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 75% at 50% 48%, #121318 0%, #08080b 62%, #040405 100%)' }}>
      <style>{`
        @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono.ttf')}) format("truetype"); font-weight: 400; }
        @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
      `}</style>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="cv-glow" cx="0.5" cy={y.pair / h} r="0.55"><stop offset="0" stopColor="#ff3d2e" stopOpacity="0.10" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        </defs>
        {dots}
        {dust}
        <rect width={w} height={h} fill="url(#cv-glow)" />
        <text x={cx} y={y.kicker} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.42em', fill: DIM }}>LAST MEETING THEORY</text>
        <text x={cx} y={y.l1} textAnchor="middle" style={{ ...BLACK, fontSize: l1, fill: INK, filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.85))' }}>
          第<tspan fontFamily={MONO} fontWeight={700} fontSize={l1 * 1.05}>10</tspan>年起
        </text>
        <text x={cx} y={y.l2} textAnchor="middle" style={{ ...BLACK, fontSize: l2, fill: RED, filter: 'drop-shadow(0 0 22px rgba(255,61,46,0.45))' }}>近六成，再也不见</text>
        <text x={cx} y={y.sub} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: wide ? 34 : 32, fill: 'rgba(242,240,234,0.78)', letterSpacing: '0.06em' }}>
          假设每年少见两成，剩下的见面期望只有<tspan fontFamily={MONO} fontWeight={700} fontSize={wide ? 46 : 42} fill={RED}> 5 </tspan>次
        </text>
        {/* the pair, flying apart */}
        <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="rgba(242,240,234,0.35)" strokeWidth={2} strokeDasharray="10 10" />
        {trail(A, 1, INK)}{trail(B, -1, RED)}
        <circle cx={A[0]} cy={A[1]} r={28} fill={INK} style={{ filter: 'drop-shadow(0 0 16px rgba(242,240,234,0.8))' }} />
        <circle cx={B[0]} cy={B[1]} r={28} fill={RED} style={{ filter: 'drop-shadow(0 0 16px rgba(255,61,46,0.9))' }} />
        <text x={A[0]} y={A[1] - 50} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, fill: INK }}>你</text>
        <text x={B[0]} y={B[1] - 50} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, fill: RED }}>TA</text>
        {/* the film's title lockup (drawn around x = 960) */}
        <g transform={`translate(${cx - 960} 0)`}>
          <TitleLockup T={0} at={0} size={y.logoSize} cy={y.logo} still />
        </g>
      </svg>
      <div style={{ position: 'absolute', top: 60, right: wide ? 80 : 64, fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.6)' }}>
        <span style={{ color: RED }}>◆ </span>{JUNO.mark}
      </div>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ opacity: 0.05 }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
    </AbsoluteFill>
  );
};

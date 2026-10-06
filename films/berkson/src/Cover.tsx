import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from 'remotion';
import { SANS, MONO, rnd } from './lib';
import { LOOKS, LookCtx } from './look';
import { ProfileCard } from './ui';
import { JUNO } from './brand/identity';
import data from './points.json';

/* Douyin covers for 《筛子》 in the film's 划卡 look (plum black, hot pink, mint). Hero: the film's key frame, the
   kept people (pink cards) above the 够格线 with the falling mint trend line and the swiped-away ghosts, plus one
   profile card with 喜欢. Hook: "只是左滑了一下 / 0 → −0.64". wide = 1440×1080 (4:3), tall = 1080×1440 (3:4; lower
   18% kept clear for Douyin's UI). */
type Layout = 'wide' | 'tall';
type P = [number, number, number];
const PTS = data.pts as P[];
const THR = (data.thr + 6) / 6;
const L = LOOKS.card;
const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['400 40px "Noto Sans CJK SC"', '700 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '700 40px "JunoMono"']
      .map((f) => document.fonts.load(f, '测试0123P%')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
};

const fitKept = () => {
  const k = PTS.filter((p) => p[2]); const n = k.length;
  const mx = k.reduce((a, p) => a + p[0], 0) / n, my = k.reduce((a, p) => a + p[1], 0) / n;
  let sxy = 0, sxx = 0; for (const p of k) { sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) ** 2; }
  return { mx, my, b: sxy / sxx };
};
const FK = fitKept();

const Plot: React.FC<{ x0: number; y1: number; S: number }> = ({ x0, y1, S }) => {
  const sx = (X: number) => x0 + X * S, sy = (Y: number) => y1 - Y * S;
  const lx0 = 0.25, lx1 = 0.95;
  return (
    <g>
      <line x1={x0} y1={y1} x2={x0 + S + 20} y2={y1} stroke={L.dim} strokeWidth={2} />
      <line x1={x0} y1={y1} x2={x0} y2={y1 - S - 20} stroke={L.dim} strokeWidth={2} />
      <text x={x0 + S + 10} y={y1 + 40} textAnchor="end" style={{ ...BLACK, fontSize: 30, fill: L.accent }}>颜值 →</text>
      <text x={x0 - 14} y={y1 - S + 6} textAnchor="end" style={{ ...BLACK, fontSize: 30, fill: L.second }}>性格↑</text>
      {PTS.map((p, i) => {
        const x = sx(p[0]), y = sy(p[1]);
        if (p[2]) return <rect key={i} x={x - 4.5} y={y - 6} width={9} height={12} rx={2.2} fill={L.accent} />;
        const k = rnd(i, 8);
        return <rect key={i} x={x - 4 - 60 * k * k} y={y - 5} width={8} height={10} rx={2} fill="rgba(255,242,246,0.5)" opacity={0.12 + 0.2 * (1 - k)} transform={`rotate(${-20 * k} ${x} ${y})`} />;
      })}
      <line x1={sx(THR - 1)} y1={sy(1)} x2={sx(1)} y2={sy(THR - 1)} stroke={L.accent} strokeWidth={5} style={{ filter: `drop-shadow(0 0 10px ${L.accentGlow})` }} />
      <line x1={sx(lx0)} y1={sy(FK.my + FK.b * (lx0 - FK.mx))} x2={sx(lx1)} y2={sy(FK.my + FK.b * (lx1 - FK.mx))} stroke={L.second} strokeWidth={7} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${L.secondGlow})` }} />
    </g>
  );
};

export const Cover: React.FC<{ layout: Layout }> = ({ layout }) => {
  useFonts();
  const wide = layout === 'wide';
  const w = wide ? 1440 : 1080, h = wide ? 1080 : 1440;
  const tx = wide ? 1010 : w / 2;
  const y = wide
    ? { kicker: 250, l1: 380, l2: 540, sub: 610, title: 800, series: 856 }
    : { kicker: 150, l1: 290, l2: 450, sub: 525, title: 1100, series: 1150 };
  const pick = PTS.findIndex((p) => p[2] && p[0] > 0.72 && p[1] < 0.5);
  return (
    <LookCtx.Provider value={L}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 75% at 40% 45%, #2a1232 0%, #140816 58%, #070308 100%)' }}>
        <style>{`
          @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono.ttf')}) format("truetype"); font-weight: 400; }
          @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
        `}</style>
        <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: Math.ceil(w / 56) + 1 }, (_, i) => Array.from({ length: Math.ceil(h / 56) + 1 }, (_, j) => <circle key={`${i}-${j}`} cx={i * 56 + 20} cy={j * 56 + 20} r={1.2} fill={L.grid} />))}
          {wide ? <Plot x0={110} y1={900} S={560} /> : <Plot x0={260} y1={945} S={380} />}
          <g transform={wide ? 'translate(470 300) rotate(-8) scale(0.6)' : 'translate(860 700) rotate(9) scale(0.5)'}>
            <ProfileCard L={L} id="cv" seed={pick} looks={PTS[pick][0]} pers={PTS[pick][1]} stamp="yes" stampK={1} glow={0.7} />
          </g>
          <g textAnchor={wide ? 'middle' : 'middle'}>
            <text x={tx} y={y.kicker} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.42em', fill: L.dim }}>BERKSON'S PARADOX</text>
            <text x={tx} y={y.l1} textAnchor="middle" style={{ ...BLACK, fontSize: wide ? 96 : 104, fill: L.ink, filter: 'drop-shadow(0 6px 24px rgba(0,0,0,0.85))' }}>只是左滑了一下</text>
            <text x={tx} y={y.l2} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: wide ? 130 : 140, fill: L.accent, filter: `drop-shadow(0 0 22px ${L.accentGlow})` }}>0 → −0.64</text>
            <text x={tx} y={y.sub} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: wide ? 30 : 32, fill: 'rgba(255,242,246,0.8)', letterSpacing: '0.04em' }}>颜值和性格的相关，凭空出现了</text>
            <text x={tx} y={y.title} textAnchor="middle" style={{ ...BLACK, fontSize: wide ? 84 : 90, fill: L.ink, letterSpacing: '0.08em' }}>《筛子》</text>
            {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={tx - 120 + i * 40} cy={y.title + 28} r={9} fill="none" stroke={L.accent} strokeWidth={4} />)}
            <text x={tx} y={y.series + 24} textAnchor="middle" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.45em', fill: L.dim }}>{JUNO.series}</text>
          </g>
        </svg>
        <div style={{ position: 'absolute', top: 56, right: wide ? 70 : 60, fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.3em', color: 'rgba(255,242,246,0.6)' }}>
          <span style={{ color: L.accent }}>◆ </span>{JUNO.mark}
        </div>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)' }} />
        <AbsoluteFill style={{ opacity: 0.05 }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
      </AbsoluteFill>
    </LookCtx.Provider>
  );
};

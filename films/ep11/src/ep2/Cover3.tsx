import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN } from '../lib';
import { Background, Vignette, Grain, Glow } from '../ui';
import { CanvasLayer, glowDot, rnd } from './common';
import { PeepFig } from '../v/scenesV';
import { TA } from './scenes1';

const Skyline: React.FC<{ w: number; base: number; top: number; seed: string }> = ({ w, base, top, seed }) => {
  const b: { x: number; w: number; h: number }[] = [];
  let x = -20, i = 0;
  while (x < w) { const bw = 70 + rnd(`${seed}w${i}`) * 110; b.push({ x, w: bw, h: (base - top) * (0.35 + rnd(`${seed}h${i}`) * 0.65) }); x += bw + 6; i++; }
  return (
    <svg width={w} height={base} style={{ position: 'absolute', left: 0, top: 0 }}>
      {b.map((d, k) => (
        <g key={k}>
          <rect x={d.x} y={base - d.h} width={d.w} height={d.h} fill="#161a26" />
          {Array.from({ length: Math.floor(d.h / 34) * Math.floor(d.w / 26) }, (_, j) => {
            const cols = Math.floor(d.w / 26), r = Math.floor(j / cols), c = j % cols;
            if (rnd(`${seed}l${k}_${j}`) > 0.42) return null;
            return <rect key={j} x={d.x + 10 + c * 26} y={base - d.h + 14 + r * 34} width={9} height={13} fill="#e9c27a" opacity={0.35 + rnd(`${seed}o${k}_${j}`) * 0.45} />;
          })}
        </g>
      ))}
    </svg>
  );
};

export const Cover3: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const tall = h > w;
  const wide = w / h > 1.5;
  const titleSize = tall ? 128 : wide ? 124 : 104;
  // people layout
  // one "group photo" row: alternate front/back for depth
  const H = tall ? 720 : wide ? 580 : 560;
  const sp = tall ? 128 : wide ? 226 : 172;
  const people = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const back = i % 2 === 1;
    return { i, back, x: w / 2 + (i - 3.5) * sp, y: h + 30 - (back ? H * 0.07 : 0), h: back ? H * 0.9 : H, dim: back ? 0.78 : 1 };
  });
  const order = [...people.filter((p) => p.back), ...people.filter((p) => !p.back)];
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, fontVariantNumeric: 'lining-nums' }}>
      <Background />
      <CanvasLayer t={0} w={w} h={h} draw={(ctx) => {
        for (let i = 0; i < 420; i++) glowDot(ctx, rnd(`sx${i}`) * w, rnd(`sy${i}`) * h * 0.55, 0.6 + Math.pow(rnd(`sr${i}`), 3) * 1.8, 0.2 + rnd(`sa${i}`) * 0.45, '235,228,210', 3);
      }} />
      <Skyline w={w} base={h} top={tall ? h * 0.5 : h * 0.5} seed={`k${w}`} />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(15,16,22,0.0) 40%, rgba(15,16,22,0.55) 100%)' }} />
      <Glow x={w / 2} y={tall ? 330 : h * 0.26} r={tall ? 560 : 700} color="rgba(201,164,92,0.6)" opacity={0.16} />
      {order.map((p) => {
        const c = TA[p.i];
        return (
          <div key={p.i} style={{ filter: `${p.i === 0 ? 'grayscale(1) sepia(0.3) ' : ''}brightness(${p.dim})` }}>
            <PeepFig kind="stand" body={c[0]} face={c[1]} hair={c[2]} acc={c[3]} flip={p.i >= 4} glow={false} x={p.x} y={p.y} h={p.h} />
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: tall ? 120 : wide ? 80 : 90, textAlign: 'center' }}>
        <div style={{ fontFamily: ZH, fontSize: tall ? 34 : 30, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏 · 缘分方程</div>
        <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: titleSize, color: C.paper, letterSpacing: '0.06em', lineHeight: 1.22, marginTop: tall ? 34 : 24, textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}>
          {tall ? (<>遇见<span style={{ color: C.gold }}>Ta</span>的概率<br />能算吗？</>) : (<>遇见<span style={{ color: C.gold }}>Ta</span>的概率，能算吗？</>)}
        </div>
        <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: tall ? 40 : 36, color: C.dim, marginTop: 16 }}>The Odds of Meeting the One</div>
      </div>
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

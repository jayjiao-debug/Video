import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN } from '../lib';
import { Background, Vignette, Grain, Glow } from '../ui';
import { CanvasLayer, glowDot, rnd } from './common';

export const Cover2: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const tall = h > w;
  const cx = w / 2;
  const py = tall ? 470 : h * 0.34;
  const gap = tall ? 190 : 230;
  const a = { x: cx - gap, y: py + 40 }, b = { x: cx + gap, y: py - 40 };
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, fontVariantNumeric: 'lining-nums' }}>
      <Background />
      <CanvasLayer t={0} w={w} h={h} draw={(ctx) => {
        for (let i = 0; i < 700; i++) {
          const x = rnd(`cx${i}`) * w, y = rnd(`cy${i}`) * h * (tall ? 0.62 : 0.7);
          glowDot(ctx, x, y, 0.6 + Math.pow(rnd(`cr${i}`), 3) * 2, 0.25 + rnd(`ca${i}`) * 0.5, '235,228,210', 3);
        }
        ctx.strokeStyle = 'rgba(184,72,59,0.9)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(184,72,59,0.7)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.bezierCurveTo(a.x + gap * 0.7, a.y + 120, b.x - gap * 0.7, b.y - 120, b.x, b.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        glowDot(ctx, a.x, a.y, 9, 1, '240,213,154', 7);
        glowDot(ctx, b.x, b.y, 9, 1, '240,213,154', 7);
      }} />
      <Glow x={cx} y={tall ? 980 : h * 0.72} r={tall ? 620 : 760} color="rgba(201,164,92,0.5)" opacity={0.22} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: tall ? 700 : h * 0.53, textAlign: 'center' }}>
        <div style={{ fontFamily: ZH, fontSize: 28, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏</div>
        <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: tall ? 116 : w < 1600 ? 100 : 118, color: C.paper, letterSpacing: '0.08em', lineHeight: 1.25, marginTop: 20 }}>
          {tall ? (<>遇见<span style={{ color: C.gold }}>Ta</span>的概率<br />能算吗？</>) : (<>遇见<span style={{ color: C.gold }}>Ta</span>的概率，能算吗？</>)}
        </div>
        <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 40, color: C.dim, marginTop: 22 }}>《缘分方程》 The Odds of Meeting the One</div>
      </div>
      <Vignette strength={0.5} />
      <Grain />
    </AbsoluteFill>
  );
};

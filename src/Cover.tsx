import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN } from './lib';
import { Background, Vignette, Grain, RedString, Card, Glow } from './ui';

export const Cover: React.FC<{ tall?: boolean; mid?: boolean }> = ({ tall = false, mid = false }) => {
  const Wd = tall ? 1080 : mid ? 1440 : 1920;
  const n = tall ? 6 : mid ? 8 : 10;
  const gap = tall ? 150 : 140;
  const x0 = (Wd - gap * (n - 1)) / 2;
  const y0 = tall ? 360 : 300;
  const lit = tall ? 3 : mid ? 5 : 6;
  const sy = (x: number) => y0 + 46 * 4 * (x / Wd) * (1 - x / Wd);
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, fontVariantNumeric: 'lining-nums' }}>
      <Background />
      <svg width={Wd} height={tall ? 1440 : 1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={`M -40 ${y0} Q ${Wd / 2} ${y0 + 92} ${Wd + 40} ${y0}`} stroke={C.rouge} strokeWidth={3} fill="none"
          style={{ filter: 'drop-shadow(0 0 6px rgba(184,72,59,0.6))' }} />
      </svg>
      {new Array(n).fill(0).map((_, i) => {
        const x = x0 + i * gap;
        return <Card key={i} x={x} y={sy(x)} n={i + 1} score="?" flip={i === lit ? 1 : 0} gold={i === lit ? 1 : 0} glow={i === lit ? 1 : 0}
          dim={i === lit ? 0 : 0.45} rot={(i - lit) * 0.6} w={tall ? 132 : 128} />;
      })}
      <Glow x={Wd / 2} y={tall ? 980 : 760} r={tall ? 620 : 760} color="rgba(201,164,92,0.5)" opacity={0.25} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: tall ? 700 : 600, textAlign: 'center' }}>
        <div style={{ fontFamily: ZH, fontSize: tall ? 30 : 28, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏</div>
        <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: tall ? 120 : mid ? 100 : 118, color: C.paper, letterSpacing: '0.08em', lineHeight: 1.25, marginTop: 20 }}>
          {tall ? (<>第几个人<br />才是<span style={{ color: C.gold }}>对的人</span>？</>) : (<>第几个人，才是<span style={{ color: C.gold }}>对的人</span>？</>)}
        </div>
        <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: tall ? 40 : 40, color: C.dim, marginTop: 22 }}>The 37% Rule · When to Stop Looking</div>
      </div>
      <Vignette strength={0.5} />
      <Grain />
    </AbsoluteFill>
  );
};

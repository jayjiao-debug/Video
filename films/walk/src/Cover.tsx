import React from 'react';
import {AbsoluteFill} from 'remotion';
import {mulberry} from './lib';
import {bird, C, glow, Light, SANS, SERIF, textPoints} from './look';

/* Covers, drawn natively at size: 4:3 (1440×1080) and 3:4 (1080×1440). The hero image is the drop:
   "34%" made of birds, with the hook in huge type (second line gold), the gold title and the corner mark. */
const Cover: React.FC<{w: number; h: number}> = ({w, h}) => {
  const portrait = h > w;
  const numY = portrait ? 480 : 330;
  const pts = textPoints('34%', `900 ${portrait ? 360 : 380}px ${SERIF}`, w / 2, numY, 5200, 3);
  const draw = (ctx: CanvasRenderingContext2D) => {
    const r = mulberry(9);
    glow(ctx, w / 2, numY, 160, 0.12);
    for (const [x, y] of pts) {
      const ph = r() * 6.28;
      bird(ctx, x + (r() - 0.5) * 3, y + (r() - 0.5) * 3, 1.1 + r() * 0.9, ph, 0.5 + 0.45 * r(), ph * 3);
    }
    for (let i = 0; i < 320; i++) {
      const a = r() * 6.28;
      const d = (portrait ? 420 : 470) + r() * 600;
      bird(ctx, w / 2 + Math.cos(a) * d, numY + Math.sin(a) * d * 0.6, 1 + r(), a, 0.25 * r(), i);
    }
  };
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 35%, ${C.bg0} 0%, #0b1120 55%, ${C.bg1} 100%)`}}>
      <Light draw={draw} deps={[w, h]} bloom={1} w={w} h={h} />
      <div style={{position: 'absolute', left: 0, right: 0, top: portrait ? 830 : 590, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: portrait ? 96 : 92, lineHeight: 1.22, color: '#f6f1e6', textShadow: '0 4px 24px rgba(0,0,0,0.9)'}}>
        <div>醉汉一定能回家</div>
        <div style={{color: '#f6cf78', textShadow: '0 0 28px rgba(241,197,109,0.5), 0 4px 24px rgba(0,0,0,0.9)'}}>小鸟只有 34%</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: portrait ? 1140 : 840, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: portrait ? 64 : 56, letterSpacing: '0.12em', color: '#f6cf78', textShadow: '0 0 20px rgba(241,197,109,0.4)'}}>《醉汉与小鸟》</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: portrait ? 1236 : 922, textAlign: 'center', fontFamily: SANS, fontSize: portrait ? 34 : 30, color: 'rgba(243,239,230,0.7)', letterSpacing: '0.04em'}}>为什么在空间里乱飞，就回不了家？</div>
      <div style={{position: 'absolute', top: 36, right: 44, fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(241,197,109,0.85)'}}>
        ◆ Juno <span style={{color: 'rgba(243,239,230,0.6)', fontWeight: 400}}>· VIBE知识大赏</span>
      </div>
    </AbsoluteFill>
  );
};
export const Cover43: React.FC = () => <Cover w={1440} h={1080} />;
export const Cover34: React.FC = () => <Cover w={1080} h={1440} />;

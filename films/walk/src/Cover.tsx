import React from 'react';
import {AbsoluteFill} from 'remotion';
import {mulberry} from './lib';
import {bird, C, glow, Light, SANS, SERIF, textPoints} from './look';

/* Douyin covers, drawn natively at size: 横版 4:3 (1440×1080) and 竖版 3:4 (1080×1440). The hero image
   is the film's own drop: "34%" made of birds. Under it a 2-line hook in gold serif (≥ 100 px), then
   《片名》 and the series line. Nothing key within 6% of the edges; on the tall cover the lower 18%
   (Douyin's UI) holds only the night and a few birds. */
const GOLD: React.CSSProperties = {color: '#f6cf78', textShadow: '0 0 30px rgba(241,197,109,0.45), 0 4px 24px rgba(0,0,0,0.9)'};

const Cover: React.FC<{w: number; h: number}> = ({w, h}) => {
  const tall = h > w;
  const numY = tall ? 330 : 270;
  const pts = textPoints('34%', `900 ${tall ? 330 : 340}px ${SERIF}`, w / 2, numY, 5200, 3);
  const draw = (ctx: CanvasRenderingContext2D) => {
    const r = mulberry(9);
    glow(ctx, w / 2, numY, 160, 0.12);
    for (const [x, y] of pts) {
      const ph = r() * 6.28;
      bird(ctx, x + (r() - 0.5) * 3, y + (r() - 0.5) * 3, 1.2 + r() * 0.9, ph, 0.5 + 0.45 * r(), ph * 3);
    }
    // the ones that never come back, drifting off
    for (let i = 0; i < 260; i++) {
      const a = r() * 6.28;
      const d = (tall ? 380 : 430) + r() * 700;
      bird(ctx, w / 2 + Math.cos(a) * d, numY + Math.sin(a) * d * 0.75, 1.4 + r() * 2.2, a, 0.3 * r(), i);
    }
  };
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 32%, ${C.bg0} 0%, #0b1120 55%, ${C.bg1} 100%)`}}>
      <Light draw={draw} deps={[w, h]} bloom={1} w={w} h={h} />
      {/* vignette */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: tall ? 560 : 500, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: tall ? 112 : 108, lineHeight: 1.18, letterSpacing: '0.04em', fontVariantNumeric: 'lining-nums', ...GOLD}}>
        <div>醉汉一定能回家</div>
        <div>小鸟只有34%</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: tall ? 860 : 790, textAlign: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: tall ? 52 : 46, letterSpacing: '0.14em', color: C.ink}}>《醉汉与小鸟》</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: tall ? 940 : 862, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: tall ? 28 : 26, letterSpacing: '0.3em', color: 'rgba(241,197,109,0.8)'}}>◆ VIBE知识大赏</div>
    </AbsoluteFill>
  );
};
export const Cover43: React.FC = () => <Cover w={1440} h={1080} />;
export const Cover34: React.FC = () => <Cover w={1080} h={1440} />;

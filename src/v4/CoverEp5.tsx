import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { GoldTitle } from '../brand/Brand';
import { CoverBoat3D, COVER_B1 as B } from './Titanic2';

/* Covers for 《应该没事吧》, drawn natively at their own size: boat No. 1 from above (12 gold seats, 28 empty) + the hook. */
const SERIF = '"Noto Serif CJK SC", "Noto Serif SC", serif';
const LATIN = '"Cormorant Garamond", Georgia, serif';
export const CoverEp5: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const [handle] = useState(() => delayRender('cover fonts'));
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '600 40px "Cormorant Garamond"']
      .map((f) => document.fonts.load(f, '应该没事吧座位只坐了人0123456789')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
  const tall = h > w;
  const cam = tall
    ? { pos: [B.x + 0.19, B.y + 3.6, B.z + 0.02], look: [B.x + 0.19, B.y, B.z], up: [1, 0, 0] }
    : { pos: [B.x - 0.36, B.y + 1.75, B.z + 0.45], look: [B.x - 0.36, B.y + 0.05, B.z], up: [0, 1, 0] };
  const big = tall ? 132 : 118;
  return (
    <AbsoluteFill style={{ background: '#05070d' }}>
      <CoverBoat3D w={w} h={h} {...cam} />
      <AbsoluteFill style={{ background: tall
        ? 'linear-gradient(180deg, rgba(5,7,13,0.94) 0%, rgba(5,7,13,0.8) 34%, rgba(5,7,13,0.15) 58%, rgba(5,7,13,0.55) 100%)'
        : 'linear-gradient(90deg, rgba(5,7,13,0.95) 0%, rgba(5,7,13,0.82) 36%, rgba(5,7,13,0.1) 62%, rgba(5,7,13,0.35) 100%)' }} />
      {!tall && <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,7,13,0) 55%, rgba(5,7,13,0.85) 78%, rgba(5,7,13,0.95) 100%)' }} />}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        {(() => {
          const x = tall ? w / 2 : 90, anchor = tall ? 'middle' : 'start';
          const y0 = tall ? 150 : 210;
          return (
            <g>
              <text x={x} y={y0} textAnchor={anchor} style={{ fontFamily: LATIN, fontWeight: 600, fontSize: 30, letterSpacing: '0.32em', fill: '#f1c56d' }}>TITANIC · 1912</text>
              <text x={x} y={y0 + 56} textAnchor={anchor} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, letterSpacing: '0.12em', fill: 'rgba(243,237,226,0.85)' }}>1号救生艇</text>
              <text x={x} y={y0 + 56 + big * 1.15} textAnchor={anchor} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: big, fill: '#f3ede2' }}>40个座位</text>
              <text x={x} y={y0 + 56 + big * 2.3} textAnchor={anchor} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: big, fill: '#f6cf78', filter: 'drop-shadow(0 0 18px rgba(241,197,109,0.5))' }}>只坐了12人</text>
            </g>
          );
        })()}
        {tall ? (
          <g>
            <g transform={`translate(${w / 2 - 960}, 0)`}><GoldTitle text="应该没事吧" f={200} at={0} size={92} y={h - 150} /></g>
            <text x={w / 2} y={h - 78} textAnchor="middle" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 34, fill: '#f3ede2', letterSpacing: '0.1em' }}>危险来的时候，你会先跑吗？</text>
          </g>
        ) : (
          <g>
            <g transform={`translate(${90 + (7 * 70 * 0.98) / 2 - 960}, 0)`}><GoldTitle text="应该没事吧" f={200} at={0} size={70} y={h - 190} /></g>
            <text x={96} y={h - 118} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 32, fill: '#f3ede2', letterSpacing: '0.1em' }}>危险来的时候，你会先跑吗？</text>
          </g>
        )}
        <text x={w - 40} y={52} textAnchor="end" style={{ fontFamily: SERIF, fontSize: 22, letterSpacing: '0.18em', fill: 'rgba(241,197,109,0.75)' }}>◆ Juno · VIBE知识大赏</text>
      </svg>
    </AbsoluteFill>
  );
};

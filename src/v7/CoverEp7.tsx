import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { GoldTitle } from '../brand/Brand';
import { Globe } from './Globe';
import { b } from '../v6/ui6';

/* Covers for 《隔着几个人》, drawn natively at their own size: the dotted globe with the Beijing–London friend chain + the hook. */
const SERIF = '"Noto Serif CJK SC", "Noto Serif SC", serif';
const LATIN = '"Cormorant Garamond", Georgia, serif';
export const CoverEp7: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const [handle] = useState(() => delayRender('cover fonts'));
  useEffect(() => {
    Promise.all(['900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '600 40px "Cormorant Garamond"']
      .map((f) => document.fonts.load(f, '隔着几个人地球上任意两只3.57')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
  const tall = h > w;
  const big = tall ? 128 : 112;
  return (
    <AbsoluteFill style={{ background: '#05070d' }}>
      <div style={{ position: 'absolute', inset: 0, transform: tall ? 'translate(0px, -230px)' : 'translate(250px, -40px)' }}>
        <ThreeCanvas width={w} height={h} gl={{ antialias: true }} camera={{ fov: 36, near: 0.1, far: 1000, position: [0, 0, 40] }}>
          <Globe T={b(46)} distOverride={tall ? 44 : 38} />
        </ThreeCanvas>
      </div>
      <AbsoluteFill style={{ background: tall
        ? 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0) 42%, rgba(5,7,13,0.75) 58%, rgba(5,7,13,0.95) 100%)'
        : 'linear-gradient(90deg, rgba(5,7,13,0.95) 0%, rgba(5,7,13,0.8) 34%, rgba(5,7,13,0) 60%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        {(() => {
          const x = tall ? w / 2 : 90, anchor = tall ? 'middle' : 'start';
          const y0 = tall ? 640 : 250;
          return (
            <g>
              <text x={x} y={y0} textAnchor={anchor} style={{ fontFamily: LATIN, fontWeight: 600, fontSize: 30, letterSpacing: '0.32em', fill: '#f1c56d' }}>SMALL WORLD</text>
              <text x={x} y={y0 + big * 1.2} textAnchor={anchor} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: big * 0.82, fill: '#f3ede2' }}>地球上任意两人</text>
              <text x={x} y={y0 + big * 2.4} textAnchor={anchor} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: big, fill: '#f6cf78', filter: 'drop-shadow(0 0 18px rgba(241,197,109,0.5))' }}>只隔3.57人</text>
            </g>
          );
        })()}
        {tall ? (
          <g transform={`translate(${w / 2 - 960}, 0)`}><GoldTitle text="隔着几个人" f={200} at={0} size={84} y={1150} /></g>
        ) : (
          <g transform={`translate(${90 + (7 * 66 * 0.98) / 2 - 960}, 0)`}><GoldTitle text="隔着几个人" f={200} at={0} size={66} y={h - 150} /></g>
        )}
        <text x={w - 40} y={52} textAnchor="end" style={{ fontFamily: SERIF, fontSize: 22, letterSpacing: '0.18em', fill: 'rgba(241,197,109,0.75)' }}>◆ Juno · VIBE知识大赏</text>
      </svg>
    </AbsoluteFill>
  );
};

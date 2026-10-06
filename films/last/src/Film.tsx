import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CUT, FPS, SANS, prog, easeOut } from './lib';
import { World, transAt } from './camera';
import { Hook, Intro, Model } from './scenes1';
import { Net, Atus, Dunbar } from './scenes2';
import { Drop, Pay, End } from './scenes3';
import { JUNO } from './brand/identity';

/* 《最后一面》. During a camera transition the whole stage is rendered SAMPLES times across one frame's time and
   averaged (layer k gets opacity 1/(k+1), so every sample weighs the same): real motion blur on the whips and pushes. */
const SAMPLES = 8;

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['700 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"', '400 40px "Noto Sans CJK SC"', '900 40px "Noto Sans CJK SC"', '400 40px "JunoMono"', '700 40px "JunoMono"']
      .map((f) => document.fonts.load(f, '测试0123P%')).map((p) => p.catch(() => null))).then(() => continueRender(handle));
  }, [handle]);
};

const StageAt: React.FC<{ T: number }> = ({ T }) => (
  <AbsoluteFill>
    <World T={T} />
    <Hook T={T} />
    <Intro T={T} />
    <Model T={T} />
    <Net T={T} />
    <Atus T={T} />
    <Dunbar T={T} />
    <Drop T={T} />
    <Pay T={T} />
    <End T={T} />
  </AbsoluteFill>
);

export const Film: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const blur = transAt(T);
  const n = blur ? SAMPLES : 1;
  const mark = easeOut(prog(T, CUT.intro, CUT.intro + 0.8)) * (1 - prog(T, CUT.end - 0.3, CUT.end));
  return (
    <AbsoluteFill style={{ backgroundColor: '#060608' }}>
      <style>{`
        @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono.ttf')}) format("truetype"); font-weight: 400; }
        @font-face { font-family: "JunoMono"; src: url(${staticFile('fonts/DejaVuSansMono-Bold.ttf')}) format("truetype"); font-weight: 700; }
      `}</style>
      {Array.from({ length: n }, (_, k) => (
        <AbsoluteFill key={k} style={{ opacity: 1 / (k + 1) }}>
          <StageAt T={T - ((n - 1 - k) / n) * (1 / FPS)} />
        </AbsoluteFill>
      ))}
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)' }} />
      <AbsoluteFill style={{ opacity: 0.05, pointerEvents: 'none' }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
      {mark > 0.001 && (
        <div style={{ position: 'absolute', top: 44, right: 56, opacity: 0.55 * mark, fontFamily: SANS, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.58)' }}>
          <span style={{ color: '#ff3d2e' }}>◆ </span>{JUNO.mark}
        </div>
      )}
    </AbsoluteFill>
  );
};

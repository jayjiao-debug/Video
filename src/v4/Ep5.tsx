import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { TitanicOpen2, OPEN_FRAMES2 } from './Titanic2';
import { WhyScene } from './Why';
import { SmokeScene, SMOKE_OUT } from './Smoke';

/* 《应该没事吧》 assembled so far: opening (b0-b56) + why nobody got in (b56-b80) */
export const EP5_FRAMES = Math.round(SMOKE_OUT * 30);
export const Ep5Draft: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      <Sequence durationInFrames={OPEN_FRAMES2}><TitanicOpen2 /></Sequence>
      {frame >= OPEN_FRAMES2 - 2 && <WhyScene T={T} />}
      <SmokeScene T={T} />
    </AbsoluteFill>
  );
};

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { b } from './lib';
import { Scene3D, S_IN as S4_IN, S_OUT as S4_OUT } from './Scene3D';

/* The whole film as one composition. Each scene lives in its own file, takes the global T, returns null outside its
   window, and owns its fade in/out. The scene table below is what per-scene renders, clips and fixes are cut by.
   Register in Root.tsx:  <Composition id="Ep" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
   Composition ids: only a-z, A-Z, 0-9 and "-" (no underscores). */
export const FILM_END = 130.5;
export const FILM_FRAMES = Math.round(FILM_END * 30);
export const SCENES: [string, number, number][] = [
  // [clip name, start s, end s] — also written to scenes.json for scripts/finish.py
  ['S1_开头', 0, b(56)],
  ['S4_海啸', S4_IN, S4_OUT],
];
export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      {/* mount heavy 3D scenes only inside their window (plus a little), so other frames stay fast */}
      {T >= S4_IN - 0.1 && T <= S4_OUT + 0.1 && <Scene3D T={T} />}
    </AbsoluteFill>
  );
};

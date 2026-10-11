import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { FPS, prog } from '../lib';
import { Background, Grain, Vignette } from '../ui';
import { Intro3, Title3, Tim3, Childhood3, Train3 } from './scenesA';
import { Call3, Equation3, Dinner3, Final3 } from './scenesB';

/* music plays continuously from bar 3 of the original BGM; scenes run on the music clock */
const M0 = 6.525, M1 = 130.5;
export const DURATION3 = Math.round((M1 - M0) * FPS);

const SCENES: [React.FC<{ t: number }>, boolean, number, number][] = [
  [Intro3, true, 0, 10.2], [Title3, false, 16.5, 20.85], [Tim3, false, 20.6, 26.95], [Childhood3, false, 26.7, 41.1], [Train3, false, 40.85, 49.2],
  [Call3, false, 48.75, 63.35], [Equation3, false, 63.05, 116.0], [Dinner3, false, 115.6, 122.1], [Final3, false, 121.7, 130.6],
];

export const Main3: React.FC<{ music?: boolean }> = ({ music = true }) => {
  const f = useCurrentFrame();
  const n = f / FPS;
  const tm = n + M0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f1016', overflow: 'hidden', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
      <Background warm={0.6 * prog(tm, 115.6, 116.4) * (1 - prog(tm, 121.9, 122.6))} />
      {SCENES.map(([S, own, a, b], i) => {
        const t = own ? n : tm;
        return t >= a && t <= b ? <S key={i} t={t} /> : null;
      })}
      <Vignette />
      <Grain />
      {music && (
        <Sequence from={0} durationInFrames={DURATION3} layout="none">
          <Audio src={staticFile('bgm.mp3')} trimBefore={Math.round(M0 * FPS)}
            volume={(fr) => interpolate(fr, [0, 6], [0, 1], { extrapolateRight: 'clamp' }) * interpolate(M0 + fr / FPS, [124, 130.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

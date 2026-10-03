import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { FPS, prog } from './lib';
import { Background, Grain, Vignette } from './ui';
import { Intro, Title, Rules, TooEarlyLate } from './scenesA';
import { History, Kepler } from './scenesB';
import { Simulation, Reveal } from './scenesC';
import { Rule, Scale, Ruler, Uses, Variants, Twist, Ending } from './scenesD';

const SCENES: [React.FC<{ t: number }>, number, number][] = [
  [Intro, 0, 16.75], [Title, 16.5, 20.85], [Rules, 20.6, 28.95], [TooEarlyLate, 28.7, 37.05],
  [History, 36.8, 49.35], [Kepler, 48.75, 63.35], [Simulation, 63.0, 82.0], [Reveal, 81.4, 85.65],
  [Rule, 85.4, 93.75], [Scale, 93.5, 97.8], [Ruler, 97.5, 105.9], [Uses, 105.6, 109.95],
  [Variants, 109.7, 116.0], [Twist, 115.8, 122.1], [Ending, 121.9, 130.6],
];

export const Main: React.FC<{ music?: boolean }> = ({ music = true }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f1016', overflow: 'hidden', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
      <Background warm={0.7 * prog(t, 115.87, 118.5)} />
      {SCENES.map(([S, a, b], i) => (t >= a && t <= b ? <S key={i} t={t} /> : null))}
      <Vignette />
      <Grain />
      {music && (
        <Audio src={staticFile('bgm.mp3')}
          volume={(fr) => interpolate(fr, [124 * FPS, 130.5 * FPS], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
      )}
    </AbsoluteFill>
  );
};

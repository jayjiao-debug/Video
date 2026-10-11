import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { FPS, prog } from '../lib';
import { Background, Grain, Vignette } from '../ui';
import { Intro4, Title4, Game4, Tourney4 } from './scenes4a';
import { Rule4, Board4, Four4, Outro4, Final4 } from './scenes4b';

/* music plays continuously from bar 3 of the original BGM; scenes run on the music clock */
const M0 = 8.545, M1 = 130.5; // enter on bar 4 (start of the 2nd intro phrase)
export const DURATION4 = Math.round((M1 - M0) * FPS);

const SCENES: [React.FC<{ t: number }>, boolean, number, number][] = [
  [Intro4, true, 0, 8.2], [Title4, false, 16.5, 20.85], [Game4, false, 20.6, 41.1], [Tourney4, false, 40.85, 63.35],
  [Rule4, false, 63.05, 81.5], [Board4, false, 81.4, 101.75], [Four4, false, 101.5, 116.0], [Outro4, false, 115.6, 122.1], [Final4, false, 121.7, 130.6],
];

export const Main4: React.FC<{ music?: boolean }> = ({ music = true }) => {
  const f = useCurrentFrame();
  const n = f / FPS;
  const tm = n + M0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f1016', overflow: 'hidden', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }}>
      <Background warm={0.5 * prog(tm, 115.6, 116.4) * (1 - prog(tm, 121.9, 122.6))} />
      {SCENES.map(([S, own, a, b], i) => {
        const t = own ? n : tm;
        return t >= a && t <= b ? <S key={i} t={t} /> : null;
      })}
      <Vignette />
      <Grain />
      {music && (
        <Sequence from={0} durationInFrames={DURATION4} layout="none">
          <Audio src={staticFile('bgm.mp3')} trimBefore={Math.round(M0 * FPS)}
            volume={(fr) => interpolate(fr, [0, 1], [0, 1], { extrapolateRight: 'clamp' }) * interpolate(M0 + fr / FPS, [124, 130.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

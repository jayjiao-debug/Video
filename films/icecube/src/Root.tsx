import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film';
import { FPS, W, H, FILM_FRAMES } from './lib';

export const Root: React.FC = () => (
  <>
    <Composition id="IceCube" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ look: 'night' as const }} />
  </>
);

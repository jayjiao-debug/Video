import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film';
import { Cover } from './Cover';
import { FPS, W, H, FILM_FRAMES } from './lib';

export const Root: React.FC = () => (
  <>
    <Composition id="Last" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="CoverWide" component={Cover} durationInFrames={1} fps={FPS} width={1440} height={1080} defaultProps={{ layout: 'wide' as const }} />
    <Composition id="CoverTall" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1440} defaultProps={{ layout: 'tall' as const }} />
  </>
);

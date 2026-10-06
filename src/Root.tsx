import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film';
import { Final } from './Final';
import { FPS, W, H, FILM_FRAMES } from './lib';

export const Root: React.FC = () => (
  <>
    <Composition id="GamblerFinal" component={Final} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Gambler" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} />
  </>
);

import React from 'react';
import { Composition } from 'remotion';
import { Storyboard, N_SCENES } from './Storyboard';
import { Film } from './Film';
import { FPS, W, H, FILM_FRAMES } from './lib';

export const Root: React.FC = () => (
  <>
    <Composition id="Lazy" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Storyboard" component={Storyboard} durationInFrames={N_SCENES} fps={30} width={1920} height={1080} />
  </>
);

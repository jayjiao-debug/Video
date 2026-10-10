import React from 'react';
import { Composition } from 'remotion';
import { Opening, OPEN_FRAMES } from './Opening';
import { Film, FILM_FRAMES } from './Film';

export const Root: React.FC = () => (
  <>
    <Composition id="Flow" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Opening" component={Opening} durationInFrames={OPEN_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

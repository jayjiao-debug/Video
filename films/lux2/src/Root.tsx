import React from 'react';
import { Composition } from 'remotion';
import { LookDev } from './LookDev';
import { Film, FILM_FRAMES } from './Film';

export const Root: React.FC = () => (
  <>
    <Composition id="Lux2" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="LookDev" component={LookDev} durationInFrames={3} fps={30} width={1920} height={1080} />
  </>
);

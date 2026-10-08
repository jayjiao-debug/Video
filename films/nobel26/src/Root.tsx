import React from 'react';
import { Composition } from 'remotion';
import { Frames } from './Frames';
import { Story, KEYS } from './Story';
import { Film, FILM_FRAMES } from './Film';

export const Root: React.FC = () => (
  <>
    <Composition id="Nobel" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Frames" component={Frames} durationInFrames={3} fps={1} width={1920} height={1080} />
    <Composition id="Story" component={Story} durationInFrames={KEYS.length} fps={1} width={1920} height={1080} />
  </>
);

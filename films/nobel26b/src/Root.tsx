import React from 'react';
import { Composition } from 'remotion';
import { Keys, KEY_COUNT } from './Keys';
import { FlashKeys, ShockTest } from './Flash';
import { Film, FILM_FRAMES } from './Film';

export const Root: React.FC = () => (
  <>
    <Composition id="Hall26" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Keys" component={Keys} durationInFrames={KEY_COUNT} fps={1} width={1920} height={1080} />
    <Composition id="FlashKeys" component={FlashKeys} durationInFrames={4} fps={1} width={1920} height={1080} />
    <Composition id="ShockTest" component={ShockTest} durationInFrames={240} fps={30} width={1920} height={1080} />
  </>
);

import React from 'react';
import { Composition } from 'remotion';
import { GKeys, GKEY_COUNT } from './GKeys';
import { HKeys, HKEY_COUNT } from './HKeys';
import { Film, FILM_FRAMES } from './Film';
import { Tests, TESTS_FRAMES } from './Tests';

export const Root: React.FC = () => (
  <>
    <Composition id="GKeys" component={GKeys} durationInFrames={GKEY_COUNT} fps={1} width={1920} height={1080} />
    <Composition id="HKeys" component={HKeys} durationInFrames={HKEY_COUNT} fps={1} width={1920} height={1080} />
    <Composition id="Games26" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Tests" component={Tests} durationInFrames={TESTS_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

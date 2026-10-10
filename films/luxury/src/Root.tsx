import React from 'react';
import { Composition } from 'remotion';
import { Keys, KEYS } from './Keys';
import { Flat, FLAT_FRAMES } from './Flat';
import { Deco, DECO_FRAMES } from './Deco';
import { Film, FILM_FRAMES } from './Film';

export const Root: React.FC = () => (
  <>
    <Composition id="Lux" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Deco" component={Deco} durationInFrames={DECO_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Flat" component={Flat} durationInFrames={FLAT_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Keys" component={Keys} durationInFrames={KEYS.length} fps={30} width={1920} height={1080} />
  </>
);

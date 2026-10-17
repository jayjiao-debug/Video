import React from 'react';
import { Composition } from 'remotion';
import { Keys, KEYS } from './Keys';
import { Film, FILM_FRAMES } from './Film';
export const Root: React.FC = () => (<>
  <Composition id="Keys" component={Keys} durationInFrames={KEYS.length} fps={30} width={1920} height={1080} />
  <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
</>);

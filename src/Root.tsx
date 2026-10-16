import React from 'react';
import { Composition } from 'remotion';
import { Looks } from './Looks';
import { Cardboard } from './Cardboard';
import { Asset, Bg } from './Asset';
import { Film, FILM_FRAMES } from './Film';
import { Chalk, CHALK_FRAMES } from './Chalk';

export const Root: React.FC = () => (
  <>
    <Composition id="Looks" component={Looks} durationInFrames={6} fps={30} width={1920} height={1080} />
    <Composition id="Cardboard" component={Cardboard} durationInFrames={3} fps={30} width={1920} height={1080} />
    <Composition id="Asset" component={Asset as any} durationInFrames={1} fps={30} width={2000} height={1400} defaultProps={{ id: 'cat' }} />
    <Composition id="Bg" component={Bg as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ id: 'night' }} />
    <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Chalk" component={Chalk} durationInFrames={CHALK_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

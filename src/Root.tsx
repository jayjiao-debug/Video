import React from 'react';
import { Composition } from 'remotion';
import { Looks } from './Looks';
import { Cardboard } from './Cardboard';
import { Asset, Bg } from './Asset';
import { Film, FILM_FRAMES } from './Film';
import { Chalk, CHALK_FRAMES, ChalkSheet } from './Chalk';
import { Puppet, PUPPET_FRAMES } from './Puppet';

export const Root: React.FC = () => (
  <>
    <Composition id="Looks" component={Looks} durationInFrames={6} fps={30} width={1920} height={1080} />
    <Composition id="Cardboard" component={Cardboard} durationInFrames={3} fps={30} width={1920} height={1080} />
    <Composition id="Asset" component={Asset as any} durationInFrames={1} fps={30} width={2000} height={1400} defaultProps={{ id: 'cat' }} />
    <Composition id="Asset2" component={Asset as any} durationInFrames={1} fps={30} width={4000} height={2800} defaultProps={{ id: 'cat', k: 2 }} />
    <Composition id="Bg" component={Bg as any} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ id: 'night' }} />
    <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Chalk" component={Chalk} durationInFrames={CHALK_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ChalkLines" component={Chalk} durationInFrames={CHALK_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ look: 'lines' as const }} />
    <Composition id="Puppet" component={Puppet} durationInFrames={PUPPET_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="ChalkSheet" component={ChalkSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="ChalkLinesSheet" component={ChalkSheet} durationInFrames={1} fps={30} width={1920} height={1080} defaultProps={{ look: 'lines' as const }} />
  </>
);

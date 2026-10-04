import React from 'react';
import {Composition} from 'remotion';
import {FontGate} from './fonts';
import {Look, LOOK_FRAMES} from './StyleFrames';

const Gated = (C: React.FC): React.FC => () => (
  <FontGate>
    <C />
  </FontGate>
);

export const Root: React.FC = () => (
  <>
    <Composition id="Look" component={Gated(Look)} durationInFrames={LOOK_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

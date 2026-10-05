import React from 'react';
import {Composition} from 'remotion';
import {FontGate} from './fonts';
import {Look, LOOK_FRAMES} from './StyleFrames';
import {Alt, ALT_FRAMES} from './Alt';

const Gated = (C: React.FC): React.FC => () => (
  <FontGate>
    <C />
  </FontGate>
);

export const Root: React.FC = () => (
  <>
    <Composition id="Alt" component={Gated(Alt)} durationInFrames={ALT_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Look" component={Gated(Look)} durationInFrames={LOOK_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

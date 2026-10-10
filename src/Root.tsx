import React from 'react';
import { Composition } from 'remotion';
import { Look, LOOKS } from './Look';
import { ColdOpen, OPEN_END } from './ColdOpen';

export const Root: React.FC = () => (
  <>
    <Composition id="Look" component={Look} durationInFrames={LOOKS.length} fps={30} width={1920} height={1080} />
    <Composition id="ColdOpen" component={ColdOpen} durationInFrames={Math.round(OPEN_END * 30)} fps={30} width={1920} height={1080} />
  </>
);

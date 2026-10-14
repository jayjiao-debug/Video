import React from 'react';
import { Composition } from 'remotion';
import { Ring, OPEN_FRAMES } from './Ring';

export const Root: React.FC = () => (
  <>
    <Composition id="RingOpen" component={Ring} durationInFrames={OPEN_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

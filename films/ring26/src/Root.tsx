import React from 'react';
import { Composition } from 'remotion';
import { Ring, OPEN_FRAMES } from './Ring';
import { Ring2, OPEN2_FRAMES } from './Ring2';

export const Root: React.FC = () => (
  <>
    <Composition id="RingOpen" component={Ring} durationInFrames={OPEN_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="RingOpen2" component={Ring2} durationInFrames={OPEN2_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

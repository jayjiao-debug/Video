import React from 'react';
import { Composition } from 'remotion';
import { Ring, OPEN_FRAMES } from './Ring';
import { Ring2, OPEN2_FRAMES } from './Ring2';
import { Gallery } from './Gallery';
import { MotionTest, MT_FRAMES } from './MotionTest';

export const Root: React.FC = () => (
  <>
    <Composition id="RingOpen" component={Ring} durationInFrames={OPEN_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="RingOpen2" component={Ring2} durationInFrames={OPEN2_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Gallery" component={Gallery} durationInFrames={3} fps={30} width={1920} height={1080} />
    <Composition id="MotionTest" component={MotionTest} durationInFrames={MT_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

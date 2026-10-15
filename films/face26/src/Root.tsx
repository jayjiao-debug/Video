import React from 'react';
import { Composition } from 'remotion';
import { Gallery } from './Gallery';
import { MotionTest, MT_FRAMES } from './MotionTest';
import { MotionTest2, MT2_FRAMES } from './MotionTest2';
import { MotionTest3, MT3_FRAMES } from './MotionTest3';

export const Root: React.FC = () => (
  <>
    <Composition id="Gallery" component={Gallery} durationInFrames={3} fps={30} width={1920} height={1080} />
    <Composition id="MotionTest" component={MotionTest} durationInFrames={MT_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MotionTest2" component={MotionTest2} durationInFrames={MT2_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MotionTest3" component={MotionTest3} durationInFrames={MT3_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

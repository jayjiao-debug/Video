import React from 'react';
import { Composition } from 'remotion';
import { Gallery } from './Gallery';
import { MotionTest, MT_FRAMES } from './MotionTest';

export const Root: React.FC = () => (
  <>
    <Composition id="Gallery" component={Gallery} durationInFrames={3} fps={30} width={1920} height={1080} />
    <Composition id="MotionTest" component={MotionTest} durationInFrames={MT_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

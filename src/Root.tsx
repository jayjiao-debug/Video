import React from 'react';
import { Composition } from 'remotion';
import { Ring, OPEN_FRAMES } from './Ring';
import { Ring2, OPEN2_FRAMES } from './Ring2';
import { Gallery } from './Gallery';
import { Film, FILM_FRAMES } from './Film';
import { MotionTest, MT_FRAMES } from './MotionTest';
import { MotionTest2, MT2_FRAMES } from './MotionTest2';

export const Root: React.FC = () => (
  <>
    <Composition id="RingOpen" component={Ring} durationInFrames={OPEN_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="RingOpen2" component={Ring2} durationInFrames={OPEN2_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Gallery" component={Gallery} durationInFrames={3} fps={30} width={1920} height={1080} />
    <Composition id="MotionTest" component={MotionTest} durationInFrames={MT_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MotionTest2" component={MotionTest2} durationInFrames={MT2_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

import React from 'react';
import { Composition } from 'remotion';
import { Opening, OPEN_FRAMES } from './Opening';

export const Root: React.FC = () => (
  <>
    <Composition id="Opening" component={Opening} durationInFrames={OPEN_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

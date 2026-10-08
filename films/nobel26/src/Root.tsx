import React from 'react';
import { Composition } from 'remotion';
import { Frames } from './Frames';

export const Root: React.FC = () => (
  <>
    <Composition id="Frames" component={Frames} durationInFrames={3} fps={1} width={1920} height={1080} />
  </>
);

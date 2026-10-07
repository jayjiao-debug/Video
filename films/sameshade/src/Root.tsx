import React from 'react';
import { Composition } from 'remotion';
import { Storyboard, N_SCENES } from './Storyboard';

export const Root: React.FC = () => (
  <>
    <Composition id="Storyboard" component={Storyboard} durationInFrames={N_SCENES} fps={30} width={1920} height={1080} />
  </>
);

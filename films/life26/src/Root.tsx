import React from 'react';
import { Composition } from 'remotion';
import { Looks } from './Looks';
import { Cardboard } from './Cardboard';

export const Root: React.FC = () => (
  <>
    <Composition id="Looks" component={Looks} durationInFrames={6} fps={30} width={1920} height={1080} />
    <Composition id="Cardboard" component={Cardboard} durationInFrames={3} fps={30} width={1920} height={1080} />
  </>
);

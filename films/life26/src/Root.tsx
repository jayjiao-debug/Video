import React from 'react';
import { Composition } from 'remotion';
import { Looks } from './Looks';

export const Root: React.FC = () => (
  <>
    <Composition id="Looks" component={Looks} durationInFrames={6} fps={30} width={1920} height={1080} />
  </>
);

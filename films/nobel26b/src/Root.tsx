import React from 'react';
import { Composition } from 'remotion';
import { Keys, KEY_COUNT } from './Keys';

export const Root: React.FC = () => (
  <>
    <Composition id="Keys" component={Keys} durationInFrames={KEY_COUNT} fps={1} width={1920} height={1080} />
  </>
);

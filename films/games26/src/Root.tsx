import React from 'react';
import { Composition } from 'remotion';
import { GKeys, GKEY_COUNT } from './GKeys';

export const Root: React.FC = () => (
  <>
    <Composition id="GKeys" component={GKeys} durationInFrames={GKEY_COUNT} fps={1} width={1920} height={1080} />
  </>
);

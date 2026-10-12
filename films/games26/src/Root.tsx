import React from 'react';
import { Composition } from 'remotion';
import { GKeys, GKEY_COUNT } from './GKeys';
import { HKeys, HKEY_COUNT } from './HKeys';

export const Root: React.FC = () => (
  <>
    <Composition id="GKeys" component={GKeys} durationInFrames={GKEY_COUNT} fps={1} width={1920} height={1080} />
    <Composition id="HKeys" component={HKeys} durationInFrames={HKEY_COUNT} fps={1} width={1920} height={1080} />
  </>
);

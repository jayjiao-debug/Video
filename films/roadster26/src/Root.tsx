import React from 'react';
import { Composition } from 'remotion';
import { Keyframes } from './Keyframes';

export const Root: React.FC = () => (
  <>
    <Composition id="Keyframes" component={Keyframes} durationInFrames={7} fps={30} width={1920} height={1080} />
  </>
);

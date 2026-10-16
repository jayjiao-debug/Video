import React from 'react';
import { Composition } from 'remotion';
import { Keyframes } from './Keyframes';
import { Film, FILM_FRAMES } from './Film';
import { Storyboard } from './Storyboard';
import { Analysis, ANALYSIS_FRAMES } from './Analysis';

export const Root: React.FC = () => (
  <>
    <Composition id="Keyframes" component={Keyframes} durationInFrames={7} fps={30} width={1920} height={1080} />
    <Composition id="Storyboard" component={Storyboard} durationInFrames={10} fps={30} width={1920} height={1080} />
    <Composition id="Analysis" component={Analysis} durationInFrames={ANALYSIS_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

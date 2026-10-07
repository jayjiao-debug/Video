import React from 'react';
import { Composition } from 'remotion';
import { Storyboard, N_SCENES } from './Storyboard';
import { Film } from './Film';
import { Cuts, N_CUTS } from './Cuts';
import { Demos, SEG } from './Demos';
import { Demos2, SEG2, N_PARTS } from './Demos2';
import { FPS, W, H, FILM_FRAMES } from './lib';

export const Root: React.FC = () => (
  <>
    <Composition id="Lazy" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Demos" component={Demos} durationInFrames={Math.round(3 * SEG * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Demos2" component={Demos2} durationInFrames={Math.round(N_PARTS * SEG2 * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Cuts" component={Cuts} durationInFrames={N_CUTS} fps={30} width={1920} height={1080} />
    <Composition id="Storyboard" component={Storyboard} durationInFrames={N_SCENES} fps={30} width={1920} height={1080} />
  </>
);

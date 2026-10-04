import React from 'react';
import {Composition} from 'remotion';
import {Film, FILM_FRAMES} from './Film';
import {FontGate} from './fonts';
import {Look, LOOK_FRAMES} from './StyleFrames';
import {Cover34, Cover43} from './Cover';

const Gated = (C: React.FC): React.FC => () => (
  <FontGate>
    <C />
  </FontGate>
);

export const Root: React.FC = () => (
  <>
    <Composition id="Walk" component={Gated(Film)} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Cover43" component={Gated(Cover43)} durationInFrames={1} fps={30} width={1440} height={1080} />
    <Composition id="Cover34" component={Gated(Cover34)} durationInFrames={1} fps={30} width={1080} height={1440} />
    <Composition id="Look" component={Gated(Look)} durationInFrames={LOOK_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

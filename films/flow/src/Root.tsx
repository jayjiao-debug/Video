import React from 'react';
import 'katex/dist/katex.min.css';
import {Composition} from 'remotion';
import {Film, FILM_FRAMES} from './Film';
import {FontGate} from './fonts';
import {Look, LOOK_FRAMES} from './StyleFrames';
import {Alt, ALT_FRAMES} from './Alt';
import {Tb, TB_FRAMES} from './StyleTb';
import {Test, TEST_FRAMES} from './v2/Test';

const Gated = (C: React.FC): React.FC => () => (
  <FontGate>
    <C />
  </FontGate>
);

export const Root: React.FC = () => (
  <>
    <Composition id="Flow" component={Gated(Film)} durationInFrames={FILM_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Test" component={Gated(Test)} durationInFrames={TEST_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Tb" component={Gated(Tb)} durationInFrames={TB_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Alt" component={Gated(Alt)} durationInFrames={ALT_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Look" component={Gated(Look)} durationInFrames={LOOK_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

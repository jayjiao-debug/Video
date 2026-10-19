import React from 'react';
import { Composition } from 'remotion';
import { Demo, DEMO_LEN } from './Demo';
import { Film, LEN } from './Film';
export const Root: React.FC = () => (<>
  <Composition id="Demo" component={Demo} durationInFrames={DEMO_LEN} fps={30} width={1920} height={1080} />
  <Composition id="Film" component={Film} durationInFrames={Math.round(LEN * 30)} fps={30} width={1920} height={1080} />
</>);

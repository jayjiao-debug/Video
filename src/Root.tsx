import React from 'react';
import { Composition } from 'remotion';
import { Keys } from './Keys';
import { Film, LEN, FPS } from './Film';
export const Root: React.FC = () => (<>
  <Composition id="Keys" component={Keys} durationInFrames={8} fps={30} width={1920} height={1080} />
  <Composition id="Film" component={Film} durationInFrames={Math.round(LEN * FPS)} fps={FPS} width={1920} height={1080} />
</>);

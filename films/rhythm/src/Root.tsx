import React from 'react';
import { Composition } from 'remotion';
import { Film, LEN, FPS, VW, VH } from './Film';
export const Root: React.FC = () => (<>
  <Composition id="Film" component={Film} durationInFrames={Math.round(LEN * FPS)} fps={FPS} width={VW} height={VH} />
</>);

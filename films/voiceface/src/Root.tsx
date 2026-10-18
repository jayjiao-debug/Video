import React from 'react';
import { Composition } from 'remotion';
import { Board, FRAMES } from './Board';
export const Root: React.FC = () => (<>
  <Composition id="Board" component={Board} durationInFrames={FRAMES.length} fps={30} width={1920} height={1080} />
</>);

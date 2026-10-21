import React from 'react';
import { Composition } from 'remotion';
import { KeyFilm, KEY_FRAMES } from './Key';
export const Root: React.FC = () => (<>
  <Composition id="Key" component={KeyFilm} durationInFrames={KEY_FRAMES} fps={30} width={1920} height={1080} />
</>);

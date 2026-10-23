import React from 'react';
import { Composition } from 'remotion';
import { Frames } from './Frames';
import { Phone } from './Phone';
export const Root: React.FC = () => (<>
  <Composition id="Frames" component={Frames} durationInFrames={8} fps={30} width={1920} height={1080} />
  <Composition id="Phone" component={Phone} durationInFrames={8} fps={30} width={1920} height={1080} />
</>);

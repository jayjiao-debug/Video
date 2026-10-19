import React from 'react';
import { Composition } from 'remotion';
import { Looks, LOOKS } from './Looks';
import { Motion, MOTION_LEN } from './Motion';
import { Reverse, REVERSE_LEN } from './Reverse';
export const Root: React.FC = () => (<>
  <Composition id="Looks" component={Looks} durationInFrames={LOOKS.length} fps={30} width={1920} height={1080} />
  <Composition id="Motion" component={Motion} durationInFrames={MOTION_LEN} fps={30} width={1920} height={1080} />
  <Composition id="Reverse" component={Reverse} durationInFrames={REVERSE_LEN} fps={30} width={1920} height={1080} />
</>);

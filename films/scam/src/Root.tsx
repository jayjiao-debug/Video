import React from 'react';
import { Composition } from 'remotion';
import { Looks, LOOKS } from './Looks';
import { Motion, MOTION_LEN } from './Motion';
import { Film, FILM_LEN } from './Film';
import { SetTest } from './SetTest';
import { Film2, FILM2_LEN } from './Film2';
export const Root: React.FC = () => (<>
  <Composition id="Looks" component={Looks} durationInFrames={LOOKS.length} fps={30} width={1920} height={1080} />
  <Composition id="Motion" component={Motion} durationInFrames={MOTION_LEN} fps={30} width={1920} height={1080} />
  <Composition id="Film" component={Film} durationInFrames={FILM_LEN} fps={30} width={1920} height={1080} />
  <Composition id="SetTest" component={SetTest} durationInFrames={4} fps={30} width={1920} height={1080} />
  <Composition id="Film2" component={Film2} durationInFrames={FILM2_LEN} fps={30} width={1920} height={1080} />
</>);

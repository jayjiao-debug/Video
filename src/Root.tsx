import React from 'react';
import { Composition } from 'remotion';
import { Cine, CINE_FRAMES } from './Cine';
export const Root: React.FC = () => (<Composition id="Cine" component={Cine} durationInFrames={CINE_FRAMES} fps={30} width={1920} height={1080} />);

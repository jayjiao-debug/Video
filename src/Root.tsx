import React from 'react';
import { Composition } from 'remotion';
import { Film2, FILM2_LEN } from './Film2';
export const Root: React.FC = () => (<Composition id="Film2" component={Film2} durationInFrames={FILM2_LEN} fps={30} width={1920} height={1080} />);

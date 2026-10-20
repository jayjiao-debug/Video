import React from 'react';
import { Composition } from 'remotion';
import { Film, FILM_LEN } from './Film';
export const Root: React.FC = () => (<Composition id="Film" component={Film} durationInFrames={FILM_LEN} fps={30} width={1920} height={1080} />);

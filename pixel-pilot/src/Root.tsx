import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {DURATION, FPS} from './script';

export const Root: React.FC = () => (
	<Composition id="Pilot" component={Film} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);

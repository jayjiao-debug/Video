import React from 'react';
import {Composition} from 'remotion';
import {Episode, calculateMetadata, type EpisodeProps} from './Episode';

export const Root: React.FC = () => (
	<Composition
		id="Episode"
		component={Episode}
		defaultProps={{episode: 'survivorship'}}
		calculateMetadata={calculateMetadata}
		// replaced by calculateMetadata from the episode's timeline.json
		durationInFrames={30}
		fps={30}
		width={1080}
		height={1920}
	/>
);

import React from 'react';
import {Composition} from 'remotion';
import {Episode, calculateMetadata, type EpisodeProps} from './Episode';
import {Gallery, SHEETS} from './Gallery';
import {MotionTest} from './MotionTest';
import {TankHookTest} from './TankHookTest';
import {Branded, calculateBrandMetadata, type BrandedProps} from './brand/Brand';

export const Root: React.FC = () => (
	<>
		<Composition
			id="Episode"
			component={Episode}
			defaultProps={{episode: 'survivorship'} as EpisodeProps}
			calculateMetadata={calculateMetadata}
			// replaced by calculateMetadata from the episode's timeline.json
			durationInFrames={30}
			fps={30}
			width={1080}
			height={1920}
		/>
		{/* art model sheets, one per frame: node scripts/stills.mjs with COMPOSITION=Gallery */}
		<Composition id="Gallery" component={Gallery} durationInFrames={SHEETS.length} fps={30} width={1920} height={1080} />
		<Composition id="MotionTest" component={MotionTest} durationInFrames={150} fps={30} width={1920} height={1080} />
		<Composition id="TankHookTest" component={TankHookTest} durationInFrames={150} fps={30} width={1920} height={1080} />
		{/* channel package: python brand.py <video-id> */}
		<Composition
			id="Branded"
			component={Branded}
			defaultProps={{video: 'stopping', part: 'full'} as BrandedProps}
			calculateMetadata={calculateBrandMetadata}
			durationInFrames={30}
			fps={30}
			width={1920}
			height={1080}
		/>
	</>
);

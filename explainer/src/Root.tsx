import React from 'react';
import {Composition} from 'remotion';
import {Episode, calculateMetadata, type EpisodeProps} from './Episode';
import {Gallery, SHEETS} from './Gallery';
import {MotionTest} from './MotionTest';
import {TankHookTest} from './TankHookTest';
import {Branded, calculateBrandMetadata, type BrandedProps} from './brand/Brand';
import {TanksCover} from '../episodes/tanks/cover';
import {COFFEE_SHEETS, CoffeeGallery} from '../episodes/coffee/gallery';
import {CoffeeRewindTest} from '../episodes/coffee/motiontest';
import {LOOKS, XumingLook} from '../episodes/xuming/look';
import {XumingTitleTest} from '../episodes/xuming/titletest';
import {LOOK3_N, XumingLook3} from '../episodes/xuming/look3';
import {BOARD2_N, XumingBoard2} from '../episodes/xuming/storyboard2';
import {XumingOpen} from '../episodes/xuming/opentest';
import {BENFORD_BOARD_N, BenfordBoard} from '../episodes/benford/storyboard';

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
		<Composition id="CoffeeRewindTest" component={CoffeeRewindTest} durationInFrames={150} fps={30} width={1920} height={1080} />
		<Composition id="XumingTitleTest" component={XumingTitleTest} durationInFrames={200} fps={30} width={1920} height={1080} />
		<Composition id="XumingOpen" component={XumingOpen} durationInFrames={540} fps={30} width={1920} height={1080} />
		<Composition id="XumingBoard2" component={XumingBoard2} durationInFrames={BOARD2_N} fps={30} width={1920} height={1080} />
		<Composition id="XumingLook3" component={XumingLook3} durationInFrames={LOOK3_N} fps={30} width={1920} height={1080} />
		<Composition id="BenfordBoard" component={BenfordBoard} durationInFrames={BENFORD_BOARD_N} fps={30} width={1920} height={1080} />
		<Composition id="XumingLook" component={XumingLook} durationInFrames={LOOKS} fps={30} width={1920} height={1080} />
		<Composition id="CoffeeGallery" component={CoffeeGallery} durationInFrames={COFFEE_SHEETS.length} fps={30} width={1920} height={1080} />
		{/* Douyin covers: COMPOSITION=CoverWide|CoverTall node scripts/stills.mjs tanks <dir> 0 */}
		<Composition id="CoverWide" component={TanksCover} defaultProps={{layout: 'wide' as const}} durationInFrames={1} fps={30} width={1440} height={1080} />
		<Composition id="CoverTall" component={TanksCover} defaultProps={{layout: 'tall' as const}} durationInFrames={1} fps={30} width={1080} height={1440} />
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

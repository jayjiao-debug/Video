import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {LacDefs} from '../qq50/styleB';
import {TakeA} from './take53';
import {TakeC} from './take53c';
import {HandoffMacro} from './handoff53';
import {TakeB3} from './take53b3';
import {TakeG} from './take53g';
import {TakeD3} from './take53d3';
import {FPS3, FRAMES3, V3, SHIFT_DRAW, SHIFT_MID} from './v3map53';
/* ep53 cover art: the v3.2 film's picture only (EP53V3 without Overlay53v3: no subtitles, stamps, seal, tiles or title), so the
   covers are re-rendered from the final code (docs/history-video-style). Stills: frame = film seconds × 30. */
const Pic: React.FC = () => { const t = useCurrentFrame() / FPS3;
	return <AbsoluteFill style={{background: '#0F0806', overflow: 'hidden'}}>
		<svg width={0} height={0} style={{position: 'absolute'}}><LacDefs /></svg>
		{t < V3.DIVE ? <TakeA t={t} /> : t < V3.DRAW ? <TakeB3 t={t} /> : t < V3.G0 ? <TakeC t={t + SHIFT_DRAW} /> : t < V3.B1 ? <TakeG t={t} />
			: t < V3.STILL ? <TakeC t={t + SHIFT_MID} /> : t < V3.T1 ? <HandoffMacro /> : <TakeD3 t={t} />}
	</AbsoluteFill>; };
registerRoot(() => <Composition id="COVERPIC53" component={Pic} width={W} height={H} fps={FPS3} durationInFrames={FRAMES3} />);

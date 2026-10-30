import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {LacDefs} from '../qq50/styleB';
import {TakeA, titleQuad} from './take53';
import {TakeC} from './take53c';
import {HandoffMacro} from './handoff53';
import {TakeB3} from './take53b3';
import {TakeG} from './take53g';
import {TakeD3} from './take53d3';
import {Overlay53v3} from './master53v3';
import {FPS3, FRAMES3, V3, SHIFT_DRAW, SHIFT_MID} from './v3map53';
/* ep53 v3 master: 1920×1080, 30 fps, 4360 frames (145.333 s). ONE continuous camera. Routing (MUSIC_NOTES_v3.md):
   0–20.821 TakeA · –38.935 TakeB3 · –51.954 TakeC(v2 +4.528) · –92.709 TakeG (勾践) · –110.639 TakeC(v2 −36.227) ·
   –111.389 HandoffMacro (still) · then TakeD3. Overlay53v3 (master53v3) on top. */
export const Film53v3: React.FC<{t: number}> = ({t}) => <AbsoluteFill style={{background: '#0F0806', overflow: 'hidden'}}>
	<svg width={0} height={0} style={{position: 'absolute'}}><LacDefs /></svg>
	{t < V3.DIVE ? <TakeA t={t} /> : t < V3.DRAW ? <TakeB3 t={t} /> : t < V3.G0 ? <TakeC t={t + SHIFT_DRAW} /> : t < V3.B1 ? <TakeG t={t} />
		: t < V3.STILL ? <TakeC t={t + SHIFT_MID} /> : t < V3.T1 ? <HandoffMacro /> : <TakeD3 t={t} />}
	<Overlay53v3 t={t} quad={titleQuad(t)} />
</AbsoluteFill>;
const C: React.FC = () => <Film53v3 t={useCurrentFrame() / FPS3} />;
const Root: React.FC = () => <Composition id="EP53V3" component={C} width={W} height={H} fps={FPS3} durationInFrames={FRAMES3} />;
registerRoot(Root);

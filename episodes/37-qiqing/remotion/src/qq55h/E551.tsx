import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Act1} from './act551';
import {DepthDebug} from './act551c';
/* ep55 v2 · act 1 (cards 1, 2, T, A–F, film 0 → 42.2 s): frame f renders film time t = f / 30.
   ACT1D: the same with the city's depth-sorted objects tinted by sort rank (blue = far … red = near), for the layer check. */
const F: React.FC = () => <Act1 t={useCurrentFrame() / 30} />;
const FD: React.FC = () => <DepthDebug.Provider value={true}><Act1 t={useCurrentFrame() / 30} /></DepthDebug.Provider>;
const Root: React.FC = () => <>
	<Composition id="ACT1" component={F} width={1920} height={1080} fps={30} durationInFrames={5450} />
	<Composition id="ACT1D" component={FD} width={1920} height={1080} fps={30} durationInFrames={5450} />
</>;
registerRoot(Root);

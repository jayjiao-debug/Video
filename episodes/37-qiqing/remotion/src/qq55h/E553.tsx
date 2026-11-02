import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Act3, LayerCheck} from './act553';
/* ep55 v2 · act part 3 (builder 3): cards N–S, film 73.90 → 101.07. Frame f renders film time f / 30.
   ACT3L = the same frames as layer-check silhouettes (each layer tinted by depth; house rule 3). */
const F: React.FC = () => <Act3 t={useCurrentFrame() / 30} />;
const FL: React.FC = () => <LayerCheck.Provider value={true}><Act3 t={useCurrentFrame() / 30} /></LayerCheck.Provider>;
const Root: React.FC = () => <>
	<Composition id="ACT3" component={F} width={1920} height={1080} fps={30} durationInFrames={5450} />
	<Composition id="ACT3L" component={FL} width={1920} height={1080} fps={30} durationInFrames={5450} />
</>;
registerRoot(Root);

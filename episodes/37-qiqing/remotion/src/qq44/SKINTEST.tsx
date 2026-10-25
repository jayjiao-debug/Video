import './skinflag44';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {W, H} from './kit44';
import {Rough, FRAMES, FPS} from './EP44ROUGH';
import type {Skin} from './skin44';
/* caption-layout test entry (ENTRY=qq44/SKINTEST): the full EP44 cut with each furniture variant from skin44.tsx.
   EP44ROUGH (= skin A, today's look) is registered here too; EP44SKIN-A…D (Remotion ids allow no "_") differ only in the subtitle / stamp / counter skin. */
const SKINS: Skin[] = ['A', 'B', 'C', 'D'];
registerRoot(() => <>
	<Composition id="EP44ROUGH" component={Rough} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
	{SKINS.map((k) => <Composition key={k} id={`EP44SKIN-${k}`} component={Rough} defaultProps={{skin: k}} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />)}
</>);

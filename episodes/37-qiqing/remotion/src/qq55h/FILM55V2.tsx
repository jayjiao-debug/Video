import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Act1} from './act551';
import {Act2} from './act552';
import {Act3} from './act553';
import {Act4} from './act554';
import {Act5} from './act555';
/* ep55 · 何尊 v2 — the whole film, picture only: frame f = film time f / 30 (181.67 s = 5450 frames).
   Five acts butt together frame-exactly: [0,1266) [1266,2217) [2217,3033) [3033,4119) [4119,5450). */
const F: React.FC = () => { const f = useCurrentFrame(), t = f / 30;
	if (f < 1266) return <Act1 t={t} />;
	if (f < 2217) return <Act2 t={t} />;
	if (f < 3033) return <Act3 t={t} />;
	if (f < 4119) return <Act4 t={t} />;
	return <Act5 t={t} />; };
const Root: React.FC = () => <Composition id="FILM55V2" component={F} width={1920} height={1080} fps={30} durationInFrames={5450} />;
registerRoot(Root);

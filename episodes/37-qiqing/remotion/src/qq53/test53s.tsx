import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Sword} from './props53';
import {Sword3D} from './sword3d';
import {lookAt} from './parts53';
/* ep53 · QA sheet for the one sword (not in the film): frame 0 = the flat sword (props53.Sword) above the 3-D sword (sword3d,
   seen from straight above at the same scale) — they must agree part for part; frames 1–3 = the 3-D sword from three angles. */
const SP = {x0: -278, ya: 0, z0: 0, dir: 1 as const};
const Sheet: React.FC = () => { const f = useCurrentFrame();
	const cams = [lookAt([0, 1, 3000], [0, 0, 0], 3000 * 3.2, 960, 760), lookAt([-520, -260, 160], [-150, 0, 0], 1500), lookAt([300, -220, 90], [-180, 0, 0], 1500), lookAt([-700, 60, 40], [-278, 0, 0], 2600)];
	return <AbsoluteFill style={{background: '#1A0E08'}}><svg width={1920} height={1080}>
		{f === 0 && <Sword x={960 - 27.8 * 32} y={300} k={32} rot={90} id="t0" />}
		<Sword3D c={cams[f]} sp={SP} id="t3" />
	</svg></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="TEST53S" component={Sheet} width={1920} height={1080} fps={30} durationInFrames={4} />;
registerRoot(Root);

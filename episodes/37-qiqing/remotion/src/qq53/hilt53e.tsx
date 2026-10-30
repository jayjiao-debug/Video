import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {LacDefs} from '../qq50/styleB';
import {lookAt, V3} from './parts53';
import {Sword3D} from './sword3d';
import {SwordFlat} from './flat53s';
import {GripFlat53E} from './hiltflat53e';
/* ep53 · fix-e QA only: the hilt (grip, hoops, cord) close up from four views, one per frame, then (frame 4) the flat sword with
   GripFlat53E laid over its hilt (not in the film). */
const FS = (a: number, w: number): [number, number] => [1500 - a * 120 + 4000 * 0, 540 + w * 120];   // cm → px, 12 px/mm, pommel at the right
const SP = {x0: -278, ya: 0, z0: 1000, dir: 1 as const};
const VIEWS: [V3, V3, number][] = [
	[[-150, -260, 1180], [-235, 0, 1000], 2600],     // front three-quarter, from the blade side, above
	[[-240, -300, 1000], [-235, 0, 1000], 3200],     // side, level
	[[-60, -120, 1160], [-240, 0, 1000], 2200],      // along the axis from the blade side, above
	[[-420, -200, 1150], [-235, 0, 1000], 2600]];    // from the pommel side
const Hilt53E: React.FC = () => { const f = useCurrentFrame(); if (f >= VIEWS.length) return <AbsoluteFill style={{background: '#1C0F0A'}}><svg width={W} height={H}>
		<g transform="translate(-150,0)"><SwordFlat S={FS} id="fq" /></g><g transform="translate(-150,-300)"><SwordFlat S={FS} id="fr" /><GripFlat53E M={(a, w) => FS(a / 10, w / 10)} kmm={12} id="fr" /></g></svg></AbsoluteFill>;
	const [p, t, fl] = VIEWS[f % VIEWS.length];
	return <AbsoluteFill style={{background: '#1C0F0A'}}><svg width={W} height={H}><LacDefs />
		<Sword3D c={lookAt(p, t, fl)} sp={SP} id="hq" /></svg></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="Hilt53E" component={Hilt53E} width={W} height={H} fps={30} durationInFrames={VIEWS.length + 1} />;
registerRoot(Root);

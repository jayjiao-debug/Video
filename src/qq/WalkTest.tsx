import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Lit3, Look3} from './walker3';
const LOOKS: Look3[] = [{dress: 'robe', sleeves: 'wide', head: 'bun', beard: 'short', carry: 'bone'}, {dress: 'robe', sleeves: 'wide', head: 'futou', beard: 'long', carry: 'letter'}, {dress: 'coat', head: 'tophat', carry: 'tape'}, {dress: 'coat', head: 'short', beard: 'full', gait: '08_01'}];
export const WalkTest: React.FC = () => { const f = useCurrentFrame(); const u = f / 34;
	return <AbsoluteFill style={{background: 'linear-gradient(#2b2f55,#c98d6a)'}}><svg width={1920} height={1080}>
		{LOOKS.map((l, i) => <Lit3 key={i} x={260 + i * 460} ground={900} h={460} u={u + i * 0.13} look={l} rim="#ffd9a0" />)}
		<rect x={0} y={900} width={1920} height={180} fill="#120e18" /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="WALK" component={WalkTest} durationInFrames={68} fps={30} width={1920} height={1080} />);

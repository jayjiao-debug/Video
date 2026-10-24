import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Rimmed, gaitPose, POSES, Look4, Pose} from './figure4';
const LOOKS: Look4[] = [{dress: 'robe', sleeves: 'wide', head: 'bun', beard: 'short'}, {dress: 'robe', sleeves: 'wide', head: 'futou', beard: 'long'}, {dress: 'coat', head: 'tophat'}, {dress: 'coat', head: 'short', beard: 'full', gait: '08_01'}, {dress: 'shirt', head: 'glasses'}, {dress: 'dress', head: 'bob'}];
const PS: [string, Pose][] = Object.entries(POSES);
export const FigTest: React.FC = () => { const f = useCurrentFrame(); const u = f / 34;
	return <AbsoluteFill style={{background: 'linear-gradient(#2b2f55,#c98d6a)'}}><svg width={1920} height={1080}>
		{LOOKS.map((l, i) => <Rimmed key={i} x={170 + i * 320} ground={470} h={360} pose={gaitPose(l.gait ?? '08_04', u + i * 0.13)} lag={gaitPose(l.gait ?? '08_04', u + i * 0.13 - 0.04)} look={l} T={f / 30} />)}
		<rect x={0} y={470} width={1920} height={20} fill="#120e18" />
		{PS.map(([n, p], i) => <g key={n}><Rimmed x={110 + i * 205} ground={1000} h={330} pose={p} look={LOOKS[i % 4 === 0 ? 4 : i % 4]} T={f / 30} /><text x={110 + i * 205} y={1060} fill="#fff" fontSize={24} textAnchor="middle">{n}</text></g>)}
		<rect x={0} y={1000} width={1920} height={20} fill="#120e18" /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="FIG" component={FigTest} durationInFrames={68} fps={30} width={1920} height={1080} />);

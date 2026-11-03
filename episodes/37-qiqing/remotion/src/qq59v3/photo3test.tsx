import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Print3, PH3} from './photo3';
const T: React.FC = () => {
	const t = useCurrentFrame() / 30;
	return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 60%, #3a4a5c 0%, #1a2230 55%, #0b0e14 100%)'}}>
		<div style={{position: 'absolute', left: 150, top: 120, fontFamily: 'Noto Sans CJK SC', fontWeight: 700, fontSize: 65, color: '#FFF6E6'}}>海面结了冰——</div>
		<Print3 {...PH3.beringIce} t={t} dur={3} cx={1250} cy={560} w={560} rot={-3} caption="2006.3 · 白令海峡" />
		<Print3 {...PH3.frostFace} t={t - 0.5} dur={2.5} cx={720} cy={640} w={420} rot={4} from="left" caption="西伯利亚" z={1} />
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="P3TEST" component={T} durationInFrames={150} fps={30} width={1920} height={1080} />);

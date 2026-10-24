import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Rimmed, gaitPose, POSES} from './figure4';
export const FigBig: React.FC = () => { const f = useCurrentFrame(); const u = f / 34;
	return <AbsoluteFill style={{background: 'linear-gradient(#2b2f55,#c98d6a)'}}><svg width={1920} height={1080}>
		<Rimmed x={420} ground={1040} h={1000} pose={gaitPose('08_04', u)} lag={gaitPose('08_04', u - 0.04)} look={{dress: 'coat', head: 'tophat', beard: 'full'}} T={f / 30} />
		<Rimmed x={1100} ground={1040} h={1000} pose={gaitPose('08_04', u + 0.5)} lag={gaitPose('08_04', u + 0.46)} look={{dress: 'robe', sleeves: 'wide', head: 'futou', beard: 'long'}} T={f / 30} />
		<Rimmed x={1600} ground={1040} h={1000} pose={POSES.speak} look={{dress: 'shirt', head: 'short'}} T={f / 30} />
	</svg></AbsoluteFill>; };
registerRoot(() => <Composition id="FIGBIG" component={FigBig} durationInFrames={68} fps={30} width={1920} height={1080} />);

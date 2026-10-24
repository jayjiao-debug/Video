import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {W, H, Grain} from './kit42';
import {KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF09, KF10, KF11} from './frames42';
/* ep42 key frames: one still per scene; frame i lives at second i (30 fps). */
const FRAMES = [KF01, KF02, KF03, KF04, KF05, KF06, KF07, KF08, KF09, KF10, KF11];
const PLATES = ['ep42/nile.webp', 'ep42/sea.webp', 'ep42/danube.webp', 'ep42/field.webp', 'ep42/study.webp'];
const KF42: React.FC = () => {
	const f = useCurrentFrame(), i = Math.min(FRAMES.length - 1, Math.floor(f / 30)), F = FRAMES[i];
	return <AbsoluteFill style={{background: '#000'}}>
		<div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}>{PLATES.map((p) => <Img key={p} src={staticFile(p)} style={{width: 1, height: 1}} />)}</div>
		<svg width={W} height={H} style={{position: 'absolute'}}><F /><Grain f={f} vig={i === 7 ? 0.3 : 0.45} grain={0.05} /></svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="KF42" component={KF42} durationInFrames={11 * 30} fps={30} width={W} height={H} />);

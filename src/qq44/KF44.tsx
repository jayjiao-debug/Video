import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {W, H, Grain44} from './kit44';
import {FRAMES44} from './frames44';
/* ep44 key frames: frame i lives at second i (30 fps). */
const KF44: React.FC = () => {
	const f = useCurrentFrame(), i = Math.min(FRAMES44.length - 1, Math.floor(f / 30)), F = FRAMES44[i];
	return <AbsoluteFill style={{background: '#000'}}>
		<div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}>{['ep44/highway.webp', 'ep44/meadow.webp'].map((p) => <Img key={p} src={staticFile(p)} style={{width: 1, height: 1}} />)}</div>
		<svg width={W} height={H} style={{position: 'absolute'}}>{F.scene}<Grain44 seed={i + 3} /></svg>
		{F.furn}
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="KF44" component={KF44} durationInFrames={12 * 30} fps={30} width={W} height={H} />);

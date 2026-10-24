import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, HatchDefs} from './kit45';
import {FRAMES45} from './frames45';
/* ep45 key frames: frame i lives at second i (30 fps). */
const Grain45: React.FC<{seed: number}> = ({seed}) => <g pointerEvents="none">
	<defs><radialGradient id="v45" cx="0.5" cy="0.5" r="0.78"><stop offset="0.6" stopColor="#0c1418" stopOpacity="0" /><stop offset="1" stopColor="#0c1418" stopOpacity="0.38" /></radialGradient>
		<filter id="g45" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={seed} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45" /></filter></defs>
	<rect width={W} height={H} fill="url(#v45)" /><rect width={W} height={H} filter="url(#g45)" opacity={0.045} style={{mixBlendMode: 'overlay'}} />
</g>;
const KF45: React.FC = () => {
	const f = useCurrentFrame(), i = Math.min(FRAMES45.length - 1, Math.floor(f / 30)), F = FRAMES45[i];
	return <AbsoluteFill style={{background: '#24323A'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}><HatchDefs />{F.scene}<Grain45 seed={i + 3} /></svg>
		{F.furn}
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="KF45" component={KF45} durationInFrames={13 * 30} fps={30} width={W} height={H} />);

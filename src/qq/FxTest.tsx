import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {WireTunnel, Grain, Letterbox} from './fx';
import {VhsOverlay, yearAt} from './vhs';
export const FxTest: React.FC = () => { const f = useCurrentFrame();
	return <AbsoluteFill style={{background: '#000'}}><svg width={1920} height={1080}>
		{f < 30 ? <g><rect width={1920} height={1080} fill="#4a5a7a" /><VhsOverlay f={f} W={1920} H={1080} year={yearAt(1977, -1200, f / 30)} /></g> : <g><WireTunnel u={(f - 30) / 30} t={f / 30} /><Letterbox k={1} /></g>}
		<Grain f={f} />
	</svg></AbsoluteFill>; };
registerRoot(() => <Composition id="FX" component={FxTest} durationInFrames={60} fps={30} width={1920} height={1080} />);

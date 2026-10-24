import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {MARCONI3} from './s41marconi';
import {Grain} from './fx';
export const MarconiTest: React.FC = () => { const f = useCurrentFrame(); const tau = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><svg width={1920} height={1080}><MARCONI3 tau={tau} t={110.385 + tau} /><Grain f={f} vig={0.45} grain={0.05} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="MCT" component={MarconiTest} durationInFrames={544} fps={30} width={1920} height={1080} />);

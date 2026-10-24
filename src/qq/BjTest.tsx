import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {BJ3} from './s41bj';
import {Grain} from './fx';
export const BjTest: React.FC = () => { const f = useCurrentFrame(); const tau = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><svg width={1920} height={1080}><BJ3 tau={tau} t={145.7 + tau} /><Grain f={f} vig={0.45} grain={0.05} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="BJT" component={BjTest} durationInFrames={456} fps={30} width={1920} height={1080} />);

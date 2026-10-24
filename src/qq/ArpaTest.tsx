import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {ARPA3} from './s41arpa';
import {Grain} from './fx';
export const ArpaTest: React.FC = () => { const f = useCurrentFrame(); const tau = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><svg width={1920} height={1080}><ARPA3 tau={tau} t={128.497 + tau} /><Grain f={f} vig={0.45} grain={0.05} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="APT" component={ArpaTest} durationInFrames={517} fps={30} width={1920} height={1080} />);

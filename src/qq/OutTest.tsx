import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {OUTRO3} from './s41outro';
import {Grain, Letterbox} from './fx';
export const OutTest: React.FC = () => { const f = useCurrentFrame(); const t = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><svg width={1920} height={1080}><OUTRO3 tau={t} t={172.935 + t} /><Grain f={f} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="OUTT" component={OutTest} durationInFrames={455} fps={30} width={1920} height={1080} />);

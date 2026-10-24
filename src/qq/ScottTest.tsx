import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {SCOTT3} from './s41scott';
import {Grain} from './fx';
export const ScottTest: React.FC = () => { const f = useCurrentFrame(); const t = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><svg width={1920} height={1080}><SCOTT3 tau={t} t={t} /><Grain f={f} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="SCT" component={ScottTest} durationInFrames={535} fps={30} width={1920} height={1080} />);

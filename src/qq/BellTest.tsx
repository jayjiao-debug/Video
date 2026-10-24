import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {BELL3} from './s41bell';
import {Grain} from './fx';
export const BellTest: React.FC = () => { const f = useCurrentFrame(); const t = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><svg width={1920} height={1080}><BELL3 tau={t} t={t} /><Grain f={f} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="BT" component={BellTest} durationInFrames={660} fps={30} width={1920} height={1080} />);

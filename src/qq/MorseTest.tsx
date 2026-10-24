import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {MORSE3} from './s41morse';
import {Grain} from './fx';
export const MorseTest: React.FC = () => { const f = useCurrentFrame(); const t = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><svg width={1920} height={1080}><MORSE3 tau={t} t={t} /><Grain f={f} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="MOT" component={MorseTest} durationInFrames={545} fps={30} width={1920} height={1080} />);

import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Y1977} from './s41y1977';
import {Grain, Letterbox} from './fx';
export const Y77Test: React.FC = () => { const f = useCurrentFrame(); const t = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><svg width={1920} height={1080}><Y1977 tau={t} t={160.885 + t} /><Letterbox k={1} /><Grain f={f} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="Y77" component={Y77Test} durationInFrames={362} fps={30} width={1920} height={1080} />);

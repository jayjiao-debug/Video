import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Img, staticFile} from 'remotion';
import {DU3} from './s41du';
import {Grain} from './fx';
export const DuTest: React.FC = () => { const f = useCurrentFrame(); const tau = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><Img src={staticFile('ep41/du_sky.webp')} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} /><Img src={staticFile('ep41/sp/peach.png')} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} /><svg width={1920} height={1080}><DU3 tau={tau} t={34.836 + tau} /><Grain f={f} vig={0.45} grain={0.05} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="DUT" component={DuTest} durationInFrames={602} fps={30} width={1920} height={1080} />);

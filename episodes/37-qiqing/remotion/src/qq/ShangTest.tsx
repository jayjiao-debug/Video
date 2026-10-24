import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Img, staticFile} from 'remotion';
import {SHANG3} from './s41shang';
import {Grain} from './fx';
export const ShangTest: React.FC = () => { const f = useCurrentFrame(); const tau = f / 30;
	return <AbsoluteFill style={{background: '#000'}}><Img src={staticFile('ep41/shang_sky.webp')} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} /><Img src={staticFile('ep41/sp/tree.png')} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} /><Img src={staticFile('ep41/sp/ding.png')} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} /><svg width={1920} height={1080}><SHANG3 tau={tau} t={18.965 + tau} /><Grain f={f} vig={0.45} grain={0.05} /></svg></AbsoluteFill>; };
registerRoot(() => <Composition id="SHT" component={ShangTest} durationInFrames={477} fps={30} width={1920} height={1080} />);

import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {SCENES3} from './scenes3';
import {PLATES3} from './plates3';
/* clean background art for the ep41 Douyin covers: Bell's scene without subtitles or labels (frame/30 = Bell tau) */
const Bg: React.FC = () => { const f = useCurrentFrame(), S = SCENES3[4];
	return <AbsoluteFill style={{background: '#000'}}>
		<div style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0}}>{PLATES3.map((p) => <Img key={p} src={staticFile(p)} style={{width: 1, height: 1}} />)}</div>
		<S tau={f / 30} t={90.63 + f / 30} />
	</AbsoluteFill>; };
registerRoot(() => <Composition id="COVERBG41" component={Bg} durationInFrames={600} fps={30} width={1920} height={1080} />);

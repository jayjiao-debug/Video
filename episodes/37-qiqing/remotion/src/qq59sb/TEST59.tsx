import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {W, H, Trav, LK, walkAt, STRIDE} from './kit59';
/* gait check: 10 phases of the walk with the pack */
const T: React.FC = () => <AbsoluteFill style={{background: '#8a8f94'}}><svg width={W} height={H}>
	{Array.from({length: 10}, (_, i) => { const h = 380, ph = i / 10; return <g key={i}><Trav x={110 + i * 185} g={520} h={h} pose={walkAt(ph * STRIDE * h, h)} look={LK.young} />
		<text x={110 + i * 185} y={560} fontSize={28} fill="#000">{ph.toFixed(1)}</text></g>; })}
</svg></AbsoluteFill>;
registerRoot(() => <Composition id="T59" component={T} durationInFrames={1} fps={30} width={W} height={H} />);

import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay} from './demo54core';
import {Label} from './look54frame';
import {D1V} from './dv54a';
/* ep54 · D1 variant A stills: frame i = film time TS[i]; and a clip composition DVCA (film 99.9–102.25) */
const TS = [100.30, 100.40, 100.70, 101.60];
const Still: React.FC = () => { const f = useCurrentFrame(), t = TS[Math.min(TS.length - 1, f)];
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><D1V t={t} /><Overlay t={t} /><Label s={`D1 variant A · ${t.toFixed(2)}`} /></AbsoluteFill>; };
const Clip: React.FC = () => { const t = 100.256 + useCurrentFrame() / 30;
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><D1V t={t} /><Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="DVA54" component={Still} width={W} height={H} fps={30} durationInFrames={TS.length} />
	<Composition id="DVCA54" component={Clip} width={W} height={H} fps={30} durationInFrames={60} />
</>;
registerRoot(Root);

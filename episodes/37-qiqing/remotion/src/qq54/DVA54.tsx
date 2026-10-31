import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay} from './demo54core';
import {Label} from './look54frame';
import {D1V} from './dv54a';
/* ep54 · D1 variant A (round 6): stills, frame i = film time TS[i]; and the clip DVCA54 = film frames 2978 → 3127 (99.267 → 104.233,
   the whole of D1V's span 99.259 → 104.240), frame f = film frame 2978 + f */
const TS = [99.40, 99.90, 100.20, 3008 / 30, 100.60, 102.25, 104.20];
const lab = (t: number) => (Math.abs(t * 100 - Math.round(t * 100)) > 1e-6 ? t.toFixed(4) : t.toFixed(2));
const Still: React.FC = () => { const f = useCurrentFrame(), t = TS[Math.min(TS.length - 1, f)];
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><D1V t={t} /><Overlay t={t} /><Label s={`D1 variant A · ${lab(t)}`} /></AbsoluteFill>; };
const F0 = 2978, F1 = 3128;
const Clip: React.FC = () => { const t = (F0 + useCurrentFrame()) / 30;
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><D1V t={t} /><Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="DVA54" component={Still} width={W} height={H} fps={30} durationInFrames={TS.length} />
	<Composition id="DVCA54" component={Clip} width={W} height={H} fps={30} durationInFrames={F1 - F0} />
</>;
registerRoot(Root);

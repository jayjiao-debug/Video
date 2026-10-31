import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay} from './demo54core';
import {Label} from './look54frame';
import {Drop} from './drop54s';
import {Handover} from './demo54s';
/* ep54 · the drop key stills for the owner's r2 review (set builder's entry; same as DROP54 with these times): frame i = FR[i]. */
const FR: {t: number; d: string}[] = [
	{t: 100.256, d: 'D1 open · 100.256 · 黑幕 + 剑光'}, {t: 100.30, d: 'D1 open · 100.30 · 黑幕拉开'}, {t: 100.36, d: 'D1 open · 100.36'},
	{t: 100.60, d: 'D1 · 100.60'}, {t: 102.40, d: 'D2 · 102.40'}, {t: 103.6, d: 'D2 · 103.6'}, {t: 97.6, d: 'Handover · 97.6 · 腿'},
];
const sceneAt = (t: number) => (t < 100.256 ? Handover : Drop);
const Still: React.FC = () => { const f = useCurrentFrame(), k = FR[Math.min(FR.length - 1, f)], S = sceneAt(k.t);
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><S t={k.t} /><Overlay t={k.t} /><Label s={`look B · ${k.d}`} /></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="DROP54" component={Still} width={W} height={H} fps={30} durationInFrames={FR.length} />;
registerRoot(Root);

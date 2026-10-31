import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay, BAR, END_T, FILM_LEN} from './demo54core';
import * as R3 from './film54r3';
/* ep54 full film entry (FR3): frame / 30 = film time t; the scene that owns t, the overlay (subtitles, stamps, counter, seal, title) on top */
type Sc = {a: number; b: number; C: React.FC<{t: number}>};
const SCENES: Sc[] = [
	{a: BAR(54), b: BAR(56), C: R3.Jieshi}, {a: BAR(56), b: BAR(58), C: R3.Chibi}, {a: BAR(58), b: BAR(60), C: R3.Wenwang}, {a: BAR(60), b: END_T, C: R3.Death}, {a: END_T, b: FILM_LEN + 1, C: R3.End},
];
const All: React.FC = () => { const t = useCurrentFrame() / 30, s = SCENES.find((k) => t >= k.a && t < k.b);
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{s ? <s.C t={t} /> : null}<Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="FR3" component={All} width={W} height={H} fps={30} durationInFrames={Math.round(FILM_LEN * 30)} />;
registerRoot(Root);
void END_T;

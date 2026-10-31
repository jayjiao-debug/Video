import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay, BAR, END_T, FILM_LEN} from './demo54core';
import * as R1 from './film54r1';
/* ep54 full film entry (FR1): frame / 30 = film time t; the scene that owns t, the overlay (subtitles, stamps, counter, seal, title) on top */
type Sc = {a: number; b: number; C: React.FC<{t: number}>};
const SCENES: Sc[] = [
	{a: BAR(18), b: BAR(22), C: R1.Xingyang}, {a: BAR(22), b: BAR(24), C: R1.Hong}, {a: BAR(24), b: BAR(26), C: R1.Haoli},
];
const All: React.FC = () => { const t = useCurrentFrame() / 30, s = SCENES.find((k) => t >= k.a && t < k.b);
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{s ? <s.C t={t} /> : null}<Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="FR1" component={All} width={W} height={H} fps={30} durationInFrames={Math.round(FILM_LEN * 30)} />;
registerRoot(Root);
void END_T;

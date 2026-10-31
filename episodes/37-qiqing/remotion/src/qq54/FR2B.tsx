import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay, BAR, END_T, FILM_LEN} from './demo54core';
import * as R2B from './film54r2b';
/* ep54 full film entry (FR2B): frame / 30 = film time t; the scene that owns t, the overlay (subtitles, stamps, counter, seal, title) on top */
type Sc = {a: number; b: number; C: React.FC<{t: number}>};
const SCENES: Sc[] = [
	{a: BAR(34), b: BAR(36), C: R2B.Lvbu}, {a: BAR(36), b: BAR(38), C: R2B.Rival}, {a: BAR(38), b: BAR(40), C: R2B.Army}, {a: BAR(40), b: BAR(42), C: R2B.Duizhi},
];
const All: React.FC = () => { const t = useCurrentFrame() / 30, s = SCENES.find((k) => t >= k.a && t < k.b);
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{s ? <s.C t={t} /> : null}<Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="FR2B" component={All} width={W} height={H} fps={30} durationInFrames={Math.round(FILM_LEN * 30)} />;
registerRoot(Root);
void END_T;

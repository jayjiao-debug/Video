import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay, BAR, END_T, FILM_LEN} from './demo54core';
import * as R2A from './film54r2a';
/* ep54 full film entry (FR2A): frame / 30 = film time t; the scene that owns t, the overlay (subtitles, stamps, counter, seal, title) on top */
type Sc = {a: number; b: number; C: React.FC<{t: number}>};
const SCENES: Sc[] = [
	{a: BAR(26), b: BAR(28), C: R2A.Xu}, {a: BAR(28), b: BAR(30), C: R2A.Xie}, {a: BAR(30), b: BAR(32), C: R2A.Yuan}, {a: BAR(32), b: BAR(34), C: R2A.Tun},
];
const All: React.FC = () => { const t = useCurrentFrame() / 30, s = SCENES.find((k) => t >= k.a && t < k.b);
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{s ? <s.C t={t} /> : null}<Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="FR2A" component={All} width={W} height={H} fps={30} durationInFrames={Math.round(FILM_LEN * 30)} />;
registerRoot(Root);
void END_T;

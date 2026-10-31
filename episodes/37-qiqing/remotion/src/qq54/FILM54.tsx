import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay, BAR, DARK, END_T, FILM_LEN} from './demo54core';
import * as M from './demo54m';
import * as N from './demo54n';
import * as R1 from './film54r1';
import * as R2A from './film54r2a';
import * as R2B from './film54r2b';
import * as S from './demo54s';
import * as D from './drop54s';
import * as DV from './dv54a';
import * as R3 from './film54r3';
/* ep54 full film entry (FILM54): frame / 30 = film time t; the scene that owns t, the overlay (subtitles, stamps, counter, seal, title) on top */
type Sc = {a: number; b: number; C: React.FC<{t: number}>};
const SCENES: Sc[] = [
	{a: 0, b: BAR(8), C: M.Open}, {a: BAR(12), b: BAR(14), C: M.Flight}, {a: BAR(16), b: BAR(18), C: M.Line},
	{a: BAR(8), b: BAR(10), C: N.Huangjin}, {a: BAR(10), b: BAR(12), C: N.Dongzhuo}, {a: BAR(14), b: BAR(16), C: N.Lv},
	{a: BAR(18), b: BAR(22), C: R1.Xingyang}, {a: BAR(22), b: BAR(24), C: R1.Hong}, {a: BAR(24), b: BAR(26), C: R1.Haoli},
	{a: BAR(26), b: BAR(28), C: R2A.Xu}, {a: BAR(28), b: BAR(30), C: R2A.Xie}, {a: BAR(30), b: BAR(32), C: R2A.Yuan}, {a: BAR(32), b: BAR(34), C: R2A.Tun},
	{a: BAR(34), b: BAR(36), C: R2B.Lvbu}, {a: BAR(36), b: BAR(38), C: R2B.Rival}, {a: BAR(38), b: BAR(40), C: R2B.Army}, {a: BAR(40), b: BAR(42), C: R2B.Duizhi},
	{a: BAR(42), b: BAR(48), C: S.Guandu}, {a: BAR(48), b: DARK, C: S.Handover},
	{a: DARK, b: BAR(52), C: DV.D1V}, {a: BAR(52), b: BAR(54), C: D.Drop},   /* D1 (dv54a): the sword in the dark from 99.259, fully open on the drop, held to 「一把火」 (owner: skip D2); D3–D4 from drop54s */
	{a: BAR(54), b: BAR(56), C: R3.Jieshi}, {a: BAR(56), b: BAR(58), C: R3.Chibi}, {a: BAR(58), b: BAR(60), C: R3.Wenwang}, {a: BAR(60), b: END_T, C: R3.Death}, {a: END_T, b: FILM_LEN + 1, C: R3.End},
];
const All: React.FC = () => { const t = useCurrentFrame() / 30, s = SCENES.find((k) => t >= k.a && t < k.b);
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>{s ? <s.C t={t} /> : null}<Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="FILM54" component={All} width={W} height={H} fps={30} durationInFrames={Math.round(FILM_LEN * 30)} />;
registerRoot(Root);
void END_T;

import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {KF01, KF02} from './kfA53';
import {KF03, KF04} from './kfB53';
import {KF05} from './kfC53';
import {KF06} from './kfD53';
import {KF07, KF08, KF09} from './kfE53';
import {KF10, KF11, KF12, KF13, KF14} from './kfF53';
/* ep53 越王勾践剑 · gate-2b key frames (B「漆」 night, one take). Lines verbatim from the FINAL timeline lines_bars.json
   (113.633 s) by ID (lines53.ts); stamps from script.md; the hollow J seal in every film frame, the red J stamp on the end card.
   KF53B-ALL renders frame i = KFS[i]; one id per frame as well. The time in each name is the film time the frame shows
   (on the music contract's hit where there is one: MUSIC_NOTES.md). */
export const KFS: [string, React.FC][] = [
	['01_H1_0.0', KF01], ['02_H1_1.6', KF02], ['03_TITLE_9.6', KF03], ['04_S3_18.6', KF04], ['05_D2_29.9', KF05], ['06_D4_37.9', KF06], ['07_D6_43.5', KF07],
	['08_I1_54.8', KF08], ['09_B1_59.5', KF09], ['10_M2_68.4', KF10], ['11_T1_76.9', KF11], ['12_L1_93.5', KF12], ['13_P1_106.9', KF13], ['14_END_110.6', KF14],
];
const one = (C: React.FC): React.FC => () => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)][1]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KF53B-ALL" component={All} width={W} height={H} fps={30} durationInFrames={KFS.length} />
	{KFS.map(([n, C]) => <Composition key={n} id={`KF53B-${n.slice(0, 2)}`} component={one(C)} width={W} height={H} fps={30} durationInFrames={1} />)}
</>;
registerRoot(Root);

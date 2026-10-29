import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {KF01, KF02} from './kfA53';
import {KF03, KF04} from './kfB53';
import {KF05} from './kfC53';
import {KF06} from './kfD53';
import {KF07, KF08, KF09} from './kfE53';
/* ep53 越王勾践剑 · gate-2b key frames (B「漆」 night, one take). Lines verbatim from lines_read.json v2 by ID (lines53.ts);
   stamps from script.md; the hollow J seal in every frame. KF53B-ALL renders frame i = KFS[i]; one id per frame as well.
   Times in the names are PROVISIONAL (the music retime to bars will grow them a little). */
export const KFS: [string, React.FC][] = [
	['01_H1_0.0', KF01], ['02_H1_1.5', KF02], ['03_TITLE_9.2', KF03], ['04_S3_17.4', KF04], ['05_D2_27.6', KF05], ['06_D4_35.2', KF06], ['07_D6_41.6', KF07], ['08_I1_51.0', KF08], ['09_B1_55.6', KF09],
];
const one = (C: React.FC): React.FC => () => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)][1]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KF53B-ALL" component={All} width={W} height={H} fps={30} durationInFrames={KFS.length} />
	{KFS.map(([n, C]) => <Composition key={n} id={`KF53B-${n.slice(0, 2)}`} component={one(C)} width={W} height={H} fps={30} durationInFrames={1} />)}
</>;
registerRoot(Root);

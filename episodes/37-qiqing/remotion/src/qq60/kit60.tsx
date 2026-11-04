import React from 'react';
import {Composition, useCurrentFrame} from 'remotion';
import {FW, FH} from './frame60';
import {Weighing43, Weighing43Motion, LedIn43} from './scene43';

/* ep60 · 4:3 kit compositions (stills: KIT-*; the frame `t` is the still's moment in seconds via the `t` prop). */
const at = (C: React.FC<{t: number}>, t0: number): React.FC => () => { const f = useCurrentFrame(); return <C t={t0 + f / 30} />; };
export const KIT: [string, React.FC<{t: number}>, number][] = [
	['KIT-WEIGH', Weighing43 as React.FC<{t: number}>, 2.6],
	['KIT-LEDIN', LedIn43, 1.2],
];
export const KitCompositions: React.FC = () => <>
	{KIT.map(([id, C, t0]) => <Composition key={id} id={id} component={at(C, t0)} durationInFrames={300} fps={30} width={FW} height={FH} />)}
	<Composition id="KIT-WEIGH-MOTION" component={at(Weighing43Motion, 0)} durationInFrames={150} fps={30} width={FW} height={FH} />
</>;

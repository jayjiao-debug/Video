import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {LookFrame, FrameSpec} from './look54frame';
import * as LB from './look54b';
/* ep54 look tests entry (LOOK54B): frame i = FR[i]; three beats per look (see look54frame.BEATS) */
const LOOKS: [string, Record<string, React.FC>][] = [['B 水墨 · 墨与火', LB]];
const FR: FrameSpec[] = LOOKS.flatMap(([name, m]) => [1, 2, 3].map((k) => ({name, k, C: m[`Look${k}`]})));
const All: React.FC = () => { const f = useCurrentFrame(); return <LookFrame f={FR[Math.min(FR.length - 1, f)]} />; };
const Root: React.FC = () => <Composition id="LOOK54B" component={All} width={W} height={H} fps={30} durationInFrames={FR.length} />;
registerRoot(Root);

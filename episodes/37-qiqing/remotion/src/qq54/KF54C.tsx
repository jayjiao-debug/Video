import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {LookFrame, FrameSpec} from './look54frame';
import * as LC from './look54c';
/* ep54 look tests entry (LOOK54C): frame i = FR[i]; three beats per look (see look54frame.BEATS) */
const LOOKS: [string, Record<string, React.FC>][] = [['C 铜灯影 · 全角色', LC]];
const FR: FrameSpec[] = LOOKS.flatMap(([name, m]) => [1, 2, 3].map((k) => ({name, k, C: m[`Look${k}`]})));
const All: React.FC = () => { const f = useCurrentFrame(); return <LookFrame f={FR[Math.min(FR.length - 1, f)]} />; };
const Root: React.FC = () => <Composition id="LOOK54C" component={All} width={W} height={H} fps={30} durationInFrames={FR.length} />;
registerRoot(Root);

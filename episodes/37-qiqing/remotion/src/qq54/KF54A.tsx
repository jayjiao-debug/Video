import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {LookFrame, FrameSpec} from './look54frame';
import * as LA from './look54a';
/* ep54 look tests entry (LOOK54A): frame i = FR[i]; three beats per look (see look54frame.BEATS) */
const LOOKS: [string, Record<string, React.FC>][] = [['A 皮影戏 · 火光幕', LA]];
const FR: FrameSpec[] = LOOKS.flatMap(([name, m]) => [1, 2, 3].map((k) => ({name, k, C: m[`Look${k}`]})));
const All: React.FC = () => { const f = useCurrentFrame(); return <LookFrame f={FR[Math.min(FR.length - 1, f)]} />; };
const Root: React.FC = () => <Composition id="LOOK54A" component={All} width={W} height={H} fps={30} durationInFrames={FR.length} />;
registerRoot(Root);

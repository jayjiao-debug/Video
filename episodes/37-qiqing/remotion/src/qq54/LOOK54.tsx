import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {LookFrame, FrameSpec} from './look54frame';
import * as LA from './look54a';
import * as LB from './look54b';
import * as LC from './look54c';
/* ep54 look tests entry (LOOK54): frame i = FR[i]; three beats per look (see look54frame.BEATS) */
const LOOKS: [string, Record<string, React.FC>][] = [['A 皮影戏 · 火光幕', LA], ['B 水墨 · 墨与火', LB], ['C 沙盘 · 微缩兵棋', LC]];
const FR: FrameSpec[] = LOOKS.flatMap(([name, m]) => [1, 2, 3].map((k) => ({name, k, C: m[`Look${k}`]})));
const All: React.FC = () => { const f = useCurrentFrame(); return <LookFrame f={FR[Math.min(FR.length - 1, f)]} />; };
const Root: React.FC = () => <Composition id="LOOK54" component={All} width={W} height={H} fps={30} durationInFrames={FR.length} />;
registerRoot(Root);

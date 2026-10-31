import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {DemoFrame, Scene, DEMO_LEN, BAR} from './demo54core';
import * as N from './demo54n';
/* ep54 demo entry (DN54): demo time d = frame/30; part 1 film = d, part 2 film = d − 37.51 + 84.32 */
const ALL: (Scene | null)[] = [
	{a: BAR(8), b: BAR(10), C: N.Huangjin}, {a: BAR(10), b: BAR(12), C: N.Dongzhuo}, {a: BAR(14), b: BAR(16), C: N.Lv},
];
const SCENES = ALL.filter((s): s is Scene => !!s);
const All: React.FC = () => { const f = useCurrentFrame(); return <DemoFrame d={f / 30} scenes={SCENES} />; };
const Root: React.FC = () => <Composition id="DN54" component={All} width={W} height={H} fps={30} durationInFrames={Math.round(DEMO_LEN * 30)} />;
registerRoot(Root);

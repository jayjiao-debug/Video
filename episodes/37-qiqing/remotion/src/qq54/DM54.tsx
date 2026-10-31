import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {DemoFrame, Scene, DEMO_LEN, BAR} from './demo54core';
import * as M from './demo54m';
/* ep54 demo entry (DM54): demo time d = frame/30; part 1 film = d, part 2 film = d − 37.51 + 84.32 */
const ALL: (Scene | null)[] = [
	{a: 0, b: BAR(8), C: M.Open}, {a: BAR(12), b: BAR(14), C: M.Flight}, {a: BAR(16), b: BAR(18), C: M.Line},
];
const SCENES = ALL.filter((s): s is Scene => !!s);
const All: React.FC = () => { const f = useCurrentFrame(); return <DemoFrame d={f / 30} scenes={SCENES} />; };
const Root: React.FC = () => <Composition id="DM54" component={All} width={W} height={H} fps={30} durationInFrames={Math.round(DEMO_LEN * 30)} />;
registerRoot(Root);

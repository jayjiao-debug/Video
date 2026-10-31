import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {DemoFrame, Scene, DEMO_LEN, BAR} from './demo54core';
import * as S from './demo54s';
/* ep54 demo entry (DS54): demo time d = frame/30; part 1 film = d, part 2 film = d − 37.51 + 84.32 */
const ALL: (Scene | null)[] = [
	{a: BAR(42), b: BAR(48), C: S.Guandu}, {a: BAR(48), b: BAR(50), C: S.Handover}, {a: BAR(50), b: BAR(54), C: S.Drop},
];
const SCENES = ALL.filter((s): s is Scene => !!s);
const All: React.FC = () => { const f = useCurrentFrame(); return <DemoFrame d={f / 30} scenes={SCENES} />; };
const Root: React.FC = () => <Composition id="DS54" component={All} width={W} height={H} fps={30} durationInFrames={Math.round(DEMO_LEN * 30)} />;
registerRoot(Root);

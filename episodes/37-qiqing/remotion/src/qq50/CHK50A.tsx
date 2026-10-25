import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from './kit50';
import {FPS50} from './lines50';
import {Overlay, WipeSplit} from './master50';
import {PartA, HANDOFF} from './partA';
/* Builder A's check entry: PartA + the master overlays, with a dark stand-in for PartB behind the hand-off wipe. */
const C: React.FC = () => { const t = useCurrentFrame() / FPS50;
	return <AbsoluteFill style={{background: '#0C0605', overflow: 'hidden'}}>
		<WipeSplit t={t} cross={HANDOFF.t} kind="post" id="ab" x0={HANDOFF.x} oldP={<PartA t={t} />} newP={<AbsoluteFill style={{background: '#1A0D09'}} />} />
		<Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="CHK50A" component={C} width={W} height={H} fps={FPS50} durationInFrames={1680} />;
registerRoot(Root);

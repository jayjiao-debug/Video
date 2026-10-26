import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from './kit50';
import {FILM_END, FPS50} from './lines50';
import {WipeSplit} from './master50';
import {PartA, HANDOFF} from './partA';
import {PartB} from './partB';
/* picture only (no subtitles, stamp, counter, seal, title card) for cover art */
const Pic: React.FC = () => { const t = useCurrentFrame() / FPS50;
	return <AbsoluteFill style={{background: '#0C0605', overflow: 'hidden'}}><WipeSplit t={t} cross={HANDOFF.t} kind="post" id="ab" x0={HANDOFF.x} oldP={<PartA t={t} />} newP={<PartB t={t} />} /></AbsoluteFill>; };
registerRoot(() => <Composition id="COVERPIC50" component={Pic} width={W} height={H} fps={FPS50} durationInFrames={Math.round(FILM_END * FPS50)} />);

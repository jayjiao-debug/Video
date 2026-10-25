import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from './kit50';
import {FILM_END, FPS50} from './lines50';
import {Overlay, WipeSplit} from './master50';
import {PartA, HANDOFF} from './partA';
import {PartB} from './partB';
/* ep50 master: 《钱是怎么从贝壳变成二维码的？》 — 1920×1080, 30 fps, 3810 frames.
   Picture: PartA (Builder A) for t < 54.75, PartB (Builder B) after. The hand-off is a foreground-pillar wipe whose centre
   passes the walker (x = HANDOFF.x) exactly at 54.75: left of the pillar = PartA, right of it = PartB. So PartB is drawn
   (right of the pillar) from ~54.1 and PartA (left of it) until ~55.5; both parts must render outside their nominal
   ranges. On top: subtitles, stamp, counter, J seal and the title card (master50.tsx); all hidden on the end card. */
export const Film50: React.FC<{t: number}> = ({t}) => <AbsoluteFill style={{background: '#0C0605', overflow: 'hidden'}}>
	<WipeSplit t={t} cross={HANDOFF.t} kind="post" id="ab" x0={HANDOFF.x} oldP={<PartA t={t} />} newP={<PartB t={t} />} />
	<Overlay t={t} />
</AbsoluteFill>;
const EP50C: React.FC = () => <Film50 t={useCurrentFrame() / FPS50} />;
const Root: React.FC = () => <Composition id="EP50" component={EP50C} width={W} height={H} fps={FPS50} durationInFrames={Math.round(FILM_END * FPS50)} />;
registerRoot(Root);

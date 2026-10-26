import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {FRAMES51, FPS51} from './lines51';
import {Overlay, WipeSplit} from './master51';
import {PartA, HANDOFF} from './partA';
import {PartB} from './partB';
import {LookCtx} from './palette51';
/* ep51 master: 《古代没有冰箱，夏天怎么吃冰？》 — 1920×1080, 30 fps, 3578 frames (118.75 s + 0.5 s fade).
   Picture: PartA (Builder A) for t < HANDOFF.t, PartB (Builder B) after. The hand-off is a Song timber shopfront passing in the
   foreground; its centre crosses the walker (x = HANDOFF.x) on beat 98 (55.92): left of it = PartA, right = PartB, so both
   parts render a little outside their nominal ranges. On top: subtitles, stamp, counter, J seal and the title card
   (master51.tsx); all hidden from the end card on (B's end card draws its own). */
/** the film's look: 'era' = 「时代色」 (owner's pick, round 3); both parts read it via palette51's LookCtx */
export const FILM_LOOK = 'era' as const;
export const Film51: React.FC<{t: number}> = ({t}) => <LookCtx.Provider value={FILM_LOOK}><AbsoluteFill style={{background: '#0C0605', overflow: 'hidden'}}>
	<WipeSplit t={t} cross={HANDOFF.t} kind="shop" id="ab" x0={HANDOFF.x} gap={140} oldP={<PartA t={t} />} newP={<PartB t={t} />} />
	<Overlay t={t} />
</AbsoluteFill></LookCtx.Provider>;
const EP51C: React.FC = () => <Film51 t={useCurrentFrame() / FPS51} />;
const Root: React.FC = () => <Composition id="EP51" component={EP51C} width={W} height={H} fps={FPS51} durationInFrames={FRAMES51} />;
registerRoot(Root);

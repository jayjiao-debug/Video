import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {LacDefs} from '../qq50/styleB';
import {Overlay53, FPS53, FRAMES53, BUILT_T53} from './master53';
import {TakeA, titleQuad, Ground53} from './take53';
import {TakeB, DIVE_T} from './tomb53';
import {TakeC} from './take53c';
import {TakeD} from './take53d';
import {T1_T} from './handoff53';
/* ep53 越王勾践剑 / 真的没锈吗？ — master composition. 1920×1080, 30 fps, 3409 frames (113.633 s, lines_bars.json).
   ONE continuous camera (一镜到底). Built so far: legs 1–8 up to the end of D2 (0 → 33.274 s, frames 0–998):
   - TakeA (take53): kitchen → bronze glide → rise over the guard → out through the front glass (title) → orbit → axis push;
   - TakeB (tomb53): from the dive on 20.821 — the pommel's 11 rings harden into the stepped mouth of the 1965 shaft, the
     dig in the snow, the descent inside the shaft with the depth marks (KF05).
   TakeC (take53c, legs 8–12, 33.274 → 75.162) and TakeD (take53d, legs 13–18, 75.162 → end) meet on HandoffMacro (handoff53). Overlay53 (master53) sits on top. */
export const Film53: React.FC<{t: number}> = ({t}) => <AbsoluteFill style={{background: '#0F0806', overflow: 'hidden'}}>
	<svg width={0} height={0} style={{position: 'absolute'}}><LacDefs /></svg>
	{t < DIVE_T ? <TakeA t={t} /> : t < BUILT_T53 ? <TakeB t={t} /> : t < T1_T ? <TakeC t={t} /> : <TakeD t={t} />}
	<Overlay53 t={t} quad={titleQuad(t)} />
</AbsoluteFill>;
const EP53C: React.FC = () => <Film53 t={useCurrentFrame() / FPS53} />;
const Root: React.FC = () => <Composition id="EP53" component={EP53C} width={W} height={H} fps={FPS53} durationInFrames={FRAMES53} />;
registerRoot(Root);

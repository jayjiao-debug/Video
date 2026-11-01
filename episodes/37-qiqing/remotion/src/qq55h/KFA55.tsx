import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {FRAMES, EXTRA, MaskCtx} from './kfall55h';
/* ep55 · 何尊 — all the key frames.
   KFA55: frames 0–30 = the HOME key frame of card i (1, 2, T, 3–16, the stop, 17–28, END); frames 31+ = the second frame of
   the cells that hold two (T heating up, and the push-in ends of 2, 6, 7, 16, 20, 21), in card order.
   KFM55: frames 0–30 = the same HOME frames with only the 尊 drawn, flat magenta (the HOME box check); frame 31 = T heating up. */
const N = FRAMES.length;
const All: React.FC = () => { const f = useCurrentFrame(); if (f < N) { const {F} = FRAMES[f]; return <F />; } const e = EXTRA[Math.min(EXTRA.length - 1, f - N)]; const E = e.E!; return <E />; };
const Mask: React.FC = () => { const f = useCurrentFrame(), F = f < N ? FRAMES[f].F : FRAMES[2].E!; return <MaskCtx.Provider value={true}><F /></MaskCtx.Provider>; };
const Root: React.FC = () => <>
	<Composition id="KFA55" component={All} width={1920} height={1080} fps={30} durationInFrames={N + EXTRA.length} />
	<Composition id="KFM55" component={Mask} width={1920} height={1080} fps={30} durationInFrames={N + 1} />
</>;
registerRoot(Root);

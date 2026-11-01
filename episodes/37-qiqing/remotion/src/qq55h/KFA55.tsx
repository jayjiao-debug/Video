import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {FRAMES} from './kfall55h';
/* ep55 · 何尊 — all the key frames: KFA55, frame i = card i (1, 2, T, 3–16, the stop, 17–28, Q) */
const All: React.FC = () => { const f = useCurrentFrame(), {F} = FRAMES[Math.min(FRAMES.length - 1, f)]; return <F />; };
const Root: React.FC = () => <Composition id="KFA55" component={All} width={1920} height={1080} fps={30} durationInFrames={FRAMES.length} />;
registerRoot(Root);

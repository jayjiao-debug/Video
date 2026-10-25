import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, FPS} from './kit50';
import {HookA, SongA, MorphA} from './styleA';
import {HookB, SongB, MorphB} from './styleB';
import {HookC, SongC, MorphC} from './styleC';
/* ep50 style round: each composition = 0–4 s the hook (frame 1 at 2.0 s) · 4–8 s the Song street (frame 2 at 6.0 s)
   · 8–12 s the 4-second motion test (钅 → spade → 布币). */
type Part = React.FC<{t: number}>;
const make = (Hook: Part, Song: Part, Morph: Part): React.FC => () => {
	const t = useCurrentFrame() / FPS;
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
		{t < 4 ? <Hook t={t} /> : t < 8 ? <Song t={t - 4} /> : <Morph t={t - 8} />}
	</AbsoluteFill>;
};
const SA = make(HookA, SongA, MorphA), SB = make(HookB, SongB, MorphB), SC = make(HookC, SongC, MorphC);
const Root: React.FC = () => <>
	<Composition id="STYLE50-A" component={SA} width={W} height={H} fps={FPS} durationInFrames={12 * FPS} />
	<Composition id="STYLE50-B" component={SB} width={W} height={H} fps={FPS} durationInFrames={12 * FPS} />
	<Composition id="STYLE50-C" component={SC} width={W} height={H} fps={FPS} durationInFrames={12 * FPS} />
</>;
registerRoot(Root);

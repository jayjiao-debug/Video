import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {SealHollow} from '../qq51/master51';
import {Overlay, TITLE_A, TITLE_B} from './demo54core';
import {Open} from './demo54m';
import {Huangjin} from './demo54n';
import {TitleOpt as TA} from './ttl54a';
import {TitleOpt as TC} from './ttl54c';
/* ep54 · title options A (改良版) and C (书法竖排): preview entry (frame / 30 = film time).
   Before the slam: the 洛阳 gate with card 3's overlay; the title window: the option + the channel seal; from bar 8: card 5 (黄巾). */
const mk = (T: React.FC<{t: number}>): React.FC => () => { const t = useCurrentFrame() / 30;
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
		{t < TITLE_A ? <><Open t={t} /><Overlay t={t} /></> : t < TITLE_B ? <><T t={t} /><SealHollow /></> : <><Huangjin t={t} /><Overlay t={t} /></>}
	</AbsoluteFill>; };
const A = mk(TA), C = mk(TC);
const N = Math.round(17.2 * 30);
const Root: React.FC = () => <>
	<Composition id="TTX54A" component={A} width={W} height={H} fps={30} durationInFrames={N} />
	<Composition id="TTX54C" component={C} width={W} height={H} fps={30} durationInFrames={N} />
</>;
registerRoot(Root);

import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay, BAR} from './demo54core';
import {SealHollow} from '../qq51/master51';
import * as M from './demo54m';
import * as N from './demo54n';
import * as B from './ttl54b';
import * as D from './ttl54d';
/* ep54 · title options B 「光暗双面」 and D 「白脸」: previews. Stills: frame i = film time TS[i] (12.75 the slam, 13.4, 15.2);
   clips: frame f = film time 12.4 + f/30 (the 洛阳 gate before the slam, the title 12.606 → 16.590, then card 5's 黄巾 field) */
const TS = [12.75, 13.4, 15.2];
const TA = BAR(6), TB = BAR(8), C0 = 12.4, CN = Math.round(4.2 * 30);
type Opt = React.FC<{t: number}>;
const Frame: React.FC<{t: number; O: Opt}> = ({t, O}) => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
	{t < TA ? <><M.Open t={t} /><Overlay t={t} /></> : t < TB ? <><O t={t} /><SealHollow /></> : <><N.Huangjin t={t} /><Overlay t={t} /></>}
</AbsoluteFill>;
const mkStill = (O: Opt): React.FC => () => { const f = useCurrentFrame(); return <Frame t={TS[Math.min(TS.length - 1, f)]} O={O} />; };
const mkClip = (O: Opt): React.FC => () => <Frame t={C0 + useCurrentFrame() / 30} O={O} />;
const BS = mkStill(B.TitleOpt), BC = mkClip(B.TitleOpt), DS = mkStill(D.TitleOpt), DC = mkClip(D.TitleOpt);
const Root: React.FC = () => <>
	<Composition id="TTB54S" component={BS} width={W} height={H} fps={30} durationInFrames={TS.length} />
	<Composition id="TTB54C" component={BC} width={W} height={H} fps={30} durationInFrames={CN} />
	<Composition id="TTD54S" component={DS} width={W} height={H} fps={30} durationInFrames={TS.length} />
	<Composition id="TTD54C" component={DC} width={W} height={H} fps={30} durationInFrames={CN} />
</>;
registerRoot(Root);

import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, staticFile} from 'remotion';
import {W, H} from '../qq50/kit50';
import {D1V} from './dv54a';
/* ep54 · DEBUG ONLY (never in the film): onion-skin of D1 at 101.60 over the owner's target (public/ep54_tmp, gitignored).
   DVT54 = the target under our frame at 50%; DVT54B = our frame alone (no overlay, no label). */
const Onion: React.FC = () => <AbsoluteFill style={{background: '#000'}}>
	<D1V t={101.6} />
	<Img src={staticFile('ep54_tmp/d1_target2_film.png')} style={{position: 'absolute', inset: 0, width: W, height: H, opacity: 0.5}} />
</AbsoluteFill>;
const Plain: React.FC = () => <AbsoluteFill style={{background: '#000'}}><D1V t={101.6} /></AbsoluteFill>;
const Root: React.FC = () => <>
	<Composition id="DVT54" component={Onion} width={W} height={H} fps={30} durationInFrames={1} />
	<Composition id="DVT54B" component={Plain} width={W} height={H} fps={30} durationInFrames={1} />
</>;
registerRoot(Root);

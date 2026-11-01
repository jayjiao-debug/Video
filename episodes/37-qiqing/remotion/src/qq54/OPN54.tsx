import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {Overlay, BAR} from './demo54core';
import {OpenNew as Open} from './op54open';
/* ep54 · preview entry for the rebuilt opening (OPN54): FILM54's frames 0 → BAR(8) with only Open under the overlay
   (subtitles, stamp, counter, seal). From BAR(6) the title (ttl54a, redesigned separately) is left out: Open runs on under the seal. */
const All: React.FC = () => { const t = useCurrentFrame() / 30;
	return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><Open t={t} /><Overlay t={t} /></AbsoluteFill>; };
const Root: React.FC = () => <Composition id="OPN54" component={All} width={W} height={H} fps={30} durationInFrames={Math.round(BAR(8) * 30)} />;
registerRoot(Root);

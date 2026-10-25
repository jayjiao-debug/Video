import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Audio, staticFile} from 'remotion';
import {Film46, DUR} from './film46';
import {CapCtx} from './skin46';
/* ep46 film entry. FILM46 = the whole film (picture only; music is muxed after the render). KF46 = key frames:
   frame i shows the film at KF_T[i] seconds. */
export const KF_T = [0.4, 3.6, 7.9, 9.9, 12.4, 14.4, 17.2, 19.9, 29.5, 34.9, 39.6, 47.5, 52.8, 57.5, 61.0, 63.8, 68.2, 72.3, 75.6, 79.8, 82.4, 86.0, 89.0, 92.0, 97.5, 100.5, 104.0, 107.9, 110.8, 113.5, 116.0, 120.5, 125.5, 129.0, 135.5, 139.2, 143.5, 152.5];
const FilmC: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill style={{background: '#1A140E'}}><Film46 t={f / 30} /></AbsoluteFill>; };
const KFC: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill style={{background: '#1A140E'}}><Film46 t={KF_T[Math.min(KF_T.length - 1, f)]} /></AbsoluteFill>; };
/** caption-layout test: CAPT[i] seconds; frame i*4+v shows layout ['', 'A', 'B', 'C'][v] */
export const CAPT = [85.5, 20.0, 8.2];
const CapC: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill style={{background: '#1A140E'}}><CapCtx.Provider value={['', 'A', 'B', 'C'][f % 4]}><Film46 t={CAPT[Math.floor(f / 4)]} /></CapCtx.Provider></AbsoluteFill>; };
void Audio; void staticFile;
registerRoot(() => <>
	<Composition id="FILM46" component={FilmC} durationInFrames={Math.round(DUR * 30)} fps={30} width={1920} height={1080} />
	<Composition id="KF46" component={KFC} durationInFrames={KF_T.length} fps={1} width={1920} height={1080} />
	<Composition id="CAP46" component={CapC} durationInFrames={CAPT.length * 4} fps={1} width={1920} height={1080} />
</>);

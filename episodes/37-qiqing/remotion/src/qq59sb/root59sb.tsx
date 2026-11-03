import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame, Audio, staticFile} from 'remotion';
import {SB, KF, T0, T1, Part2, P2_FRAMES} from './SB59';
import {ROWS} from './rows59';
import {W, H, FPS, D} from './kit59';
/* entry for the storyboard checks: SB59 (first-pass storyboard 21–95), KF59 (its key frames), SB59P2 (the final part 2, bars 50–95).
   inputProps {music: 'ep59/song.wav'} plays the track from bar 50 if it is dropped into public/ (never commit it). */
const P2: React.FC<{music?: string}> = ({music}) => { const f = useCurrentFrame();
	return <AbsoluteFill style={{background: '#08090b'}}><Part2 t={f / FPS} />{music && <Audio src={staticFile(music)} startFrom={Math.round(D(50) * FPS)} />}</AbsoluteFill>; };
registerRoot(() => <>
	<Composition id="SB59" component={SB} durationInFrames={Math.round((T1 - T0) * FPS)} fps={FPS} width={W} height={H} />
	<Composition id="KF59" component={KF} durationInFrames={ROWS.length} fps={FPS} width={W} height={H} />
	<Composition id="SB59P2" component={P2} durationInFrames={P2_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
</>);

import React from 'react';
import {Composition, registerRoot, useCurrentFrame, getInputProps} from 'remotion';
import {W, H, FPS, CAM0, Cam, camPath, addCam, drift, DBG} from './kit3';
Object.assign(DBG, getInputProps());
import {Jungle} from './sets3a';
import {Ice, Siberia} from './sets3b';
import {Gobi, Caspian} from './sets3c';

/* ep59 v3 · test entry for the hero sets. Stills: one frame per set (camera at rest + a slow drift); a 6 s parallax camera test.
   npx remotion still src/qq59v3/sets3test.tsx SetJungle out.png --frame=30 */
type SetC = React.FC<{t: number; cam: Cam}>;
const still = (S: SetC, at = 1): React.FC => () => { const f = useCurrentFrame(), t = at + f / FPS; return <S t={t} cam={addCam(CAM0, drift(t, 0.6))} />; };

/** the camera test: truck right, push in (dolly) and crane down a touch over 6 s, with a slight roll settle */
const JungleMove: React.FC = () => { const f = useCurrentFrame(), t = f / FPS;
	const cam = camPath(t, [[0, {x: -140, y: -30, z: -0.35, roll: -0.5}], [6, {x: 120, y: 20, z: 0.75, roll: 0.2}]]);
	return <Jungle t={t + 2} cam={addCam(cam, drift(t, 0.5))} walk />; };

const SETS: [string, SetC][] = [['SetJungle', Jungle], ['SetIce', Ice], ['SetSiberia', Siberia], ['SetGobi', Gobi], ['SetCaspian', Caspian]];
registerRoot(() => <>
	{SETS.map(([id, S]) => <Composition key={id} id={id} component={still(S)} durationInFrames={90} fps={FPS} width={W} height={H} />)}
	<Composition id="Empty" component={() => <div style={{width: W, height: H, background: '#123'}} />} durationInFrames={30} fps={FPS} width={W} height={H} />
	<Composition id="MoveJungle" component={JungleMove} durationInFrames={6 * FPS} fps={FPS} width={W} height={H} />
</>);

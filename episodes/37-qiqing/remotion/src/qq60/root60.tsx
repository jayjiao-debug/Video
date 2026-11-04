import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Weighing, STILL, stateAt, LedIn} from './scene60';
import {RigSheet} from './sheet60';
import {W, H} from './wall60';
import {KitCompositions} from './kit60';

/* ep60 entry: LOOKA (the weighing key frame), LOOKA2 (Anubis leads the deceased in), RIG60 (rig sheet), MOTIONA (5 s motion test).
   Render: TMPDIR=/dev/shm/eg60 npx remotion still src/qq60/root60.tsx LOOKA out.png --browser-executable=… */
const LookA: React.FC = () => <Weighing st={STILL} t={2.6} />;
const LookA2: React.FC = () => <LedIn t={1.2} />;
const MotionA: React.FC = () => { const f = useCurrentFrame(), t = f / 30; return <Weighing st={stateAt(t)} prev={stateAt(t - 1 / 30)} t={t} />; };
registerRoot(() => <>
	<Composition id="LOOKA" component={LookA} durationInFrames={1} fps={30} width={W} height={H} />
	<Composition id="LOOKA2" component={LookA2} durationInFrames={1} fps={30} width={W} height={H} />
	<Composition id="RIG60" component={RigSheet} durationInFrames={1} fps={30} width={W} height={H} />
	<Composition id="MOTIONA" component={MotionA} durationInFrames={150} fps={30} width={W} height={H} />
	<KitCompositions />
</>);

import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {KFS} from './kf55h';
import {TurnView, TT_VIEWS} from './tt55h';
/* ep55 · 何尊 key frames entry: KFH55 (frame i = KF(i+1)) and the model turntable TTH55 (frame i = view i) */
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)]; return <C />; };
const TT: React.FC = () => <TurnView v={Math.min(TT_VIEWS.length - 1, useCurrentFrame())} />;
const Root: React.FC = () => <>
	<Composition id="KFH55" component={All} width={1920} height={1080} fps={30} durationInFrames={KFS.length} />
	<Composition id="TTH55" component={TT} width={1920} height={1080} fps={30} durationInFrames={TT_VIEWS.length} />
</>;
registerRoot(Root);

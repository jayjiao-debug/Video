import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {FPS51} from './lines51';
import {Overlay} from './master51';
import {PartA} from './partA';
import {LookCtx, LookId} from './palette51';
/* Builder A's colour style frames (round 3): PartA + the overlay in each look; ids LOOK51A-cur / -warm / -era, 0–57 s. */
const mk = (look: LookId): React.FC => () => { const t = useCurrentFrame() / FPS51;
	return <LookCtx.Provider value={look}><AbsoluteFill style={{background: '#0C0605', overflow: 'hidden'}}><PartA t={t} /><Overlay t={t} /></AbsoluteFill></LookCtx.Provider>; };
const Root: React.FC = () => <>{(['cur', 'warm', 'era'] as LookId[]).map((l) => <Composition key={l} id={`LOOK51A-${l}`} component={mk(l)} width={W} height={H} fps={FPS51} durationInFrames={57 * 30} />)}</>;
registerRoot(Root);

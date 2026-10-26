import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H} from '../qq50/kit50';
import {FPS51} from './lines51';
import {Overlay} from './master51';
import {PartA} from './partA';
import {LookCtx} from './palette51';
/* Builder A's check entry: PartA + the overlay only (id CHK51A, 0–57 s), so A's half renders without PartB. */
const C: React.FC = () => { const t = useCurrentFrame() / FPS51; return <LookCtx.Provider value="era"><AbsoluteFill style={{background: '#0C0605', overflow: 'hidden'}}><PartA t={t} /><Overlay t={t} /></AbsoluteFill></LookCtx.Provider>; };
registerRoot(() => <Composition id="CHK51A" component={C} width={W} height={H} fps={FPS51} durationInFrames={57 * 30} />);

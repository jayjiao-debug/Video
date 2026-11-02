import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {Act1} from './act551';
import {DepthDebug, Look55, Trans55, Title55} from './act551c';
/* ep55 v2 · act 1 (cards 1, 2, T, A–F, film 0 → 42.2 s): frame f renders film time t = f / 30.
   ACT1D: the city's depth-sorted objects tinted by sort rank (QA). PV105 / PV128 / PV6: the 3A transition previews with the
   current gold title; TT1 / TT2 / TT3: the title designs (cut128 timing). */
const F: React.FC = () => <Act1 t={useCurrentFrame() / 30} />;
const FD: React.FC = () => <DepthDebug.Provider value={true}><Act1 t={useCurrentFrame() / 30} /></DepthDebug.Provider>;
const pin = (trans: Trans55, title: Title55): React.FC => () => <Look55.Provider value={{trans, title}}><Act1 t={useCurrentFrame() / 30} /></Look55.Provider>;
const V: [string, Trans55, Title55][] = [['PV105', 'cut105', 'cur'], ['PV128', 'cut128', 'cur'], ['PV6', 'v6', 'cur'], ['TT1', 'cut128', 'T1'], ['TT2', 'cut128', 'T2'], ['TT3', 'cut128', 'T3']];
const PV = V.map(([id, tr, ti]) => ({id, C: pin(tr, ti)}));
const Root: React.FC = () => <>
	<Composition id="ACT1" component={F} width={1920} height={1080} fps={30} durationInFrames={5450} />
	<Composition id="ACT1D" component={FD} width={1920} height={1080} fps={30} durationInFrames={5450} />
	{PV.map(({id, C}) => <Composition key={id} id={id} component={C} width={1920} height={1080} fps={30} durationInFrames={5450} />)}
</>;
registerRoot(Root);

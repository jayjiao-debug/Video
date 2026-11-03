/* ep59 v3 · ACT 2 — the Bering Strait crossing (March 2006), the arrest, the long forced stops, and the walk back on the drop.
   Scenes (story3 ids): ice, bear, tent, lead, drift, freeze, strait, arrest, stops, resume. Each draws picture only (+ its prints);
   the master draws subtitles / stamp / counter / seal. Hits land on multiples of `beat` from the scene start. */
import React from 'react';
import type {SceneDef, SceneProps} from './EP59V3';
import {Print3, PH3} from './photo3';
import {IceShot, BearShot} from './act2_ice';
import {TentShot, LeadShot} from './act2_sea';
import {FreezeShot} from './act2_freeze';
import {DriftShot, StraitShot} from './act2_map';
import {ArrestShot, StopsShot, ResumeShot} from './act2_land';

const Ice: React.FC<SceneProps> = ({t, dur, beat}) => {
	const p0 = 4 * beat;
	return <>
		<IceShot t={t} dur={dur} beat={beat} />
		<Print3 {...PH3.beringIce} t={t - p0} dur={Math.max(1.5, dur - p0 - 0.55)} cx={1190} cy={330} w={380} rot={3} from="right" caption="2006 · 白令海峡" />
	</>;
};
const Bear: React.FC<SceneProps> = ({t, dur, beat}) => <BearShot t={t} dur={dur} beat={beat} />;

const Tent: React.FC<SceneProps> = ({t, dur, beat}) => <TentShot t={t} dur={dur} beat={beat} />;
const Lead: React.FC<SceneProps> = ({t, dur, beat}) => {
	const p0 = 3 * beat;
	return <>
		<LeadShot t={t} dur={dur} beat={beat} />
		<Print3 {...PH3.beringDusk} t={t - p0} dur={Math.max(1.5, dur - p0 - 0.5)} cx={1330} cy={300} w={400} rot={-3} from="right" caption="2006 · 白令海峡" />
	</>;
};
const Drift: React.FC<SceneProps> = ({t, dur, beat}) => <DriftShot t={t} dur={dur} beat={beat} />;
const Freeze: React.FC<SceneProps> = ({t, dur, beat}) => <FreezeShot t={t} dur={dur} beat={beat} />;
const Strait: React.FC<SceneProps> = ({t, dur, beat}) => <StraitShot t={t} dur={dur} beat={beat} />;
const Arrest: React.FC<SceneProps> = ({t, dur, beat}) => <ArrestShot t={t} dur={dur} beat={beat} />;
const Stops: React.FC<SceneProps> = ({t, dur, beat}) => <StopsShot t={t} dur={dur} beat={beat} />;
const Resume: React.FC<SceneProps> = ({t, dur, beat}) => <ResumeShot t={t} dur={dur} beat={beat} />;

export const ACT2: Record<string, SceneDef> = {
	ice: {C: Ice},
	bear: {C: Bear},
	tent: {C: Tent},
	lead: {C: Lead},
	drift: {C: Drift},
	freeze: {C: Freeze},
	strait: {C: Strait, tin: 'own', ov: 0.43},
	arrest: {C: Arrest},
	stops: {C: Stops},
	resume: {C: Resume},
};

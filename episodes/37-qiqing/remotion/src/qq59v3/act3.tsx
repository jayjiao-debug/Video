/* ep59 v3 act 3 scenes (see story3.ts SCENES and EP59V3.tsx for the contract). */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneDef, SceneProps} from './EP59V3';
import {Stage} from './kit3';
import {SwimShot, NightBoat, DAWN_CASPIAN} from './act3_sea';

const Caspian: React.FC<SceneProps> = ({t, dur, beat}) => {
	const cut = 4 * beat;
	if (t < cut) return <Stage t={t} atm={{grain: 0.05, vignette: 0.5}} bg="#1a2139">
		<SwimShot id="csw" t={t + 0.6} dur={cut + 0.6} mode="swim" h={900} look={DAWN_CASPIAN} sx={[820, 900]} HZ={430} camH={0.3} boat={{dX: -9, Z: 60}} />
	</Stage>;
	const u = t - cut;
	return <Stage t={t} atm={{grain: 0.05, vignette: 0.5}} bg="#1a2139">
		<SwimShot id="cfl" t={u + 2} dur={dur - cut + 1} mode="float" h={620} look={DAWN_CASPIAN} sx={[700, 740]} HZ={400} camH={0.42} boat={{dX: 5.5, Z: 26, refl: 0.4}} />
	</Stage>;
};
const Boat: React.FC<SceneProps> = ({t, dur}) => <Stage t={t} atm={{grain: 0.07, vignette: 0.6}} bg="#05070d"><NightBoat t={t + 1} dur={dur} id="nb" /></Stage>;

export const ACT3: Record<string, SceneDef> = {
	caspian: {C: Caspian},
	boat: {C: Boat},
};
void AbsoluteFill;

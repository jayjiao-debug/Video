/* ep61 · the shot clock shared by the 22 scenes of shots61.tsx.
   In the film (EP61.tsx) each scene is wrapped in <ShotCtx.Provider value={{t, dur, l2, live: true}}>; on the storyboard boards there
   is no provider, so `live` is false and every animated value sits at its key-frame (peak) state. */
import React from 'react';

export type ShotState = {t: number; dur: number; l2: number; live: boolean};
export const ShotCtx = React.createContext<ShotState>({t: 0, dur: 1, l2: 0, live: false});
const cl = (v: number) => Math.max(0, Math.min(1, v));
const sm = (v: number) => v * v * (3 - 2 * v);

export const useShot = () => {
	const s = React.useContext(ShotCtx);
	/** 0 → 1 from time a over d seconds (eased); 1 on the boards */
	const up = (a: number, d = 0.5) => s.live ? sm(cl((s.t - a) / d)) : 1;
	/** 1 → 0 from time a over d seconds */
	const down = (a: number, d = 0.5) => s.live ? 1 - sm(cl((s.t - a) / d)) : 0;
	/** a short pulse (0 → 1 → 0) centred on a */
	const hit = (a: number, d = 0.35) => s.live ? Math.max(0, 1 - Math.abs(s.t - a) / d) : 0;
	/** an envelope: rises from a over `rise`, holds `hold`, falls over `fall` (1 on the boards: the key frame is the peak) */
	const env = (a: number, rise: number, hold: number, fall: number) => s.live ? sm(cl((s.t - a) / rise)) * (1 - sm(cl((s.t - a - rise - hold) / fall))) : 1;
	/** time for ambient motion (flames, water, sway) */
	const T = s.live ? s.t : 1.7;
	return {...s, up, down, hit, env, T, L2: s.l2};
};

/* ep60 act file (c): shots 34–55 (98.33–169.25 s on the v6 reading clock), the twist, the two endings, the Field of Reeds and the close.
   The pictures live in act60c_twist (34+35, 36, 37+38, 39+40), act60c_hall (41–44, 54, 55), act60c_osiris (45+46), act60c_reeds (47, 48, 49+50, 51–53);
   shared pieces in act60c_common. Transitions and sound events: episodes/60-xinzang/sync60_c.md. */
import React from 'react';
import type {ShotDef, ShotProps} from './EP60';
import {TWIST} from './act60c_twist';
import {HALL} from './act60c_hall';
import {OSIRIS} from './act60c_osiris';
import {REEDS} from './act60c_reeds';

const C = {...TWIST, ...HALL, ...OSIRIS, ...REEDS};
/* v6 (owner 21:54): 35, 38, 40, 46, 50 are merged into their hosts 34, 37, 39, 45, 49 (one picture across two lines, see the act files).
   The other shots changed length a little on the reading clock: each is played on its own design clock stretched to the new length
   (t' = t × old / new), so the action spreads over the shot instead of ending in a hold. */
const TIN: Record<number, Pick<ShotDef, 'tin' | 'ov'>> = {
	34: {tin: 'dissolve', ov: 0.35}, 36: {tin: 'dissolve', ov: 0.3}, 37: {tin: 'dissolve', ov: 0.4}, 39: {tin: 'dissolve', ov: 0.4},
	41: {tin: 'cut'}, 42: {tin: 'cut'}, 43: {tin: 'cut'}, 44: {tin: 'dissolve', ov: 0.4}, 45: {tin: 'dissolve', ov: 0.4}, 47: {tin: 'dissolve', ov: 0.5}, 48: {tin: 'cut'},
	49: {tin: 'cut'}, 51: {tin: 'cut'}, 52: {tin: 'dissolve', ov: 0.4}, 53: {tin: 'dissolve', ov: 0.4}, 54: {tin: 'dissolve', ov: 0.4}, 55: {tin: 'cut'},
};
/** the length each of these shots was designed for (v5 clock) */
export const DESIGN_DUR: Record<number, number> = {36: 2.6, 42: 2.7, 43: 3.2, 47: 3.6, 48: 2.8, 51: 3.8, 53: 2.9, 54: 2.9};
const stretch = (Comp: React.FC<ShotProps>, d0: number): React.FC<ShotProps> => ({t, dur, n}) => React.createElement(Comp, {t: t * d0 / dur, dur: d0, n});
export const ACT60C: Record<number, ShotDef> = Object.fromEntries(Object.entries(C).map(([n, Comp]) => { const k = Number(n), d0 = DESIGN_DUR[k];
	return [k, {C: d0 ? stretch(Comp, d0) : Comp, ...TIN[k]}]; }));

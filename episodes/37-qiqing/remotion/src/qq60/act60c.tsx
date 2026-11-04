/* ep60 act file (c): shots 34–55 (94.4–160.6 s), the twist, the two endings, the Field of Reeds and the close.
   The pictures live in act60c_twist (34–40), act60c_hall (41–44, 54, 55), act60c_osiris (45–46), act60c_reeds (47–53);
   shared pieces in act60c_common. Transitions and sound events: episodes/60-xinzang/sync60_c.md. */
import type {ShotDef} from './EP60';
import {TWIST} from './act60c_twist';
import {HALL} from './act60c_hall';
import {OSIRIS} from './act60c_osiris';
import {REEDS} from './act60c_reeds';

const C = {...TWIST, ...HALL, ...OSIRIS, ...REEDS};
const TIN: Record<number, Pick<ShotDef, 'tin' | 'ov'>> = {
	34: {tin: 'dissolve', ov: 0.35}, 35: {tin: 'cut'}, 36: {tin: 'dissolve', ov: 0.3}, 37: {tin: 'dissolve', ov: 0.4}, 38: {tin: 'cut'},
	39: {tin: 'dissolve', ov: 0.4}, 40: {tin: 'cut'}, 41: {tin: 'cut'}, 42: {tin: 'cut'}, 43: {tin: 'cut'}, 44: {tin: 'dissolve', ov: 0.4},
	45: {tin: 'dissolve', ov: 0.4}, 46: {tin: 'cut'}, 47: {tin: 'dissolve', ov: 0.5}, 48: {tin: 'cut'}, 49: {tin: 'cut'}, 50: {tin: 'cut'},
	51: {tin: 'cut'}, 52: {tin: 'dissolve', ov: 0.4}, 53: {tin: 'dissolve', ov: 0.4}, 54: {tin: 'dissolve', ov: 0.4}, 55: {tin: 'cut'},
};
export const ACT60C: Record<number, ShotDef> = Object.fromEntries(Object.entries(C).map(([n, Comp]) => [Number(n), {C: Comp, ...TIN[Number(n)]}]));

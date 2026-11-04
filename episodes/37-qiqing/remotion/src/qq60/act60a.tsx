/* ep60 act file (a): shots 1–14 (0.0–40.8 s), registered by number (see episodes/60-xinzang/build60.md, sync table sync60_a.md).
   v2 (owner 15:10): the title card (shot 4) is gone; the title is lit into shot 3's lintel and carried into shot 5.
   hook 1–3: act60a_hook · life 5–9: act60a_life · the book 10–14: act60a_book · shared helpers: act60a_kit. */
import type {ShotDef} from './EP60';
import {Shot1, Shot2, Shot3} from './act60a_hook';
import {Shot5, Shot6, Shot7, Shot8, Shot9} from './act60a_life';
import {Shot10, Shot11, Shot12, Shot13, Shot14} from './act60a_book';
export const ACT60A: Record<number, ShotDef> = {
	1: {C: Shot1},
	2: {C: Shot2, tin: 'own', ov: 0.35},
	3: {C: Shot3},
	5: {C: Shot5, tin: 'dissolve', ov: 0.6},
	6: {C: Shot6, tin: 'dissolve', ov: 0.4},
	7: {C: Shot7},
	8: {C: Shot8, tin: 'dissolve', ov: 0.4},
	9: {C: Shot9, tin: 'dissolve', ov: 0.3},
	10: {C: Shot10, tin: 'dissolve', ov: 0.4},
	11: {C: Shot11},
	12: {C: Shot12, tin: 'dissolve', ov: 0.4},
	13: {C: Shot13},
	14: {C: Shot14, tin: 'dissolve', ov: 0.4},
};

/* ep60 act file (b): shots 15–33 (40.8–94.4 s), registered by number. Pieces live in act60b_duat (15–17), act60b_hall (18–26),
   act60b_weigh (27–33), helpers in act60b_kit. Transitions and every sound event: episodes/60-xinzang/sync60_b.md. */
import type {ShotDef} from './EP60';
import {Shot15, Shot16, Shot17} from './act60b_duat';
import {Shot27, Shot28, Shot29, Shot30, Shot31, Shot32, Shot33} from './act60b_weigh';
import {Shot18, Shot19, Shot20, Shot21, Shot22, Shot23, Shot24, Shot25, Shot26} from './act60b_hall';
export const ACT60B: Record<number, ShotDef> = {
	15: {C: Shot15, tin: 'dissolve', ov: 0.4},
	16: {C: Shot16, tin: 'dissolve', ov: 0.3},
	17: {C: Shot17},
	18: {C: Shot18, tin: 'dissolve', ov: 0.4},
	19: {C: Shot19},
	20: {C: Shot20},
	21: {C: Shot21},
	22: {C: Shot22},
	23: {C: Shot23},
	24: {C: Shot24},
	25: {C: Shot25},
	26: {C: Shot26},
	27: {C: Shot27, tin: 'dissolve', ov: 0.4},
	28: {C: Shot28},
	29: {C: Shot29},
	30: {C: Shot30, tin: 'dissolve', ov: 0.3},
	31: {C: Shot31},
	32: {C: Shot32},
	33: {C: Shot33},
};

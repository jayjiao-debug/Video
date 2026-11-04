/* ep60 act file (b): shots 15–33, registered by number. v6 (owner 21:54): the clock is retimed for reading and six pairs are merged into
   one picture (18 = 18+19, 21 = 21+22, 23 = 23+24, 25 = 25+26, 27 = 27+28, 30 = 30+31; the absorbed numbers are gone). The v6 shots
   live in act60b_v6 (merged pictures and the single-line shots spread over their new length), built on act60b_duat / _hall / _weigh
   and the helpers in act60b_kit. Transitions and every sound event: episodes/60-xinzang/sync60_b.md. */
import type {ShotDef} from './EP60';
import {Shot15v6, Shot16v6, Shot17v6, Shot18v6, Shot20v6, Shot21v6, Shot23v6, Shot25v6, Shot27v6, Shot29v6, Shot30v6, Shot32v6, Shot33v6} from './act60b_v6';
export const ACT60B: Record<number, ShotDef> = {
	15: {C: Shot15v6, tin: 'dissolve', ov: 0.4},
	16: {C: Shot16v6, tin: 'dissolve', ov: 0.3},
	17: {C: Shot17v6},
	18: {C: Shot18v6, tin: 'dissolve', ov: 0.4},
	20: {C: Shot20v6},
	21: {C: Shot21v6},
	23: {C: Shot23v6},
	25: {C: Shot25v6},
	27: {C: Shot27v6, tin: 'dissolve', ov: 0.4},
	29: {C: Shot29v6},
	30: {C: Shot30v6, tin: 'dissolve', ov: 0.3},
	32: {C: Shot32v6},
	33: {C: Shot33v6},
};

/* ep59 v3 act 1 scenes (see story3.ts SCENES and EP59V3.tsx for the contract): print, door, title, patagonia, rules, plain,
   darien, jungle, journal, jail, bowl, alaska. The scenes live in act1_a…act1_d.tsx; shared helpers in act1_kit.tsx; the test entry act1test.tsx. */
import type {SceneDef} from './EP59V3';
import {ACT1A} from './act1_a';
import {ACT1B} from './act1_b';
import {ACT1C} from './act1_c';
import {ACT1D} from './act1_d';
export const ACT1: Record<string, SceneDef> = {...ACT1A, ...ACT1B, ...ACT1C, ...ACT1D};

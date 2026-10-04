import type {SceneMap} from '../../src/lib/types';
import {act1} from './act1';
import {act2} from './act2';

/** 《越难越爱》: nine scenes on the 9-beat formula. Act one in act1.tsx, act two in act2.tsx. */
export const scenes: SceneMap = {...act1, ...act2};

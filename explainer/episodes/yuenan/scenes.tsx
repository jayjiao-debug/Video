import type {SceneMap} from '../../src/lib/types';
import {act1} from './act1';
import {act2} from './act2';
import {story1} from './story1';
import {story2} from './story2';
import {story3} from './story3';
import {story4} from './story4';

/**
 * 《越难越爱》: nine scenes on the 9-beat formula. v3 (the illustrated look) replaces
 * the v2 scenes one by one: story*.tsx override act1/act2.
 */
export const scenes: SceneMap = {...act1, ...act2, ...story1, ...story2, ...story3, ...story4};

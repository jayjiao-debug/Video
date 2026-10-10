/* The running order. Scenes sit 14 m apart along x; each file defines one SceneDef (see ../scene.ts). */
import type { SceneDef } from '../scene';
import { S01 } from './S01_hook';
import { S02 } from './S02_title';
import { S03 } from './S03_workshop';
import { S04 } from './S04_design';
import { S05 } from './S05_queue';
import { S06 } from './S06_waiting';
import { S07 } from './S07_wine';
import { S08 } from './S08_after';
import { S09 } from './S09_unsold';
import { S10 } from './S10_fakes';
import { S11 } from './S11_logo';
import { S12 } from './S12_reveal';
import { S13 } from './S13_lineup';
import { S14 } from './S14_questions';
import { S15 } from './S15_endcard';

export const SCENES: SceneDef[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15];

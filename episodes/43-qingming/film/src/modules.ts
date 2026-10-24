// Scene modules: each registers its scenes at import and exports a boot function. (Pre-wired; fill in your s_<group>.ts.)
import {bootTeaser} from './s_teaser';
import {bootSong} from './s_song';
import {bootYuan} from './s_yuan';
import {bootMing} from './s_ming';
import {bootQing} from './s_qing';
import {bootXbl} from './s_xbl';
import {bootPeak} from './s_peak';
import {bootResto} from './s_resto';
import {bootEnd} from './s_end';
export const BOOTS: Record<string, () => Promise<void>> = {teaser: bootTeaser, song: bootSong, yuan: bootYuan, ming: bootMing, qing: bootQing, xbl: bootXbl, peak: bootPeak, resto: bootResto, end: bootEnd};

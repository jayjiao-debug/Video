/* ep60 act file (a): shots 1–14 (0.0–41.64 s on the v6 clock), registered by number (see episodes/60-xinzang/build60.md, sync table sync60_a.md).
   v6 (owner 21:54): shots 7, 11, 13 are merged into 6, 10, 12 (one picture across two lines); 5, 8, 9, 14 are spread over their longer times.
   v2 (owner 15:10): the title card (shot 4) is gone. v3 (owner 15:40): the title lives in shot 3 only, as the crown of the gateway.
   Note: [film-second] brackets in older shot comments of act60a_life / act60a_book are on earlier clocks; sync60_a.md has the v6 times.
   hook 1–3: act60a_hook · life 5–9: act60a_life · the book 10–14: act60a_book · shared helpers: act60a_kit. */
import React from 'react';
import type {ShotDef, ShotProps} from './EP60';
import {Shot1, Shot2, Shot3} from './act60a_hook';
import {Shot5, Shot6, Shot8, Shot9} from './act60a_life';
import {Shot10, Shot12, Shot14} from './act60a_book';
/** v6: a shot built for `base` seconds, played over its new (longer) duration: its whole action spread evenly (no frozen hold at the end) */
const stretch = (C: React.FC<ShotProps>, base: number): React.FC<ShotProps> => { const S: React.FC<ShotProps> = ({t, dur, n}) => <C t={t * base / dur} dur={base} n={n} />; return S; };
const Shot5s = stretch(Shot5, 2.9), Shot8s = stretch(Shot8, 3.2), Shot9s = stretch(Shot9, 2.9), Shot14s = stretch(Shot14, 2.9);
export const ACT60A: Record<number, ShotDef> = {
	1: {C: Shot1},
	2: {C: Shot2, tin: 'own', ov: 0.35},
	3: {C: Shot3},
	5: {C: Shot5s, tin: 'dissolve', ov: 0.3},
	6: {C: Shot6, tin: 'dissolve', ov: 0.4},   // 6 + 7 merged
	8: {C: Shot8s, tin: 'dissolve', ov: 0.4},
	9: {C: Shot9s, tin: 'dissolve', ov: 0.3},
	10: {C: Shot10, tin: 'dissolve', ov: 0.4},  // 10 + 11 merged
	12: {C: Shot12, tin: 'dissolve', ov: 0.4},  // 12 + 13 merged
	14: {C: Shot14s, tin: 'dissolve', ov: 0.4},
};

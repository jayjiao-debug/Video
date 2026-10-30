import React from 'react';
import {Chamber53} from './scene53c';
import {Paper53, P1} from './paper53c';
import {Leg12} from './macro53c';
import {HandoffMacro, HUSH_STILL} from './handoff53';
import {seg} from '../qq50/kit50';
import {sstep} from './cam53';
/* ep53 · TakeC = legs 8–12 of the one take, 33.274 → 75.162 s (D2 tail … M3 + the hush).
   33.274 → 56.482  scene53c.Chamber53 : the descent's tail, the opened chamber, the lids, the sword, the wash, the draw, the inscription
   56.482 → 61.577  paper53c.Paper53   : the paper test (the same blade look, the same camera, takes over on 56.482: one move, no dissolve)
   61.577 → 75.162  macro53c.Leg12     : the macro push, the section cut, the hush, HandoffMacro held from 74.412 */
export const TakeC: React.FC<{t: number}> = ({t}) => {
	if (t >= HUSH_STILL[0]) return <HandoffMacro />;
	if (t >= P1) return <Leg12 t={t} />;
	/* producer r3: Chamber53 and Paper53 draw the same blade from almost the same camera; a 0.4 s blend replaces the one-frame flick at 56.482 */
	if (t >= 56.282 && t < 56.682) { const w = sstep(seg(t, 56.282, 56.682)); return <><Chamber53 t={t} /><div style={{position: 'absolute', inset: 0, opacity: w}}><Paper53 t={t} /></div></>; }
	if (t >= 56.482) return <Paper53 t={t} />;
	return <Chamber53 t={t} />;
};

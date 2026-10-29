import React from 'react';
import {Chamber53} from './scene53c';
import {Paper53, P0, P1} from './paper53c';
import {Leg12} from './macro53c';
import {HandoffMacro, HUSH_STILL} from './handoff53';
import {seg} from '../qq50/kit50';
/* ep53 · TakeC = legs 8–12 of the one take, 33.274 → 75.162 s (D2 tail … M3 + the hush).
   33.274 → 56.482  scene53c.Chamber53 : the descent's tail, the opened chamber, the lids, the sword, the wash, the draw, the inscription
   56.15 → 61.577   paper53c.Paper53   : the paper test (the same blade, in the same place, takes over under 0.33 s: a match, not a cut)
   61.577 → 75.162  macro53c.Leg12     : the macro push, the section cut, the hush, HandoffMacro held from 74.412 */
const Fade: React.FC<{o: number; children: React.ReactNode}> = ({o, children}) => <div style={{position: 'absolute', inset: 0, opacity: o}}>{children}</div>;
export const TakeC: React.FC<{t: number}> = ({t}) => {
	if (t >= HUSH_STILL[0]) return <HandoffMacro />;
	if (t >= P1) return <Leg12 t={t} />;
	if (t >= P1 - 0.33) return <><Paper53 t={t} /><Fade o={seg(t, P1 - 0.33, P1)}><Leg12 t={P1} /></Fade></>;
	if (t >= 56.482) return <Paper53 t={t} />;
	if (t >= P0) return <><Chamber53 t={t} /><Fade o={seg(t, P0, 56.482)}><Paper53 t={t} /></Fade></>;
	return <Chamber53 t={t} />;
};

import React from 'react';
import {W, H} from '../qq50/kit50';
import {Ground53} from './take53';
import {HandoffMacro, HUSH_STILL} from './handoff53';
/* ep53 · TakeC = legs 8–12 of the one take, 33.274 → 75.162 s (D2 tail … M3 + the hush). STUB until built:
   a dark hold, then the hand-off picture held through the hush. The builder replaces the body; it must continue from
   tombCam(33.274) in tomb53.tsx and end on HandoffMacro held still over HUSH_STILL. */
export const TakeC: React.FC<{t: number}> = ({t}) => t >= HUSH_STILL[0] ? <HandoffMacro /> : <svg width={W} height={H} style={{position: 'absolute'}}><Ground53 id="holdC" k={0.3} /></svg>;

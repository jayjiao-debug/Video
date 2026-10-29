import React from 'react';
import {W, H} from '../qq50/kit50';
import {Ground53} from './take53';
import {HandoffMacro, Blooms11} from './handoff53';
/* ep53 · TakeD = legs 13–18 of the one take, 75.162 → 113.633 s (T1 … P1, the air, the end card). STUB until built:
   the T1 picture (hand-off macro + blooms), then a dark hold. The builder replaces the body; it must START from exactly
   HandoffMacro at 75.162 and own the end card (EndCard53 in kfF53.tsx, from 109.125). */
export const TakeD: React.FC<{t: number}> = ({t}) => t < 81.954 ? <HandoffMacro blooms={<Blooms11 />} veil={1} /> : <svg width={W} height={H} style={{position: 'absolute'}}><Ground53 id="holdD" k={0.3} /></svg>;

import React from 'react';
import {W, H} from '../qq50/kit50';
import {LacDefs, Lacquer, Vignette} from '../qq50/styleB';
import {BladeMacro} from './macro53';
import {SP11, Blooms11} from './kfF53';
/* ep53 · the hand-off between the two halves of the one take (TakeC = legs 8–12, TakeD = legs 13–18).
   At the hush the camera comes to rest on KF11's macro of the blade. TakeC must END on exactly this picture, held still
   from HUSH_STILL[0] to T1_T (the music's near-silence; nothing moves). TakeD STARTS from exactly this picture at T1_T and
   adds the blooms on the drop (Blooms11: three tiny olive blooms + find-rings, KF11), then moves on.
   Both halves call HandoffMacro so the cut-free hand-off is pixel-identical. */
export const T1_T = 75.162;
export const HUSH_STILL: [number, number] = [74.412, 75.162];
export const HandoffMacro: React.FC<{blooms?: React.ReactNode; veil?: number}> = ({blooms, veil = 0}) => <svg width={W} height={H} style={{position: 'absolute'}}>
	<LacDefs /><Lacquer sheen={0.06} id="ho" />
	<BladeMacro sp={SP11} id="ho">{blooms}</BladeMacro>
	{veil > 0 && <rect x={0} y={340} width={W} height={H - 340} fill="#4A4234" opacity={0.07 * veil} />}
	<Vignette id="ho" a={0.66} />
</svg>;
export {Blooms11};

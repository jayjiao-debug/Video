import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 demo · part 2 scenes by the set builder (stubs): Guandu = cards 22–24 (film 84.32–96.27), Handover = card 25 (96.27–100.26),
   Drop = cards 26–27 (100.26–108.22, a placeholder for the owner's AI video). t = film time (s). */
const Stub: React.FC<{c: string}> = ({c}) => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill={c} /></svg>;
export const Guandu: React.FC<{t: number}> = () => <Stub c="#1f2326" />;
export const Handover: React.FC<{t: number}> = () => <Stub c="#1a1e22" />;
export const Drop: React.FC<{t: number}> = () => <Stub c="#3a2a1a" />;

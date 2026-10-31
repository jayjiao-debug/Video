import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 demo · scenes by the rig builder (stubs): Open = cards 1–3 + the title underlay (film 0–16.59), Flight = card 7 (24.56–28.54),
   Line = card 9 (32.53–36.51). t = film time (s). */
const Stub: React.FC<{c: string}> = ({c}) => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill={c} /></svg>;
export const Open: React.FC<{t: number}> = () => <Stub c="#1d1d24" />;
export const Flight: React.FC<{t: number}> = () => <Stub c="#24242d" />;
export const Line: React.FC<{t: number}> = () => <Stub c="#2b2b33" />;

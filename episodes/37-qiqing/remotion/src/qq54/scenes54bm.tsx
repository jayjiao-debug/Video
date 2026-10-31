import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 look B · key scenes owned by the rig/motion builder (stubs until built): K1 the hook, K7 the flight (also the motion test) */
export const K1: React.FC = () => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#222" /></svg>;
export const K7: React.FC<{t?: number}> = () => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#2a2a2a" /></svg>;

import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 demo · new scenes (stubs): Huangjin = card 5 (film 16.59–20.57), Dongzhuo = card 6 (20.57–24.56), Lv = card 8 (28.54–32.53). t = film time (s). */
const Stub: React.FC<{c: string}> = ({c}) => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill={c} /></svg>;
export const Huangjin: React.FC<{t: number}> = () => <Stub c="#2a2420" />;
export const Dongzhuo: React.FC<{t: number}> = () => <Stub c="#30261f" />;
export const Lv: React.FC<{t: number}> = () => <Stub c="#26201c" />;

import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 full film · section B (drums out), cards 10–13: Xingyang = 荥阳 defeat (cards 10–11, BAR 18–22), Hong = 曹洪让马 (BAR 22–24), Haoli = 蒿里行 (BAR 24–26). t = film time (s). Stubs until built. */
const Stub: React.FC<{c: string; s: string}> = ({c, s}) => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill={c} /><text x={960} y={560} fill="#777" fontSize={40} textAnchor="middle">{s}</text></svg>;
export const Xingyang: React.FC<{t: number}> = () => <Stub c="#202024" s="Xingyang" />;
export const Hong: React.FC<{t: number}> = () => <Stub c="#242326" s="Hong" />;
export const Haoli: React.FC<{t: number}> = () => <Stub c="#282628" s="Haoli" />;

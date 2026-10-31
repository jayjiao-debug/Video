import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 full film · section C part 2, cards 18–21: Lvbu = 下邳 白门楼 (BAR 34–36), Rival = 袁绍 (BAR 36–38), Army = 十余万 (BAR 38–40), Duizhi = 官渡对峙 (BAR 40–42). t = film time (s). Stubs until built. */
const Stub: React.FC<{c: string; s: string}> = ({c, s}) => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill={c} /><text x={960} y={560} fill="#777" fontSize={40} textAnchor="middle">{s}</text></svg>;
export const Lvbu: React.FC<{t: number}> = () => <Stub c="#202024" s="Lvbu" />;
export const Rival: React.FC<{t: number}> = () => <Stub c="#242326" s="Rival" />;
export const Army: React.FC<{t: number}> = () => <Stub c="#282628" s="Army" />;
export const Duizhi: React.FC<{t: number}> = () => <Stub c="#322930" s="Duizhi" />;

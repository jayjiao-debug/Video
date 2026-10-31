import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 full film · section C part 1, cards 14–17: Xu = 许都 (BAR 26–28), Xie = 挟天子 (BAR 28–30), Yuan = 袁绍没听 (BAR 30–32), Tun = 屯田 (BAR 32–34). t = film time (s). Stubs until built. */
const Stub: React.FC<{c: string; s: string}> = ({c, s}) => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill={c} /><text x={960} y={560} fill="#777" fontSize={40} textAnchor="middle">{s}</text></svg>;
export const Xu: React.FC<{t: number}> = () => <Stub c="#202024" s="Xu" />;
export const Xie: React.FC<{t: number}> = () => <Stub c="#242326" s="Xie" />;
export const Yuan: React.FC<{t: number}> = () => <Stub c="#282628" s="Yuan" />;
export const Tun: React.FC<{t: number}> = () => <Stub c="#322930" s="Tun" />;

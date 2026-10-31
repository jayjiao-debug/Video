import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 full film · section E after the drop, cards 28–31 + the end card: Jieshi = 碣石 (BAR 54–56), Chibi = 赤壁 (BAR 56–58), Wenwang = 周文王 (BAR 58–60), Death = 洛阳 220 (BAR 60–62), End = the end card (END_T → FILM_LEN). t = film time (s). Stubs until built. */
const Stub: React.FC<{c: string; s: string}> = ({c, s}) => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill={c} /><text x={960} y={560} fill="#777" fontSize={40} textAnchor="middle">{s}</text></svg>;
export const Jieshi: React.FC<{t: number}> = () => <Stub c="#202024" s="Jieshi" />;
export const Chibi: React.FC<{t: number}> = () => <Stub c="#242326" s="Chibi" />;
export const Wenwang: React.FC<{t: number}> = () => <Stub c="#282628" s="Wenwang" />;
export const Death: React.FC<{t: number}> = () => <Stub c="#322930" s="Death" />;
export const End: React.FC<{t: number}> = () => <Stub c="#363232" s="End" />;

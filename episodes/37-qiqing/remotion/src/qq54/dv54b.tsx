import React from 'react';
import {W, H} from '../qq50/kit50';
/* ep54 · D1 design variant B (owner: "冲出屏幕的感觉，镜头在剑前面看后面" — the camera in front of the sword looking back at him;
   the current 曹操 is "太弱了"). D1V = the whole D1 shot for film 100.256–102.248 (t = film time). Stub until built. */
export const D1V: React.FC<{t: number}> = () => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#2a1408" /></svg>;

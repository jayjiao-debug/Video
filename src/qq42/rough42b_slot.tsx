import React from 'react';
/* Builder A's slot for Builder B's part: re-exports RoughB from rough42b.tsx once it exists; until then a placeholder. */
import {W, H, SANS} from './kit42';
export const RoughB: React.FC<{t: number}> = ({t}) => <g><rect width={W} height={H} fill="#141018" /><text x={W / 2} y={H / 2} textAnchor="middle" style={{fontFamily: SANS, fontSize: 40}} fill="#888">RoughB {t.toFixed(1)}</text></g>;

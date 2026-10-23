import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H, cl} from './v3base';
import {MORSE3} from './s41morse';
import {SCOTT3} from './s41scott';
import {SHANG3} from './s41shang';
import {DU3} from './s41du';
import {MARCONI3} from './s41marconi';
import {ARPA3} from './s41arpa';
import {BJ3} from './s41bj';
import {BELL3} from './s41bell';
import {Y1977} from './s41y1977';
import {OUTRO3} from './s41outro';
/* scene registry for the v3 cut (index = order in the film). v3 scenes return SVG groups; svg() wraps them. */
type SC = React.FC<{tau: number; t: number}>;
const svg = (C: SC): SC => (p) => <AbsoluteFill><svg width={W} height={H}><C {...p} /></svg></AbsoluteFill>;
export const SCENES3: SC[] = [svg(SHANG3), svg(DU3), svg(MORSE3), svg(SCOTT3), svg(BELL3), svg(MARCONI3), svg(ARPA3), svg(BJ3), svg(Y1977), svg(OUTRO3)];
/** letterbox amount at film time t (the big moments): Bell's reunion, the Beijing climax, all of 1977 */
const LB: [number, number][] = [[104.0, 110.2], [153.85, 172.9]];
export const LETTERBOX3 = (t: number) => Math.max(0, ...LB.map(([a, b]) => cl((t - a) / 0.6) * cl((b - t) / 0.6)));

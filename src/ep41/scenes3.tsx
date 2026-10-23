import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H, cl} from './v3base';
import {SHANG, DU, MORSE, SCOTT, MARCONI, ARPA, BJ} from './ep41scenes';
import {BELL3} from './s41bell';
import {Y1977} from './s41y1977';
import {OUTRO3} from './s41outro';
/* scene registry for the v3 cut (index = order in the film). v3 scenes return SVG groups; svg() wraps them.
   Entries still pointing at ep41scenes are v2 placeholders until the animators' scenes land. */
type SC = React.FC<{tau: number; t: number}>;
const svg = (C: SC): SC => (p) => <AbsoluteFill><svg width={W} height={H}><C {...p} /></svg></AbsoluteFill>;
export const SCENES3: SC[] = [SHANG, DU, MORSE, SCOTT, svg(BELL3), MARCONI, ARPA, BJ, svg(Y1977), svg(OUTRO3)];
/** letterbox amount at film time t (the big moments): Bell's reunion, the Beijing climax, all of 1977 */
const LB: [number, number][] = [[104.0, 110.2], [154.0, 172.9]];
export const LETTERBOX3 = (t: number) => Math.max(0, ...LB.map(([a, b]) => cl((t - a) / 0.6) * cl((b - t) / 0.6)));

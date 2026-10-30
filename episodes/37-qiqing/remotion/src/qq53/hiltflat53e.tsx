import React from 'react';
import {A, R_GRIP, R_HOOP, HOOPS, HOOP_HL, LOOK} from './swordspec53s';
/* ep53 · the grip and its two hoops for the FLAT (face-on) sword (flat53s.SwordFlat: the chamber, the draw, the paper test).
   v3.1 design C: a smooth round grip of near-black greenish bronze (no binding survives), two LOW thin rings (箍) a third and two
   thirds along — each a band a hair proud of the grip with a lit edge line and a dark one. Light from the +w side (as the blade). */
type M2 = (a: number, w: number) => [number, number];
const H = LOOK.hilt;
export const GripFlat53E: React.FC<{M: M2; kmm: number; id: string}> = ({M, kmm, id}) => {
	const P = (a: number, w: number) => { const q = M(a, w); return `${q[0].toFixed(1)},${q[1].toFixed(1)}`; };
	const rect = (a0: number, a1: number, w0: number, w1: number) => `M${P(a0, w0)}L${P(a1, w0)}L${P(a1, w1)}L${P(a0, w1)}Z`;
	const c0 = M(40, R_GRIP + 0.4), c1 = M(40, -R_GRIP - 0.4), sw = (v: number) => Math.max(0.5, v * kmm);
	return <g>
		<defs>
			<linearGradient id={`cy${id}`} gradientUnits="userSpaceOnUse" x1={c0[0]} y1={c0[1]} x2={c1[0]} y2={c1[1]}><stop offset="0" stopColor={H.deep} /><stop offset="0.16" stopColor={H.body} /><stop offset="0.3" stopColor={H.lit} /><stop offset="0.36" stopColor={H.spec} /><stop offset="0.44" stopColor={H.lit} /><stop offset="0.7" stopColor={H.body} /><stop offset="1" stopColor={H.deep} /></linearGradient>
		</defs>
		<path d={rect(A.grip0, A.grip1, -R_GRIP, R_GRIP)} fill={`url(#cy${id})`} />
		<path d={`M${P(A.grip0, R_GRIP)}L${P(A.grip1, R_GRIP)}`} stroke={H.spec} strokeOpacity={0.5 * LOOK.rim} strokeWidth={Math.max(1, 0.35 * kmm)} />
		{HOOPS.map((h) => <g key={h}>
			<path d={rect(h - HOOP_HL, h + HOOP_HL, -R_HOOP, R_HOOP)} fill={`url(#cy${id})`} />
			<path d={`M${P(h - HOOP_HL, R_HOOP)}L${P(h - HOOP_HL, -R_HOOP)}M${P(h + HOOP_HL, R_HOOP)}L${P(h + HOOP_HL, -R_HOOP)}`} stroke={H.deep} strokeWidth={sw(0.35)} strokeOpacity={0.9} />
			<path d={`M${P(h, R_HOOP - 0.3)}L${P(h, -R_HOOP + 0.3)}`} stroke={H.spec} strokeWidth={sw(0.25)} strokeOpacity={0.35} /></g>)}
	</g>; };

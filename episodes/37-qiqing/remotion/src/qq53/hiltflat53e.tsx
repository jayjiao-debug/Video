import React from 'react';
import {A, R_GRIP, R_HOOP, HOOPS, HOOP_HL, METAL} from './swordspec53s';
/* ep53 · fix-e: the grip and its two hoops for the FLAT (face-on) sword, the same layered build as sword3d.Hilt3D, for
   flat53s.SwordFlat (the coffin draw, the paper test). flat53s is not part of this fix; to use it there, replace its grip path and
   the HOOPS.map(...) line with  <GripFlat53E M={M} kmm={kmm} id={id} />  (M = its mm → screen map, kmm = px per mm).
   Light from the −w side (as flat53s' cylinder gradient). Each hoop: a band a little wider than the grip, a lit top edge, a shaded
   side, a dark lower edge, a lit and a dark end line, and a thin shadow on the grip beside it; the grip: a low-contrast wrapped cord. */
type M2 = (a: number, w: number) => [number, number];
export const GripFlat53E: React.FC<{M: M2; kmm: number; id: string}> = ({M, kmm, id}) => {
	const P = (a: number, w: number) => { const q = M(a, w); return `${q[0].toFixed(1)},${q[1].toFixed(1)}`; };
	const rect = (a0: number, a1: number, w0: number, w1: number) => `M${P(a0, w0)}L${P(a1, w0)}L${P(a1, w1)}L${P(a0, w1)}Z`;
	const g0 = M(40, -R_HOOP), g1 = M(40, R_HOOP), sw = (v: number) => Math.max(0.6, v * kmm);
	/* the cord: one groove per 2.4 mm, a shallow S across the grip (the turn seen face-on), only when it reads */
	const cord: string[] = []; const segs: [number, number][] = [[A.grip0 + 0.5, HOOPS[0] - HOOP_HL], [HOOPS[0] + HOOP_HL, HOOPS[1] - HOOP_HL], [HOOPS[1] + HOOP_HL, A.grip1]];
	if (kmm * 2.4 >= 3.2) for (const [a0, a1] of segs) for (let a = a0 + 0.6; a < a1 - 0.8; a += 2.4)
		cord.push('M' + Array.from({length: 9}, (_, i) => { const w = -R_GRIP + 2 * R_GRIP * i / 8; return P(Math.min(a1 - 0.3, a + 1.2 * (Math.asin(w / R_GRIP) / Math.PI + 0.5)), w * 0.98); }).join('L'));
	return <g>
		<defs>
			<linearGradient id={`gfg${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}><stop offset="0" stopColor={METAL.dark} /><stop offset="0.3" stopColor={METAL.lit} /><stop offset="0.55" stopColor={METAL.mid} /><stop offset="1" stopColor={METAL.deep} /></linearGradient>
			<linearGradient id={`gfh${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}><stop offset="0" stopColor={METAL.mid} /><stop offset="0.12" stopColor={METAL.hi} /><stop offset="0.35" stopColor={METAL.lit} /><stop offset="0.7" stopColor={METAL.mid} /><stop offset="0.9" stopColor={METAL.dark} /><stop offset="1" stopColor={METAL.deep} /></linearGradient>
		</defs>
		<path d={rect(A.grip0 - 0.5, A.grip1 + 1, -R_GRIP, R_GRIP)} fill={`url(#gfg${id})`} />
		{cord.length > 0 && <path d={cord.join(' ')} stroke={METAL.deep} strokeOpacity={0.22} strokeWidth={sw(0.34)} fill="none" strokeLinecap="round" />}
		{HOOPS.map((a) => <g key={a}>
			<path d={rect(a + HOOP_HL, a + HOOP_HL + 1.3, -R_GRIP, R_GRIP)} fill={METAL.line} opacity={0.35} />
			<path d={rect(a - HOOP_HL, a + HOOP_HL, -R_HOOP, R_HOOP)} fill={`url(#gfh${id})`} />
			<path d={rect(a - HOOP_HL, a + HOOP_HL, R_HOOP - 1.1, R_HOOP)} fill={METAL.deep} opacity={0.6} />
			<path d={`M${P(a - HOOP_HL + 0.25, -R_HOOP + 0.4)}L${P(a - HOOP_HL + 0.25, R_HOOP - 0.6)}`} stroke={METAL.hi} strokeOpacity={0.7} strokeWidth={sw(0.35)} />
			<path d={`M${P(a + HOOP_HL - 0.2, -R_HOOP + 0.4)}L${P(a + HOOP_HL - 0.2, R_HOOP - 0.4)}`} stroke={METAL.line} strokeOpacity={0.55} strokeWidth={sw(0.4)} />
			<path d={rect(a - HOOP_HL, a + HOOP_HL, -R_HOOP, R_HOOP)} fill="none" stroke={METAL.line} strokeOpacity={0.5} strokeWidth={sw(0.3)} />
		</g>)}
	</g>; };

import React from 'react';
import {cl} from '../qq50/kit50';
import {A, LBLADE, hwS, edgeS} from './swordspec53s';
import type {Map2} from './blade53c';
/* ep53 v3.4 · the blade's cutting edge catching the light, through any blade map S (cm: a from the pommel, w across; the same map
   BladeFlat / SwordFlat draw with). Two parts, both on the edge band (锷) of side `sg` (the spec's edgeS strip) and its outer line:
   · rest: a soft resting sheen along the whole edge (0..1)
   · run:  a thin bright glint at u (0 = the guard, 1 = the tip) along the edge, `k` its strength (0..1); a short travelling highlight
           (gaussian along the blade, σ ≈ `sig` mm), drawn as ONE gradient per path (no stack of faint layers: 8-bit safe). */
const N = 72;
export const EdgeGlint53: React.FC<{S: Map2; id: string; sg?: 1 | -1; rest?: number; k?: number; u?: number; sig?: number; lw?: number}> = ({S, id, sg = -1, rest = 0, k = 0, u = 0, sig = 42, lw = 1}) => {
	if (rest < 0.004 && k < 0.004) return null;
	const a0 = A.blade0, s1 = LBLADE - 2, ss = Array.from({length: N + 1}, (_, i) => s1 * Math.pow(i / N, 0.9));
	const M = (s: number, w: number) => S((a0 + s) / 10, w / 10);
	const P = (q: [number, number]) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`;
	const outer = ss.map((s) => M(s, sg * hwS(s))), inner = ss.map((s) => M(s, sg * Math.max(0, hwS(s) - edgeS(s))));
	const line = 'M' + outer.map(P).join('L'), band = 'M' + [...outer, ...inner.slice().reverse()].map(P).join('L') + 'Z';
	/* px per mm along the blade, for line widths that scale with the view */
	const pm = (() => { const p = M(120, 0), q = M(130, 0); return Math.hypot(p[0] - q[0], p[1] - q[1]) / 10; })();
	const wCore = Math.max(1.4, Math.min(4, 0.9 * pm)) * lw, wGlow = Math.max(6, Math.min(26, 5 * pm)) * lw;
	/* the run: a gradient along the blade's screen line, centred on the glint's place */
	const sc = cl(u, -0.2, 1.2) * s1, g0 = M(sc - 3 * sig, 0), g1 = M(sc + 3 * sig, 0);
	const stops = [0, 0.18, 0.33, 0.42, 0.5, 0.58, 0.67, 0.82, 1].map((o) => { const x = (o - 0.5) * 6; return [o, Math.exp(-x * x / 2)] as [number, number]; });
	const grad = (gid: string, col: string, a: number) => <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}>
		{stops.map(([o, v], i) => <stop key={i} offset={o} stopColor={col} stopOpacity={a * v} />)}</linearGradient>;
	const run = k > 0.004 && u > -0.2 && u < 1.2;
	return <g>
		<defs>
			<filter id={`eg${id}f`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={Math.max(1.5, wGlow * 0.35)} /></filter>
			<filter id={`eg${id}h`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={Math.max(4, wGlow * 0.9)} /></filter>
			{run && grad(`eg${id}b`, '#FFFAEA', 0.95)}
			{run && grad(`eg${id}c`, '#FFFFFF', 1)}
			{run && grad(`eg${id}g`, '#FFE6AE', 1)}
		</defs>
		{rest > 0.004 && <g opacity={rest}>
			<path d={band} fill="#FFF2CE" opacity={0.16} />
			<path d={line} fill="none" stroke="#FFF0C8" strokeOpacity={0.5} strokeWidth={wCore * 0.8} strokeLinejoin="round" strokeLinecap="round" />
		</g>}
		{run && <g opacity={k}>
			<path d={line} fill="none" stroke={`url(#eg${id}g)`} strokeWidth={wGlow * 2.4} strokeOpacity={0.45} strokeLinecap="round" filter={`url(#eg${id}h)`} />
			<path d={line} fill="none" stroke={`url(#eg${id}g)`} strokeWidth={wGlow} strokeLinecap="round" filter={`url(#eg${id}f)`} />
			<path d={band} fill={`url(#eg${id}b)`} />
			<path d={line} fill="none" stroke={`url(#eg${id}c)`} strokeWidth={wCore} strokeLinecap="round" strokeLinejoin="round" />
		</g>}
	</g>; };

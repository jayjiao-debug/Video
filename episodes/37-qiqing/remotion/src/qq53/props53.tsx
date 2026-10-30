import React from 'react';
import {rnd} from '../qq50/kit50';
import {hwS, LOOK} from './swordspec53s';
import {SwordFlat} from './flat53s';
import {PommelFace, R_FACE} from './face53';
/* ep53 越王勾践剑 · style frames (B「漆」 night). Shared props: the sword (drawn from the verified specs in
   episodes/53-goujian/facts.md, B1–B6, C1), the kitchen knife, the ring disc of the pommel.
   The sword's bronze-gold and the blue glass of its guard are the only saturated colours in the film.

   The sword's geometry, lattice, guard, hoops, pommel and inscription are swordspec53s (the ONE spec every renderer reads);
   Sword below draws it face-on through flat53s.SwordFlat. SW / LB / bladeHW keep the cm interface the scenes use. */

/** v3.1 design C: the HILT bronze (near-black greenish: LOOK.hilt) — the scenes' stand-in hilts (chamber53b3 / scene53c HiltLite,
    the other swords of world53d) take it, so no gold hilt is left; lit stays the gold of a highlight line */
export const BZ = {hi: LOOK.hilt.spec, lit: '#E8C474', body: LOOK.hilt.body, mid: '#2C302A', dark: '#141713', deep: LOOK.hilt.deep, line: '#050605'};
export const LAT = '#22140A';                      // the dark of the lattice
export const PALE = '#FFF0CC';                     // the tin-rich (whitish) diamonds
/** blue glass (design C: small cells on a dark guard). body is the guard block's fill in the stand-in hilts (HiltLite), so it is the
    dark guard bronze now — the glass is never one big blue panel */
export const GLS = {hi: LOOK.glass.hi, lit: '#6AA8F0', body: '#262A24', deep: LOOK.glass.deep};
export const TQS = {lit: '#86D8C8', body: '#3FA89A', deep: '#1E6A62'};                  // turquoise (back face)

export const SW = {L: 55.6, pomA: 0.8, gripA: 8.2, guardA: 10.2, bladeA: 9.7};   // cm (swordspec53s.A in mm)
export const LB = SW.L - SW.bladeA;
/** blade half-width (cm) at s cm from the blade base: the one outline of swordspec53s */
export const bladeHW = (s: number) => hwS(s * 10) / 10;

const f1 = (v: number) => v.toFixed(1);

/** an abstract bird-script mark (NOT a character): a curled head, a body stroke, a tail hook, a dot. Local units ≈ 1 = mark height. */
export const birdMark = (cx: number, cy: number, s: number, seed: number) => { const r = (k: number) => rnd(seed * 17 + k, 9);
	const h = s, w = s * 0.5, m = r(1) > 0.5 ? 1 : -1, X = (u: number) => f1(cx + m * u * w), Y = (v: number) => f1(cy + v * h);
	const head = `M${X(-0.05)},${Y(-0.36)} q${f1(m * w * 0.3)},${f1(-h * 0.16)} ${f1(m * w * 0.42)},${f1(-h * 0.02)} l${f1(m * w * 0.22)},${f1(h * 0.02)}`;
	const spine = `M${X(-0.02)},${Y(-0.36)} C${X(-0.5)},${Y(-0.12)} ${X(0.4 + 0.2 * r(2))},${Y(0.1)} ${X(-0.05)},${Y(0.46)}`;
	const wing = `M${X(-0.08)},${Y(-0.04 + 0.08 * r(3))} q${f1(-m * w * 0.5)},${f1(h * 0.02)} ${f1(-m * w * 0.6)},${f1(h * 0.18)} M${X(0.06)},${Y(0.12)} q${f1(m * w * 0.36)},${f1(-h * 0.04)} ${f1(m * w * 0.5)},${f1(h * 0.14)}`;
	const foot = `M${X(-0.05)},${Y(0.46)} q${f1(m * w * 0.36)},${f1(h * 0.06)} ${f1(m * w * 0.3)},${f1(-h * 0.06)}`;
	return {d: `${head} ${spine} ${wing} ${foot}`, dot: [cx + m * w * 0.2, cy - h * 0.34] as [number, number]}; };

/** THE sword, front face (blue-glass side), pommel end at (x, y), pointing up (rot = degrees clockwise). k = px per cm.
    Drawn by flat53s.SwordFlat (the same geometry, lattice, guard, hoops, pommel and marks as every other view). */
export const Sword: React.FC<{x: number; y: number; k: number; rot?: number; id: string; spec?: number; marks?: boolean; lw?: number}> = ({x, y, k, rot = 0, id, spec = 0.3, marks: showMarks = true, lw = 1}) =>
	<g transform={`translate(${x},${y}) rotate(${rot})`}><SwordFlat S={(a, w) => [w * k, -a * k]} id={`s${id}`} spec={spec} marks={showMarks} lw={lw} /></g>;

/** the pommel's end face: a flared disc with 11 concentric rings (B6), radius r, seen at an ellipse ratio — face53.PommelFace,
    the same rings as the 3-D pommel (used for the mirror image behind the pommel) */
export const RingDisc: React.FC<{x: number; y: number; r: number; ry?: number; id: string}> = ({x, y, r, ry = 1, id}) => { const k = r / R_FACE;
	return <PommelFace id={`rd${id}`} pt={(rr, th) => [x + rr * k * Math.cos(th), y - rr * k * ry * Math.sin(th)]} ppm={k} />; };

/** a soft-edged blob (rust spot / clod), radius r, seeded */
export const blob = (cx: number, cy: number, r: number, seed: number, n = 9, rough = 0.35) => { const pts: [number, number][] = [];
	for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI, rr = r * (1 - rough / 2 + rough * rnd(seed * 31 + i, 5)); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
	let d = ''; for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
		const m0 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], m1 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
		d += (i === 0 ? `M${f1(m0[0])},${f1(m0[1])}` : '') + `Q${f1(p1[0])},${f1(p1[1])} ${f1(m1[0])},${f1(m1[1])}`; }
	return d + 'Z'; };

/** your kitchen knife (a Chinese cleaver: square blade, a hanging hole, a wooden handle with two rivets), lying flat.
    Local frame in cm: blade x 0..20 (heel → front), y 0..9.6 (spine → edge); handle x −12..0. rust 0..1 */
export const Knife: React.FC<{x: number; y: number; k: number; rot?: number; squash?: number; id: string; rust?: number}> = ({x, y, k, rot = 0, squash = 0.6, id, rust = 1}) => {
	const P = (a: number, b: number) => `${f1(a * k)},${f1(b * k)}`;
	const blade = `M${P(0, 0.2)}L${P(19.4, 0)}Q${P(20.2, 0)} ${P(20.2, 0.8)}L${P(20.4, 8.6)}Q${P(20.3, 9.7)} ${P(19.0, 9.8)}Q${P(9.5, 10.0)} ${P(0.4, 9.4)}Q${P(-0.3, 9.3)} ${P(-0.3, 8.6)}L${P(-0.3, 2.6)}Q${P(-0.6, 1.6)} ${P(-0.6, 0.9)}Z`;
	const bevel = `M${P(0, 8.0)}Q${P(9.5, 8.6)} ${P(20.32, 7.4)}L${P(20.4, 8.6)}Q${P(20.3, 9.7)} ${P(19.0, 9.8)}Q${P(9.5, 10.0)} ${P(0.4, 9.4)}Q${P(-0.3, 9.3)} ${P(-0.3, 8.6)}L${P(-0.3, 8.0)}Z`;
	const handle = `M${P(-0.6, 0.7)}L${P(-11.6, 0.9)}Q${P(-12.4, 1.0)} ${P(-12.4, 2.1)}L${P(-12.3, 3.3)}Q${P(-12.2, 4.2)} ${P(-11.4, 4.2)}L${P(-0.6, 3.6)}Z`;
	const spots: React.ReactNode[] = [];
	if (rust > 0) {
		/* clusters: along the spine, round the hole, at the heel, a few blooms on the face, pitting along the edge */
		const cl0: [number, number, number, number][] = [[1.6, 1.2, 1.6, 14], [5.2, 0.9, 1.3, 10], [8.8, 1.1, 1.1, 8], [12.4, 0.9, 1.2, 9], [16.6, 1.6, 1.6, 14], [18.8, 4.0, 1.0, 8], [0.8, 5.2, 1.2, 9], [6.4, 5.0, 0.8, 6], [11.0, 6.4, 0.7, 5], [14.6, 8.9, 0.9, 7], [4.0, 9.0, 0.9, 7], [9.6, 9.3, 0.7, 5]];
		cl0.forEach(([a, b, rad, n], c) => { for (let i = 0; i < n; i++) { const ang = rnd(c * 40 + i, 61) * 6.283, dist = rad * Math.sqrt(rnd(c * 40 + i, 62)), rr = (0.18 + 0.5 * rnd(c * 40 + i, 63)) * (1 - 0.5 * dist / rad);
			spots.push(<path key={`r${c}_${i}`} d={blob((a + dist * Math.cos(ang)) * k, (b + dist * Math.sin(ang) * 0.8) * k, rr * k, c * 40 + i, 9, 0.7)} fill={['#5E3720', '#71442A', '#4A2C1A', '#80522F'][(c + i) % 4]} opacity={(0.5 + 0.4 * rnd(c * 40 + i, 64)) * rust} />); } });
		for (let i = 0; i < 90; i++) { const a = 0.4 + 19.6 * rnd(i, 21), b = 0.3 + 9.2 * Math.pow(rnd(i, 22), 1.3); spots.push(<circle key={`p${i}`} cx={a * k} cy={b * k} r={(0.05 + 0.1 * rnd(i, 23)) * k} fill="#5A331E" opacity={0.7 * rust} />); }
		spots.push(<path key="run" d={`M${P(16.9, 2.4)}q${f1(0.3 * k)},${f1(1.6 * k)} ${f1(-0.1 * k)},${f1(3.0 * k)}`} stroke="#6A3E24" strokeWidth={0.26 * k} strokeLinecap="round" opacity={0.5 * rust} fill="none" />);
	}
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(1,${squash})`}>
		<defs>
			<linearGradient id={`st${id}`} x1="0" y1="0" x2="0.25" y2="1"><stop offset="0" stopColor="#6C6E6E" /><stop offset="0.45" stopColor="#585B5C" /><stop offset="0.8" stopColor="#4A4D4F" /><stop offset="1" stopColor="#3C3F41" /></linearGradient>
			<linearGradient id={`wd${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A3022" /><stop offset="0.5" stopColor="#36221A" /><stop offset="1" stopColor="#24160F" /></linearGradient>
			<clipPath id={`kc${id}`}><path d={blade} /></clipPath>
			<filter id={`rs${id}`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.9" /></filter>
		</defs>
		<path d={blade} transform={`translate(${0.5 * k},${0.9 * k})`} fill="#000" opacity={0.45} />
		<path d={handle} transform={`translate(${0.5 * k},${0.9 * k})`} fill="#000" opacity={0.45} />
		<path d={blade} fill={`url(#st${id})`} />
		<path d={bevel} fill="#8C8F8E" opacity={0.55} />
		<path d={`M${P(0, 8.0)}Q${P(9.5, 8.6)} ${P(20.32, 7.4)}`} stroke="#A8AAA8" strokeWidth={0.08 * k} strokeOpacity={0.6} fill="none" />
		<g clipPath={`url(#kc${id})`}><g filter={`url(#rs${id})`}>{spots}</g></g>
		<circle cx={17.4 * k} cy={1.9 * k} r={0.8 * k} fill="#0E0A08" stroke="#3A3C3D" strokeWidth={0.1 * k} />
		<path d={`M${P(0.2, 0.32)}L${P(19.4, 0.12)}`} stroke="#8A8C8B" strokeWidth={0.12 * k} strokeOpacity={0.55} />
		<path d={handle} fill={`url(#wd${id})`} stroke="#140C08" strokeWidth={0.08 * k} />
		<path d={`M${P(-1.2, 1.4)}L${P(-11.2, 1.5)}`} stroke="#5A3C2A" strokeWidth={0.1 * k} strokeOpacity={0.6} />
		{[-3.2, -8.6].map((a, i) => <circle key={i} cx={a * k} cy={2.35 * k} r={0.42 * k} fill="#77797A" stroke="#2E3031" strokeWidth={0.08 * k} />)}
		<rect x={-1.4 * k} y={0.66 * k} width={1.0 * k} height={3.0 * k} fill="#4E5152" />
		{/* water beads on the blade (why it rusts) */}
		{[[5.2, 5.4, 0.36], [7.0, 6.6, 0.24], [13.4, 4.2, 0.3], [15.0, 6.9, 0.2]].map(([a, b, r], i) => <g key={`w${i}`}><ellipse cx={a * k} cy={b * k} rx={r * k} ry={r * k * 0.9} fill="#7E8486" opacity={0.6} /><circle cx={(a - r * 0.3) * k} cy={(b - r * 0.3) * k} r={r * 0.28 * k} fill="#D8DCDC" opacity={0.8} /></g>)}
	</g>;
};

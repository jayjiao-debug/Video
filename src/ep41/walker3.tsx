import React from 'react';
import {GAITS} from './gaits';

/* Walker v3 — real motion. The skeleton comes from CMU motion capture (a real person walking, looped and seen
   from the side, treadmill-style), so weight shift, heel–toe roll, hip sway and the arm swing are human.
   The figure is drawn over the joints as one smooth silhouette (tapered capsules + shaped torso + profile head),
   then dressed per era. Clothes lag the body a little (secondary motion). */
type P2 = [number, number];
export type Look3 = {
	dress: 'robe' | 'coat' | 'jacket' | 'shirt'; sleeves?: 'wide';
	head: 'bun' | 'futou' | 'tophat' | 'short' | 'cap' | 'bowl' | 'glasses' | 'long';
	beard?: 'short' | 'long' | 'full' | 'moustache'; gait?: '08_04' | '08_01' | '08_11'; build?: number;
	carry?: 'bone' | 'letter' | 'tape' | 'paper' | 'disk' | 'none';
};
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** joint position at phase u (0..1) of the gait loop, in body heights; y up */
const J = (g: string, name: string, u: number): P2 => {
	const a = GAITS[g].j[name], n = a.length / 2, x = (((u % 1) + 1) % 1) * n, i = Math.floor(x), k = x - i, j = (i + 1) % n;
	return [lerp(a[2 * i], a[2 * j], k), lerp(a[2 * i + 1], a[2 * j + 1], k)];
};
const f = (p: P2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
/** a tapered capsule between two points */
const cap = (a: P2, b: P2, ra: number, rb: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
	const circ = (c: P2, r: number) => `M${f([c[0] - r, c[1]])} a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(2 * r).toFixed(1)},0 a${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(-2 * r).toFixed(1)},0 Z`;
	return `M${f([a[0] + nx * ra, a[1] + ny * ra])} L${f([b[0] + nx * rb, b[1] + ny * rb])} L${f([b[0] - nx * rb, b[1] - ny * rb])} L${f([a[0] - nx * ra, a[1] - ny * ra])} Z ${circ(a, ra)} ${circ(b, rb)}`; };

export const gaitInfo = (g = '08_04') => GAITS[g];

export const Walker3: React.FC<{x: number; ground: number; h: number; u: number; look: Look3; col?: string; far?: string; flip?: boolean; ghost?: boolean; T?: number}> = ({x, ground, h, u, look, col = '#0b0a12', far = '#25202f', flip, ghost, T = 0}) => {
	const g = look.gait ?? '08_04', b = look.build ?? 1;
	const S = (n: string, du = 0): P2 => { const p = J(g, n, u + du); return [x + p[0] * h, ground - p[1] * h]; };
	const hip = S('Hips'), lb = S('LowerBack'), sp = S('Spine1'), nk = S('Neck'), n1 = S('Neck1'), hd = S('Head'), top = S('HeadTop');
	const leg = (s: 'Left' | 'Right', c: string) => { const T0 = S(`${s}UpLeg`), K = S(`${s}Leg`), A = S(`${s}Foot`), toe = S(s === 'Left' ? 'LToeTip' : 'RToeTip');
		const heel: P2 = [A[0] - 0.035 * h, A[1] + 0.022 * h];
		return <g fill={c}><path d={cap(T0, K, 0.052 * h * b, 0.034 * h)} /><path d={cap(K, A, 0.034 * h, 0.021 * h)} />
			<path d={`M${f([A[0] - 0.015 * h, A[1] - 0.015 * h])} L${f(heel)} L${f([toe[0], toe[1] + 0.006 * h])} Q${f([toe[0] + 0.012 * h, toe[1] - 0.012 * h])} ${f([A[0] + 0.03 * h, A[1] - 0.012 * h])} Z`} /></g>; };
	const arm = (s: 'Left' | 'Right', c: string) => { const Sh = S(`${s}Arm`), E = S(`${s}ForeArm`), W = S(`${s}Hand`);
		const sl = look.sleeves === 'wide' ? (() => { const lag = S(`${s}Hand`, -0.06); return <path d={`M${f(E)} Q${f([lag[0] - 0.02 * h, lag[1] + 0.05 * h])} ${f([lag[0] - 0.07 * h, lag[1] + 0.07 * h])} L${f([W[0] - 0.01 * h, W[1] + 0.01 * h])} L${f([W[0], W[1] - 0.025 * h])} Z`} />; })() : null;
		return <g fill={c}><path d={cap(Sh, E, 0.032 * h * b, 0.024 * h)} /><path d={cap(E, W, 0.024 * h, 0.018 * h)} /><ellipse cx={W[0]} cy={W[1] + 0.01 * h} rx={0.017 * h} ry={0.024 * h} />{sl}</g>; };
	// torso: a shaped outline along the spine (back flat, chest forward)
	const per = (a: P2, c: P2, d: number): P2 => { const dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1; return [a[0] + (-dy / l) * d * h, a[1] + (dx / l) * d * h]; };
	const torso = `M${f(per(hip, lb, -0.06 * b))} Q${f(per(lb, sp, -0.064 * b))} ${f(per(sp, nk, -0.058 * b))} Q${f(per(nk, n1, -0.035))} ${f(per(n1, hd, -0.022))} L${f(per(n1, hd, 0.026))} Q${f(per(sp, nk, 0.075 * b))} ${f(per(lb, sp, 0.058 * b))} L${f(per(hip, lb, 0.055 * b))} Z`;
	// head: a profile oriented along neck → top
	const ang = Math.atan2(top[1] - n1[1], top[0] - n1[0]) + Math.PI / 2, hc: P2 = [lerp(hd[0], top[0], 0.45), lerp(hd[1], top[1], 0.45)], s = h;
	const R = (p: P2): P2 => { const c = Math.cos(ang), sn = Math.sin(ang); return [hc[0] + p[0] * c - p[1] * sn, hc[1] + p[0] * sn + p[1] * c]; };
	const P = (px: number, py: number) => f(R([px * s, py * s]));
	const head = `M${P(-0.02, 0.07)} C${P(-0.066, 0.05)} ${P(-0.072, -0.045)} ${P(-0.018, -0.066)} C${P(0.028, -0.08)} ${P(0.058, -0.046)} ${P(0.055, -0.014)} L${P(0.058, 0.002)} L${P(0.076, 0.024)} L${P(0.058, 0.03)} L${P(0.061, 0.041)} L${P(0.055, 0.047)} C${P(0.057, 0.064)} ${P(0.041, 0.072)} ${P(0.025, 0.068)} L${P(0.022, 0.09)} L${P(-0.025, 0.095)} Z`;
	const hat = () => { switch (look.head) {
		case 'bun': return <g><circle cx={R([-0.032 * s, -0.066 * s])[0]} cy={R([-0.032 * s, -0.066 * s])[1]} r={0.027 * s} /><path d={`M${P(-0.05, -0.09)} L${P(0.03, -0.106)}`} stroke={col} strokeWidth={0.007 * s} /></g>;
		case 'futou': return <g><path d={`M${P(-0.064, 0)} Q${P(-0.064, -0.09)} ${P(0, -0.09)} Q${P(0.055, -0.086)} ${P(0.055, -0.026)} Z`} /><path d={`M${P(-0.034, -0.08)} Q${P(-0.02, -0.136)} ${P(0.028, -0.09)} Z`} />
			<path d={`M${P(-0.055, -0.045)} Q${P(-0.12, 0.02 + 0.01 * Math.sin(T * 3))} ${P(-0.1 + 0.012 * Math.sin(T * 3.4), 0.11)}`} stroke={col} strokeWidth={0.014 * s} fill="none" strokeLinecap="round" /></g>;
		case 'tophat': return <path d={`M${P(-0.082, -0.04)} Q${P(0, -0.058)} ${P(0.078, -0.04)} L${P(0.054, -0.058)} L${P(0.058, -0.18)} L${P(-0.05, -0.18)} L${P(-0.05, -0.058)} Z`} />;
		case 'short': return <path d={`M${P(-0.064, 0.01)} Q${P(-0.064, -0.07)} ${P(0.01, -0.069)} Q${P(0.053, -0.064)} ${P(0.056, -0.032)} Q${P(0.01, -0.045)} ${P(-0.01, 0)} Z`} />;
		case 'cap': return <path d={`M${P(-0.064, -0.018)} Q${P(-0.055, -0.08)} ${P(0.01, -0.077)} Q${P(0.055, -0.072)} ${P(0.06, -0.045)} L${P(0.104, -0.038)} L${P(0.055, -0.029)} Z`} />;
		case 'bowl': return <path d={`M${P(-0.066, 0.018)} Q${P(-0.068, -0.077)} ${P(0.004, -0.075)} Q${P(0.06, -0.068)} ${P(0.06, -0.018)} L${P(0.018, -0.027)} Q${P(-0.018, -0.009)} ${P(-0.027, 0.027)} Z`} />;
		case 'long': return <path d={`M${P(-0.064, 0.14)} Q${P(-0.09, -0.018)} ${P(-0.045, -0.064)} Q${P(0.01, -0.086)} ${P(0.057, -0.027)} Q${P(0.01, -0.04)} ${P(-0.004, 0.027)} Q${P(-0.018, 0.11)} ${P(-0.064, 0.14)} Z`} />;
		case 'glasses': return <g><path d={`M${P(-0.064, 0.01)} Q${P(-0.064, -0.07)} ${P(0.01, -0.069)} Q${P(0.053, -0.064)} ${P(0.056, -0.032)} Q${P(0.01, -0.045)} ${P(-0.01, 0)} Z`} /><path d={`M${P(0.018, -0.005)} L${P(0.066, -0.008)}`} stroke="#c9d6e4" strokeWidth={0.005 * s} opacity={0.55} /></g>;
	} };
	const beard = look.beard && <path d={look.beard === 'long' ? `M${P(0.036, 0.036)} Q${P(0.064, 0.11)} ${P(0.018, 0.17)} Q${P(-0.018, 0.09)} ${P(-0.027, 0.036)} Z` : look.beard === 'full' ? `M${P(0.056, 0.032)} Q${P(0.068, 0.09)} ${P(0.027, 0.104)} Q${P(-0.027, 0.08)} ${P(-0.04, 0.018)} Z` : look.beard === 'moustache' ? `M${P(0.056, 0.027)} Q${P(0.068, 0.038)} ${P(0.045, 0.04)} Z` : `M${P(0.052, 0.036)} Q${P(0.058, 0.077)} ${P(0.022, 0.08)} Q${P(-0.018, 0.064)} ${P(-0.032, 0.027)} Z`} />;
	// clothing with a little lag (secondary motion)
	const garment = () => {
		const kL = S('LeftLeg', -0.04), kR = S('RightLeg', -0.04), aL = S('LeftFoot', -0.05), aR = S('RightFoot', -0.05);
		const sh: P2 = per(sp, nk, 0), front = per(sp, nk, 0.08 * b), back = per(sp, nk, -0.066 * b);
		if (look.dress === 'robe') { const hem = ground - 0.085 * h, at = (K: P2, A: P2) => lerp(K[0], A[0], Math.min(1, Math.max(0, (hem - K[1]) / Math.max(1, A[1] - K[1]))));
			const fx = Math.max(at(kL, aL), at(kR, aR)) + 0.05 * h, bx = Math.min(at(kL, aL), at(kR, aR)) - 0.055 * h;
			return `M${f(back)} Q${f([sh[0], sh[1] - 0.02 * h])} ${f(front)} Q${f([hip[0] + 0.08 * h, hip[1] - 0.05 * h])} ${f([hip[0] + 0.06 * h, hip[1] + 0.04 * h])} Q${f([fx - 0.01 * h, hem - 0.1 * h])} ${f([fx, hem])} Q${f([(fx + bx) / 2, hem + 0.022 * h])} ${f([bx, hem + 0.01 * h])} Q${f([hip[0] - 0.1 * h, hip[1] + 0.06 * h])} ${f([hip[0] - 0.07 * h, hip[1] - 0.04 * h])} Z`; }
		if (look.dress === 'coat') { const hem = Math.max(kL[1], kR[1]) + 0.01 * h, fx = Math.max(kL[0], kR[0]) + 0.02 * h, bx = Math.min(kL[0], kR[0]) - 0.075 * h;
			return `M${f(back)} Q${f([sh[0], sh[1] - 0.02 * h])} ${f(front)} Q${f([hip[0] + 0.08 * h, hip[1] - 0.06 * h])} ${f([hip[0] + 0.062 * h, hip[1] + 0.02 * h])} L${f([fx, hem - 0.06 * h])} L${f([hip[0] + 0.015 * h, hip[1] + 0.07 * h])} L${f([bx, hem])} Q${f([hip[0] - 0.09 * h, hip[1] + 0.02 * h])} ${f([hip[0] - 0.068 * h, hip[1] - 0.05 * h])} Z`; }
		if (look.dress === 'jacket') return `M${f(back)} Q${f([sh[0], sh[1] - 0.02 * h])} ${f(front)} Q${f([hip[0] + 0.08 * h, hip[1] - 0.06 * h])} ${f([hip[0] + 0.066 * h, hip[1] + 0.06 * h])} L${f([hip[0] - 0.072 * h, hip[1] + 0.06 * h])} Z`;
		return null; };
	const gp = garment(), W = S('LeftHand');
	const prop = () => { const [px, py] = W, k = h; switch (look.carry) {
		case 'bone': return <g transform={`translate(${px + 0.02 * k},${py + 0.01 * k}) rotate(-15)`}><ellipse rx={0.045 * k} ry={0.032 * k} fill="#dccaa0" /><path d={`M0,${-0.03 * k} l0,${0.05 * k} M0,${-0.005 * k} l${0.025 * k},${-0.012 * k}`} stroke="#6b3a1a" strokeWidth={1.6} /></g>;
		case 'letter': return <g transform={`translate(${px + 0.02 * k},${py + 0.012 * k}) rotate(-10)`}><rect x={-0.035 * k} y={-0.022 * k} width={0.07 * k} height={0.045 * k} fill="#efe3c6" /><path d={`M${-0.035 * k},${-0.022 * k} L0,${0.004 * k} L${0.035 * k},${-0.022 * k}`} stroke="#9a8460" strokeWidth={1.2} fill="none" /></g>;
		case 'tape': return <g>{Array.from({length: 7}, (_, i) => { const x0 = px + 0.01 * k - i * 0.035 * k, y0 = py + 0.02 * k + i * 0.012 * k + Math.sin(i * 1.3 + T * 4) * 0.008 * k; return <rect key={i} x={x0 - 0.035 * k} y={y0 - 0.008 * k} width={0.037 * k} height={0.016 * k} fill="#efe3c6" />; })}</g>;
		case 'paper': return <g>{Array.from({length: 4}, (_, i) => <rect key={i} x={px - 0.03 * k + (i % 2) * 0.008 * k} y={py + 0.01 * k + i * 0.04 * k} width={0.065 * k} height={0.04 * k} fill="#ece6d2" stroke="#9a957f" strokeWidth={1} />)}</g>;
		case 'disk': return <g transform={`translate(${px + 0.02 * k},${py})`}><rect x={-0.03 * k} y={-0.03 * k} width={0.06 * k} height={0.06 * k} rx={2} fill="#2d3240" /><rect x={-0.016 * k} y={-0.03 * k} width={0.032 * k} height={0.02 * k} fill="#aeb8c8" /></g>;
		default: return null; } };
	return <g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>
		{arm('Right', far)}{leg('Right', far)}
		{leg('Left', col)}
		<g fill={col}><path d={torso} />{gp && <path d={gp} />}<path d={head} />{hat()}{beard}</g>
		{arm('Left', col)}
		{!ghost && prop()}
	</g>;
};

/** the walker with a thin rim of light on the side facing the light */
export const Lit3: React.FC<React.ComponentProps<typeof Walker3> & {rim?: string; dx?: number; dy?: number}> = ({rim = '#ffe2b0', dx = -2.5, dy = -1.5, ...p}) => <g>
	<g transform={`translate(${dx},${dy})`} opacity={0.85}><Walker3 {...p} col={rim} far={rim} ghost /></g>
	<Walker3 {...p} />
</g>;

import React from 'react';

/* Walker v2 — polished side-view silhouettes for ep41.
   - IK gait driven by distance walked (q = steps), so a planted foot never slides; key frames just pick a q.
   - Filled, tapered limbs, a real profile head, shaped torso, shoes and hands.
   - Clothing per era (robe with wide sleeves, frock coat with tails, jacket, trousers) and a rim-light pass. */
export const GR = 880;
type V = [number, number];
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smooth = (u: number) => u * u * (3 - 2 * u);
const fmt = (p: V) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

export type Look2 = {
	dress: 'robe' | 'coat' | 'jacket' | 'shirt';
	sleeves?: 'wide' | 'tight';
	head: 'bun' | 'futou' | 'tophat' | 'short' | 'cap' | 'bowl' | 'long' | 'glasses';
	beard?: 'short' | 'long' | 'full' | 'moustache';
	carry?: 'bone' | 'letter' | 'tape' | 'none' | 'paper' | 'disk' | 'notebook';
	stoop?: number;                        // forward lean in degrees (old/thoughtful walk)
	tail?: number;                         // how far the coat tails / robe hem swing
};

/** pose for a walker whose hip has walked q steps; returns joints in local px (hip x = 0) */
const pose = (q: number, h: number) => {
	const L = 0.33 * h, n = Math.floor(q), u = q - n, Lt = 0.25 * h, Ls = 0.25 * h, ah = 0.035 * h;
	const plant = (k: number) => k * L + L / 2 - q * L;              // plant k relative to the hip
	const hipY = GR - ah - 0.455 * h - 0.016 * h * Math.sin(Math.PI * u);
	const hip: V = [0, hipY];
	const stance = (n % 2 === 0) ? 'A' : 'B';
	// stance foot: flat, then the heel peels up in the last 40 % of the step
	const peel = Math.max(0, (u - 0.6) / 0.4), stanceAnkle: V = [plant(n) + 0.02 * h * peel, GR - ah - 0.06 * h * peel * peel];
	const sw = smooth(u), lift = Math.sin(Math.PI * u) * 0.06 * h;
	const swingAnkle: V = [lerp(plant(n - 1), plant(n + 1), sw), GR - ah - lift];
	const ik = (a: V) => { const dx = a[0] - hip[0], dy = a[1] - hip[1]; const d = Math.min(Math.hypot(dx, dy), (Lt + Ls) * 0.999), ang = Math.atan2(dy, dx);
		const k = Math.acos((Lt * Lt + d * d - Ls * Ls) / (2 * Lt * d)); const ka = ang - k; return [hip[0] + Math.cos(ka) * Lt, hip[1] + Math.sin(ka) * Lt] as V; };
	const footPitch = {stance: -peel * 32, swing: u < 0.35 ? -18 * (1 - u / 0.35) : u > 0.75 ? 10 * (u - 0.75) / 0.25 : 0};
	const A = stance === 'A' ? {a: stanceAnkle, pitch: footPitch.stance} : {a: swingAnkle, pitch: footPitch.swing};
	const B = stance === 'A' ? {a: swingAnkle, pitch: footPitch.swing} : {a: stanceAnkle, pitch: footPitch.stance};
	return {hip, A: {...A, k: ik(A.a)}, B: {...B, k: ik(B.a)}, L, u};
};

/** a tapered limb segment as a filled quad + round joints */
const seg = (a: V, b: V, wa: number, wb: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
	return `M${fmt([a[0] + nx * wa / 2, a[1] + ny * wa / 2])} L${fmt([b[0] + nx * wb / 2, b[1] + ny * wb / 2])} L${fmt([b[0] - nx * wb / 2, b[1] - ny * wb / 2])} L${fmt([a[0] - nx * wa / 2, a[1] - ny * wa / 2])} Z`; };

export const Walker2: React.FC<{x: number; h: number; q: number; look: Look2; col?: string; far?: string; flip?: boolean; armOverride?: [number, number]; T?: number; ghost?: boolean}> = ({x, h, q, look, col = '#0b0a12', far = '#211d2c', flip, armOverride, T = 0, ghost}) => {
	const P = pose(q, h), {hip} = P;
	const lean = (look.stoop ?? 4) * Math.PI / 180, Lto = 0.29 * h;
	const sh: V = [hip[0] + Math.sin(lean) * Lto, hip[1] - Math.cos(lean) * Lto];
	const C: V = [sh[0] + 0.03 * h, sh[1] - 0.1 * h];                // head centre
	const Lu = 0.175 * h, Lf = 0.16 * h;
	const arm = (foot: V, near: boolean): [V, V] => {
		const rel = (foot[0] - hip[0]) / (P.L * 0.5);
		let a = -26 * rel * Math.PI / 180, e = (14 + 18 * Math.max(0, -rel)) * Math.PI / 180;
		if (near && armOverride) { a = armOverride[0] * Math.PI / 180; e = armOverride[1] * Math.PI / 180; }
		const el: V = [sh[0] + Math.sin(a) * Lu, sh[1] + Math.cos(a) * Lu], hd: V = [el[0] + Math.sin(a + e) * Lf, el[1] + Math.cos(a + e) * Lf];
		return [el, hd];
	};
	const [eN, hN] = arm(P.B.a, true), [eF, hF] = arm(P.A.a, false);   // each arm swings with the opposite leg
	const leg = (Lg: typeof P.A, c: string) => { const toeDir = Lg.pitch * Math.PI / 180; const heel: V = [Lg.a[0] - 0.035 * h, Lg.a[1] + 0.03 * h], toe: V = [Lg.a[0] + Math.cos(toeDir) * 0.12 * h, Lg.a[1] + 0.035 * h - Math.sin(toeDir) * 0.12 * h];
		return <g fill={c}><path d={seg(hip, Lg.k, 0.085 * h, 0.056 * h)} /><circle cx={Lg.k[0]} cy={Lg.k[1]} r={0.028 * h} /><path d={seg(Lg.k, Lg.a, 0.056 * h, 0.036 * h)} />
			<path d={`M${fmt([Lg.a[0] - 0.02 * h, Lg.a[1] - 0.01 * h])} L${fmt(heel)} L${fmt(toe)} Q${fmt([toe[0] + 0.01 * h, toe[1] - 0.025 * h])} ${fmt([Lg.a[0] + 0.03 * h, Lg.a[1] - 0.005 * h])} Z`} /></g>; };
	const armDraw = (el: V, hd: V, c: string, wide: boolean) => <g fill={c}><path d={seg(sh, el, 0.05 * h, 0.04 * h)} /><circle cx={el[0]} cy={el[1]} r={0.02 * h} /><path d={seg(el, hd, 0.04 * h, 0.03 * h)} />
		<ellipse cx={hd[0]} cy={hd[1]} rx={0.02 * h} ry={0.026 * h} />
		{wide && <path d={`M${fmt(el)} L${fmt([hd[0] - 0.01 * h, hd[1] - 0.03 * h])} Q${fmt([hd[0] - 0.05 * h, hd[1] + 0.07 * h])} ${fmt([hd[0] - 0.09 * h, hd[1] + 0.06 * h])} Q${fmt([el[0] - 0.07 * h, el[1] + 0.02 * h])} ${fmt([el[0] - 0.02 * h, el[1] - 0.02 * h])} Z`} />}</g>;
	// torso
	const torso = `M${fmt([sh[0] - 0.055 * h, sh[1] + 0.02 * h])} Q${fmt([sh[0] + 0.01 * h, sh[1] - 0.025 * h])} ${fmt([sh[0] + 0.06 * h, sh[1] + 0.015 * h])} Q${fmt([sh[0] + 0.085 * h, sh[1] + 0.09 * h])} ${fmt([hip[0] + 0.055 * h, hip[1] - 0.07 * h])} L${fmt([hip[0] + 0.06 * h, hip[1] + 0.03 * h])} L${fmt([hip[0] - 0.065 * h, hip[1] + 0.03 * h])} Q${fmt([hip[0] - 0.075 * h, hip[1] - 0.12 * h])} ${fmt([sh[0] - 0.055 * h, sh[1] + 0.02 * h])} Z`;
	// clothing
	const kx = [P.A.k[0], P.B.k[0]], swingT = (look.tail ?? 1) * Math.sin(Math.PI * 2 * (q / 2)) * 0.02 * h;
	let garment: string | null = null;
	if (look.dress === 'robe') {
		const hem = GR - 0.075 * h, at = (Lg: typeof P.A) => { const t = Math.min(1, Math.max(0, (hem - Lg.k[1]) / Math.max(1, Lg.a[1] - Lg.k[1]))); return lerp(Lg.k[0], Lg.a[0], t); };
		const fx = Math.max(at(P.A), at(P.B)) + 0.05 * h, bx = Math.min(at(P.A), at(P.B)) - 0.06 * h - swingT;
		garment = `M${fmt([sh[0] - 0.06 * h, sh[1] + 0.015 * h])} Q${fmt([sh[0], sh[1] - 0.03 * h])} ${fmt([sh[0] + 0.065 * h, sh[1] + 0.012 * h])} Q${fmt([sh[0] + 0.09 * h, sh[1] + 0.1 * h])} ${fmt([hip[0] + 0.06 * h, hip[1] - 0.06 * h])} Q${fmt([hip[0] + 0.07 * h, hip[1] + 0.05 * h])} ${fmt([fx, hem])} Q${fmt([(fx + bx) / 2, hem + 0.02 * h])} ${fmt([bx, hem + 0.008 * h])} Q${fmt([hip[0] - 0.11 * h, hip[1] + 0.05 * h])} ${fmt([hip[0] - 0.075 * h, hip[1] - 0.05 * h])} Q${fmt([hip[0] - 0.085 * h, hip[1] - 0.17 * h])} ${fmt([sh[0] - 0.06 * h, sh[1] + 0.015 * h])} Z`;
	}
	if (look.dress === 'coat') {
		const hem = Math.max(P.A.k[1], P.B.k[1]) + 0.02 * h, fx = Math.max(...kx) + 0.02 * h, bx = Math.min(...kx) - 0.07 * h - swingT * 1.6;
		garment = `M${fmt([sh[0] - 0.06 * h, sh[1] + 0.015 * h])} Q${fmt([sh[0], sh[1] - 0.03 * h])} ${fmt([sh[0] + 0.065 * h, sh[1] + 0.012 * h])} Q${fmt([sh[0] + 0.09 * h, sh[1] + 0.1 * h])} ${fmt([hip[0] + 0.06 * h, hip[1] - 0.07 * h])} L${fmt([hip[0] + 0.065 * h, hip[1] + 0.02 * h])} L${fmt([fx, hem - 0.04 * h])} L${fmt([hip[0] + 0.01 * h, hip[1] + 0.06 * h])} L${fmt([bx, hem])} Q${fmt([hip[0] - 0.1 * h, hip[1]])} ${fmt([hip[0] - 0.07 * h, hip[1] - 0.06 * h])} Q${fmt([hip[0] - 0.08 * h, hip[1] - 0.17 * h])} ${fmt([sh[0] - 0.06 * h, sh[1] + 0.015 * h])} Z`;
	}
	if (look.dress === 'jacket') garment = `M${fmt([sh[0] - 0.062 * h, sh[1] + 0.015 * h])} Q${fmt([sh[0], sh[1] - 0.03 * h])} ${fmt([sh[0] + 0.066 * h, sh[1] + 0.012 * h])} Q${fmt([sh[0] + 0.09 * h, sh[1] + 0.1 * h])} ${fmt([hip[0] + 0.065 * h, hip[1] - 0.06 * h])} L${fmt([hip[0] + 0.07 * h, hip[1] + 0.07 * h])} L${fmt([hip[0] - 0.078 * h, hip[1] + 0.07 * h])} Q${fmt([hip[0] - 0.085 * h, hip[1] - 0.15 * h])} ${fmt([sh[0] - 0.062 * h, sh[1] + 0.015 * h])} Z`;
	const [cx, cy] = C, s = h;
	const head = `M${fmt([cx - 0.025 * s, cy + 0.075 * s])} C${fmt([cx - 0.07 * s, cy + 0.05 * s])} ${fmt([cx - 0.078 * s, cy - 0.05 * s])} ${fmt([cx - 0.02 * s, cy - 0.072 * s])} C${fmt([cx + 0.03 * s, cy - 0.088 * s])} ${fmt([cx + 0.064 * s, cy - 0.05 * s])} ${fmt([cx + 0.06 * s, cy - 0.015 * s])} L${fmt([cx + 0.063 * s, cy + 0.002 * s])} L${fmt([cx + 0.084 * s, cy + 0.026 * s])} L${fmt([cx + 0.063 * s, cy + 0.033 * s])} L${fmt([cx + 0.066 * s, cy + 0.045 * s])} L${fmt([cx + 0.06 * s, cy + 0.052 * s])} C${fmt([cx + 0.062 * s, cy + 0.07 * s])} ${fmt([cx + 0.045 * s, cy + 0.08 * s])} ${fmt([cx + 0.028 * s, cy + 0.075 * s])} L${fmt([cx + 0.03 * s, cy + 0.1 * s])} L${fmt([cx - 0.03 * s, cy + 0.11 * s])} Z`;
	const hat = () => { switch (look.head) {
		case 'bun': return <g><circle cx={cx - 0.035 * s} cy={cy - 0.07 * s} r={0.03 * s} /><path d={`M${cx - 0.05 * s},${cy - 0.1 * s} L${cx + 0.03 * s},${cy - 0.115 * s}`} stroke={col} strokeWidth={0.008 * s} /></g>;
		case 'futou': return <g><path d={`M${cx - 0.07 * s},${cy - 0.005 * s} Q${cx - 0.07 * s},${cy - 0.1 * s} ${cx},${cy - 0.1 * s} Q${cx + 0.06 * s},${cy - 0.095 * s} ${cx + 0.06 * s},${cy - 0.03 * s} Z`} /><path d={`M${cx - 0.035 * s},${cy - 0.09 * s} Q${cx - 0.02 * s},${cy - 0.15 * s} ${cx + 0.03 * s},${cy - 0.1 * s} Z`} />
			<path d={`M${cx - 0.06 * s},${cy - 0.05 * s} Q${cx - 0.13 * s},${cy + 0.02 * s} ${cx - 0.11 * s + Math.sin(T * 3) * 0.01 * s},${cy + 0.12 * s}`} stroke={col} strokeWidth={0.016 * s} fill="none" strokeLinecap="round" /></g>;
		case 'tophat': return <path d={`M${cx - 0.09 * s},${cy - 0.045 * s} Q${cx},${cy - 0.065 * s} ${cx + 0.085 * s},${cy - 0.045 * s} L${cx + 0.06 * s},${cy - 0.065 * s} L${cx + 0.065 * s},${cy - 0.2 * s} L${cx - 0.055 * s},${cy - 0.2 * s} L${cx - 0.055 * s},${cy - 0.065 * s} Z`} />;
		case 'short': return <path d={`M${cx - 0.07 * s},${cy + 0.01 * s} Q${cx - 0.07 * s},${cy - 0.078 * s} ${cx + 0.01 * s},${cy - 0.076 * s} Q${cx + 0.058 * s},${cy - 0.07 * s} ${cx + 0.062 * s},${cy - 0.035 * s} Q${cx + 0.01 * s},${cy - 0.05 * s} ${cx - 0.01 * s},${cy + 0.0 * s} Z`} />;
		case 'cap': return <path d={`M${cx - 0.07 * s},${cy - 0.02 * s} Q${cx - 0.06 * s},${cy - 0.088 * s} ${cx + 0.01 * s},${cy - 0.085 * s} Q${cx + 0.06 * s},${cy - 0.08 * s} ${cx + 0.065 * s},${cy - 0.05 * s} L${cx + 0.115 * s},${cy - 0.042 * s} L${cx + 0.06 * s},${cy - 0.032 * s} Z`} />;
		case 'bowl': return <path d={`M${cx - 0.072 * s},${cy + 0.02 * s} Q${cx - 0.075 * s},${cy - 0.085 * s} ${cx + 0.005 * s},${cy - 0.082 * s} Q${cx + 0.065 * s},${cy - 0.075 * s} ${cx + 0.066 * s},${cy - 0.02 * s} L${cx + 0.02 * s},${cy - 0.03 * s} Q${cx - 0.02 * s},${cy - 0.01 * s} ${cx - 0.03 * s},${cy + 0.03 * s} Z`} />;
		case 'long': return <path d={`M${cx - 0.07 * s},${cy + 0.15 * s} Q${cx - 0.1 * s},${cy - 0.02 * s} ${cx - 0.05 * s},${cy - 0.07 * s} Q${cx + 0.01 * s},${cy - 0.095 * s} ${cx + 0.063 * s},${cy - 0.03 * s} Q${cx + 0.01 * s},${cy - 0.045 * s} ${cx - 0.005 * s},${cy + 0.03 * s} Q${cx - 0.02 * s},${cy + 0.12 * s} ${cx - 0.07 * s},${cy + 0.15 * s} Z`} />;
		case 'glasses': return <g><path d={`M${cx - 0.07 * s},${cy + 0.01 * s} Q${cx - 0.07 * s},${cy - 0.078 * s} ${cx + 0.01 * s},${cy - 0.076 * s} Q${cx + 0.058 * s},${cy - 0.07 * s} ${cx + 0.062 * s},${cy - 0.035 * s} Q${cx + 0.01 * s},${cy - 0.05 * s} ${cx - 0.01 * s},${cy} Z`} />
			<path d={`M${cx + 0.02 * s},${cy - 0.005 * s} L${cx + 0.072 * s},${cy - 0.008 * s}`} stroke="#c9d6e4" strokeWidth={0.006 * s} opacity={0.55} /></g>;
	} };
	const beard = look.beard && <path d={look.beard === 'long' ? `M${cx + 0.04 * s},${cy + 0.04 * s} Q${cx + 0.07 * s},${cy + 0.12 * s} ${cx + 0.02 * s},${cy + 0.19 * s} Q${cx - 0.02 * s},${cy + 0.1 * s} ${cx - 0.03 * s},${cy + 0.04 * s} Z`
		: look.beard === 'full' ? `M${cx + 0.062 * s},${cy + 0.035 * s} Q${cx + 0.075 * s},${cy + 0.1 * s} ${cx + 0.03 * s},${cy + 0.115 * s} Q${cx - 0.03 * s},${cy + 0.09 * s} ${cx - 0.045 * s},${cy + 0.02 * s} L${cx - 0.03 * s},${cy + 0.01 * s} Z`
		: look.beard === 'moustache' ? `M${cx + 0.062 * s},${cy + 0.03 * s} Q${cx + 0.075 * s},${cy + 0.042 * s} ${cx + 0.05 * s},${cy + 0.045 * s} L${cx + 0.05 * s},${cy + 0.033 * s} Z`
		: `M${cx + 0.058 * s},${cy + 0.04 * s} Q${cx + 0.065 * s},${cy + 0.085 * s} ${cx + 0.025 * s},${cy + 0.09 * s} Q${cx - 0.02 * s},${cy + 0.07 * s} ${cx - 0.035 * s},${cy + 0.03 * s} Z`} />;
	const prop = () => { const [px, py] = hN; switch (look.carry) {
		case 'bone': return <g transform={`translate(${px + 0.04 * s},${py - 0.015 * s}) rotate(-20)`}><path d={`M${-0.06 * s},0 Q${-0.05 * s},${-0.05 * s} 0,${-0.055 * s} Q${0.06 * s},${-0.05 * s} ${0.065 * s},0 Q${0.04 * s},${0.045 * s} 0,${0.05 * s} Q${-0.05 * s},${0.045 * s} ${-0.06 * s},0 Z`} fill="#dccaa0" />
			<path d={`M${-0.015 * s},${-0.035 * s} l0,${0.03 * s} l${0.015 * s},${-0.008 * s} M${0.025 * s},${-0.025 * s} l0,${0.035 * s}`} stroke="#6b3a1a" strokeWidth={2} fill="none" /></g>;
		case 'letter': return <g transform={`translate(${px + 0.03 * s},${py - 0.01 * s}) rotate(-12)`}><rect x={-0.05 * s} y={-0.032 * s} width={0.1 * s} height={0.064 * s} fill="#efe3c6" /><path d={`M${-0.05 * s},${-0.032 * s} L0,${0.006 * s} L${0.05 * s},${-0.032 * s}`} stroke="#9a8460" strokeWidth={1.5} fill="none" /></g>;
		case 'tape': return <g>{Array.from({length: 8}, (_, i) => { const x0 = px - i * 0.042 * s + 0.02 * s, y0 = py + 0.01 * s + i * 0.014 * s + Math.sin(i * 1.3 + T * 4) * 0.01 * s; return <g key={i}><rect x={x0 - 0.042 * s} y={y0 - 0.009 * s} width={0.044 * s} height={0.018 * s} fill="#efe3c6" />
			<rect x={x0 - 0.036 * s} y={y0 - 0.003 * s} width={i % 3 === 0 ? 0.004 * s : 0.014 * s} height={0.006 * s} fill="#2a2018" /><rect x={x0 - 0.016 * s} y={y0 - 0.003 * s} width={i % 2 ? 0.004 * s : 0.014 * s} height={0.006 * s} fill="#2a2018" /></g>; })}</g>;
		case 'paper': return <g>{Array.from({length: 5}, (_, i) => <rect key={i} x={px - 0.035 * s + (i % 2) * 0.01 * s} y={py + i * 0.045 * s} width={0.08 * s} height={0.045 * s} fill="#ece6d2" stroke="#9a957f" strokeWidth={1} />)}
			<rect x={px - 0.025 * s} y={py + 0.01 * s} width={0.05 * s} height={0.01 * s} fill="#2b3a5a" opacity={0.7} /></g>;
		case 'disk': return <g transform={`translate(${px + 0.025 * s},${py - 0.02 * s}) rotate(-8)`}><rect x={-0.037 * s} y={-0.037 * s} width={0.074 * s} height={0.074 * s} rx={2} fill="#2d3240" /><rect x={-0.02 * s} y={-0.037 * s} width={0.04 * s} height={0.024 * s} fill="#aeb8c8" /><rect x={-0.028 * s} y={0.004 * s} width={0.056 * s} height={0.03 * s} fill="#ece6d2" /></g>;
		case 'notebook': return <rect x={px - 0.04 * s} y={py - 0.03 * s} width={0.08 * s} height={0.1 * s} rx={2} fill={col} transform={`rotate(-10 ${px} ${py})`} />;
		default: return null;
	} };
	const wide = look.sleeves === 'wide';
	return <g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}><g transform={`translate(${x},0)`}>
		{armDraw(eF, hF, far, wide)}
		{leg(P.B, far)}
		{leg(P.A, col)}
		<g fill={col}><path d={torso} />{garment && <path d={garment} />}<path d={seg([sh[0] + 0.01 * h, sh[1] + 0.01 * h], [cx + 0.0 * s, cy + 0.08 * s], 0.06 * h, 0.05 * h)} /><path d={head} />{hat()}{beard}</g>
		{armDraw(eN, hN, col, wide)}
		{!ghost && prop()}
	</g></g>;
};

/** the walker with a thin rim of light on the side facing the light */
export const Lit: React.FC<React.ComponentProps<typeof Walker2> & {rim?: string; dx?: number; dy?: number}> = ({rim = '#ffe2b0', dx = -3, dy = -2, ...p}) => <g>
	<g transform={`translate(${dx},${dy})`} opacity={0.85}><Walker2 {...p} col={rim} far={rim} ghost /></g>
	<Walker2 {...p} />
</g>;

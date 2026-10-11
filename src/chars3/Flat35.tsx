import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {demoAt, camDir, cross, norm, sub, add, mul, dot, len, lerp3, smooth, torso, HEAD_R, T_GRAB, T_READ, T_TALK, type V3, type J} from './rig3';

/* A · flat 2D drawn at 35°: the mocap skeleton is projected with a true three-quarter camera
   (arms and legs foreshorten toward the camera, the far shoulder and hip sit behind), and every
   part is drawn flat in the Tank-cast style. Parts are depth-sorted each frame. */

export const W = 1920, H = 1080;

/** shared camera for both renderers: follows the hips with lag, pushes in while he reads */
export const camAt = (t: number) => {
	let x = 0, z = 0;
	for (let k = -6; k <= 6; k++) {
		const j = demoAt(Math.max(0, Math.min(11.99, t + k * 0.08))).j;
		x += j.Hips[0];
		z += j.Hips[2];
	}
	const zoom = 1 + 0.3 * smooth((t - 4.6) / 1.6) - 0.15 * smooth((t - 7.4) / 1.4);
	const y = 0.52 + 0.06 * smooth((t - 4.6) / 1.6);
	return {target: [x / 13 + 0.12, y, z / 13] as V3, zoom};
};

const SK = '#e9c4a0', SKD = '#d4a988', SUIT = '#2e313a', SUITD = '#22242b', SHOE = '#16151a', HAIR = '#231b17', SHIRT = '#e8e4da', TIE = '#8a2c2c', INK = '#1b1a1f';

const f1 = (v: number) => v.toFixed(1);
const capsule = (a: [number, number], b: [number, number], ra: number, rb: number) => {
	const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
	const p = (q: [number, number], r: number, s: number) => `${f1(q[0] + nx * r * s)} ${f1(q[1] + ny * r * s)}`;
	return `M${p(a, ra, 1)} L${p(b, rb, 1)} A${f1(rb)} ${f1(rb)} 0 0 0 ${p(b, rb, -1)} L${p(a, ra, -1)} A${f1(ra)} ${f1(ra)} 0 0 0 ${p(a, ra, 1)} Z`;
};
const hull = (pts: [number, number][]) => {
	const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
	const cr = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lo: [number, number][] = [], up: [number, number][] = [];
	for (const q of p) {
		while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
		lo.push(q);
	}
	for (const q of [...p].reverse()) {
		while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
		up.push(q);
	}
	return [...lo.slice(0, -1), ...up.slice(0, -1)];
};
const smoothPath = (ps: [number, number][]) => {
	const m = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	let d = `M${m(ps[ps.length - 1], ps[0]).map(f1).join(' ')}`;
	ps.forEach((q, i) => (d += ` Q${f1(q[0])} ${f1(q[1])} ${m(q, ps[(i + 1) % ps.length]).map(f1).join(' ')}`));
	return d + ' Z';
};

/** mitten hand shapes (wrist at 0,0, fingers +y, thumb +x), from the Tank cast v2 */
const MITTEN = 'M-6.5,0 C-8.5,8 -8.5,17 -6,23 C-3.5,27.5 3.5,27.5 6,23.5 C7.5,20 8,16 8,13 C11,12 12,7 8.5,3.5 L6.5,0 Z';
const FIST = 'M-7,0 C-9.5,6 -9.5,14 -6,18.5 C-2,22 6,21 8.5,16.5 C10.5,12.5 10,5 7,0 Z';

export const Lantern2D: React.FC<{s: number; on: number}> = ({s, on}) => (
	<g transform={`scale(${s})`}>
		<path d="M-11,22 C-12,4 -6,0 0,0 C6,0 12,4 11,22" fill="none" stroke="#2a2420" strokeWidth={2.4} />
		<rect x={-12} y={20} width={24} height={7} rx={2} fill="#3a2e24" />
		<path d="M-11,27 C-16,36 -16,50 -11,58 L11,58 C16,50 16,36 11,27 Z" fill="#ffd37a" opacity={0.35 + 0.55 * on} />
		<ellipse cx={0} cy={44} rx={5} ry={8} fill="#fff4c8" opacity={on} />
		<path d="M-11,27 L-11,58 M11,27 L11,58 M0,27 L0,58" stroke="#3a2e24" strokeWidth={1.6} />
		<rect x={-14} y={57} width={28} height={8} rx={2} fill="#3a2e24" />
	</g>
);

export const Flat35: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / 30;
	const D = demoAt(t);
	const j: J = D.j;
	const {target, zoom} = camAt(t);
	const c = camDir();
	const r = norm(cross(c, [0, 1, 0]));
	const u = norm(cross(r, c));
	const SC = 560 * zoom;
	const P = (p: V3): [number, number] => {
		const q = sub(p, target);
		return [W / 2 + dot(q, r) * SC, H / 2 - dot(q, u) * SC];
	};
	const depth = (p: V3) => dot(p, c);
	const parts: {z: number; el: React.ReactNode}[] = [];
	const push = (z: number, el: React.ReactNode) => parts.push({z, el});
	const tf = torso(j);
	const down: V3 = [0, -1, 0];

	// limbs: width in body heights → px
	const limb = (a: string, b: string, ra: number, rb: number, col: string, key: string, bias = 0) =>
		push((depth(j[a]) + depth(j[b])) / 2 + bias, <path key={key} d={capsule(P(j[a]), P(j[b]), ra * SC, rb * SC)} fill={col} />);
	const nearSide = (side: string) => (side === 'Right' ? 1 : 0);
	for (const side of ['Left', 'Right']) {
		const near = nearSide(side);
		const pants = near ? SUIT : SUITD, coat = near ? SUIT : SUITD;
		limb(`${side}UpLeg`, `${side}Leg`, 0.042, 0.034, pants, side + 'th', -0.001);
		limb(`${side}Leg`, `${side}Foot`, 0.034, 0.027, pants, side + 'sh', -0.001);
		// shoe from heel to toe
		const F = j[`${side}Foot`], T = j[`${side}ToeBase`];
		const fdir = norm([T[0] - F[0], 0, T[2] - F[2]]);
		const heel = add(add(F, mul(fdir, -0.03)), [0, -0.012, 0]), toe = add(add(T, mul(fdir, 0.045)), [0, -0.006, 0]);
		push(depth(F) - 0.0005, <path key={side + 'shoe'} d={capsule(P(heel), P(toe), 0.026 * SC, 0.02 * SC)} fill={SHOE} />);
		// arms
		limb(`${side}Arm`, `${side}ForeArm`, 0.031, 0.027, coat, side + 'ua', 0.02 * (near ? 1 : -1));
		limb(`${side}ForeArm`, `${side}Hand`, 0.027, 0.023, coat, side + 'fa', 0.02 * (near ? 1 : -1));
		// cuff + hand (mitten oriented along hand → index, thumb toward the thumb marker)
		const Wr = j[`${side}Hand`], I = j[`${side}HandIndex1`], Th = j[side === 'Right' ? 'RThumb' : 'LThumb'];
		const pw = P(Wr), pi = P(add(Wr, mul(norm(sub(I, Wr)), 0.1))), pt = P(add(Wr, mul(norm(sub(Th, Wr)), 0.05)));
		const ang = (Math.atan2(pi[1] - pw[1], pi[0] - pw[0]) * 180) / Math.PI - 90;
		const ax = [pi[0] - pw[0], pi[1] - pw[1]], at = [pt[0] - pw[0], pt[1] - pw[1]];
		const mirror = ax[0] * at[1] - ax[1] * at[0] > 0 ? -1 : 1;
		const s = (0.088 * SC) / 27;
		const gripping = side === 'Right' && D.held;
		push(depth(Wr) + 0.02 * (near ? 1 : -1) + 0.001, (
			<g key={side + 'hand'}>
				<circle cx={pw[0]} cy={pw[1]} r={0.024 * SC} fill={SHIRT} />
				<g transform={`translate(${f1(pw[0])} ${f1(pw[1])}) rotate(${ang.toFixed(1)}) scale(${(mirror * s).toFixed(3)} ${s.toFixed(3)})`}>
					<path d={gripping ? FIST : MITTEN} fill={near ? SK : SKD} stroke={'#b88c6c'} strokeWidth={1.1} />
				</g>
			</g>
		));
	}

	// torso: silhouette = hull of chest and hip cross-sections, so its width changes with the turn
	const ring = (o: V3, w: number, d: number, n = 14): V3[] => Array.from({length: n}, (_, i) => {
		const a = (i / n) * Math.PI * 2;
		return add(o, add(mul(tf.left, Math.cos(a) * w), mul(tf.fwd, Math.sin(a) * d)));
	});
	const chest = add(lerp3(j.LeftArm, j.RightArm, 0.5), mul(tf.up, -0.035));
	const hipC = lerp3(j.LeftUpLeg, j.RightUpLeg, 0.5);
	const hem = add(hipC, [0, -0.07, 0]);
	const torsoPts = [...ring(add(j.Neck, mul(tf.up, -0.01)), 0.05, 0.045), ...ring(chest, 0.155, 0.075), ...ring(add(chest, mul(tf.up, 0.035)), 0.12, 0.06), ...ring(lerp3(chest, hipC, 0.5), 0.12, 0.07), ...ring(hipC, 0.125, 0.075), ...ring(hem, 0.13, 0.08)].map(P);
	const front = (p: V3, d: number) => add(p, mul(tf.fwd, d));
	const facing = dot(tf.fwd, c);
	push(depth(hipC), (
		<g key="torso">
			<path d={smoothPath(hull(torsoPts))} fill={SUIT} />
			{facing > -0.1 ? (
				<g>
					<path d={`M${P(front(add(j.Neck, mul(tf.left, 0.035)), 0.05)).map(f1).join(' ')} L${P(front(add(j.Neck, mul(tf.left, -0.035)), 0.05)).map(f1).join(' ')} L${P(front(add(chest, mul(tf.up, -0.09)), 0.078)).map(f1).join(' ')} Z`} fill={SHIRT} />
					<path d={`M${P(front(j.Neck, 0.055)).map(f1).join(' ')} L${P(front(add(chest, mul(tf.up, -0.085)), 0.08)).map(f1).join(' ')}`} stroke={TIE} strokeWidth={0.014 * SC * Math.max(0.4, facing)} strokeLinecap="round" />
					{[0.13, 0.2].map((k) => {
						const b = P(front(add(chest, mul(tf.up, -k)), 0.08));
						return <circle key={k} cx={b[0]} cy={b[1]} r={0.006 * SC} fill={INK} />;
					})}
				</g>
			) : null}
			{/* the shadow side of the coat */}
			<path d={smoothPath(hull([...ring(chest, 0.155, 0.075), ...ring(hem, 0.13, 0.08)].filter((_, i) => true).map((p) => P(p))))} fill="url(#f35-shade)" />
		</g>
	));

	// neck + head
	const hd = D.head;
	push(depth(hipC) - 0.001, <path key="neck" d={capsule(P(j.Neck), P(j.Head), 0.03 * SC, 0.028 * SC)} fill={SKD} />);
	const R = HEAD_R * SC;
	const pc = P(hd.c);
	const vis = (n: V3) => dot(n, c);
	const onHead = (fw: number, lf: number, upk: number): V3 => add(hd.c, add(add(mul(hd.fwd, fw * HEAD_R), mul(hd.left, lf * HEAD_R)), mul(hd.up, upk * HEAD_R)));
	const feature = (fw: number, lf: number, upk: number) => {
		const p = onHead(fw, lf, upk);
		const n = norm(sub(p, hd.c));
		return {p: P(p), v: vis(n)};
	};
	const hairC = P(add(add(hd.c, mul(hd.fwd, -0.2 * HEAD_R)), mul(hd.up, 0.42 * HEAD_R)));
	const hairB = P(add(add(hd.c, mul(hd.fwd, -0.55 * HEAD_R)), mul(hd.up, 0.05 * HEAD_R)));
	const eyes = [feature(0.9, 0.36, 0.06), feature(0.9, -0.36, 0.06)];
	const ear = feature(-0.05, -1, -0.05);
	const nose = feature(1.03, 0, -0.16);
	const mouth = feature(0.92, 0, -0.46);
	const blink = (f % 117) < 3 ? 0.15 : 1;
	push(depth(hd.c) + 0.03, (
		<g key="head">
			<defs>
				<clipPath id={`f35-head-${f}`}><circle cx={pc[0]} cy={pc[1]} r={R} /></clipPath>
			</defs>
			<circle cx={pc[0]} cy={pc[1]} r={R} fill={SK} />
			<g clipPath={`url(#f35-head-${f})`}>
				<circle cx={hairC[0]} cy={hairC[1]} r={R * 0.82} fill={HAIR} />
				<circle cx={hairB[0]} cy={hairB[1]} r={R * 0.72} fill={HAIR} />
				<circle cx={pc[0] + R * 0.5} cy={pc[1] + R * 0.6} r={R * 0.9} fill={SKD} opacity={0.25} />
			</g>
			{ear.v > 0.05 ? <ellipse cx={ear.p[0]} cy={ear.p[1]} rx={R * 0.16 * Math.max(0.3, ear.v)} ry={R * 0.24} fill={SKD} /> : null}
			{eyes.map((e, i) => (e.v > 0.12 ? (
				<g key={i}>
					<ellipse cx={e.p[0]} cy={e.p[1]} rx={R * 0.075 * Math.max(0.4, e.v)} ry={R * 0.11 * blink} fill={INK} />
					<ellipse cx={e.p[0]} cy={e.p[1]} rx={R * 0.2 * Math.max(0.35, e.v)} ry={R * 0.2} fill="rgba(210,230,255,0.08)" stroke="#2a2522" strokeWidth={R * 0.035} />
					<path d={`M${f1(e.p[0] - R * 0.15 * e.v)} ${f1(e.p[1] - R * 0.27)} L${f1(e.p[0] + R * 0.15 * e.v)} ${f1(e.p[1] - R * (D.expr === 'thinking' ? 0.31 : 0.28))}`} stroke={HAIR} strokeWidth={R * 0.055} strokeLinecap="round" />
				</g>
			) : null))}
			{eyes[0].v > 0.12 && eyes[1].v > 0.12 ? <line x1={eyes[0].p[0]} y1={eyes[0].p[1]} x2={eyes[1].p[0]} y2={eyes[1].p[1]} stroke="#2a2522" strokeWidth={R * 0.03} /> : null}
			{nose.v > 0.1 ? <circle cx={nose.p[0]} cy={nose.p[1]} r={R * 0.1} fill={SKD} /> : null}
			{mouth.v > 0.1 ? (D.talk ? <ellipse cx={mouth.p[0]} cy={mouth.p[1]} rx={R * 0.09 * mouth.v} ry={R * 0.07} fill="#3a1f1a" /> : (
				<path d={`M${f1(mouth.p[0] - R * 0.15 * mouth.v)} ${f1(mouth.p[1])} Q${f1(mouth.p[0])} ${f1(mouth.p[1] + R * (D.expr === 'smile' ? 0.09 : 0.03))} ${f1(mouth.p[0] + R * 0.15 * mouth.v)} ${f1(mouth.p[1])}`} stroke={INK} strokeWidth={R * 0.045} fill="none" strokeLinecap="round" />
			)) : null}
		</g>
	));

	parts.sort((a, b) => a.z - b.z);

	// room: a floor plane and the back wall (z = +1.1), projected with the same camera
	const poly = (pts: V3[]) => pts.map(P).map((q) => q.map(f1).join(' ')).join(' L');
	const lantern = D.lantern;
	const pl = P(lantern);
	const flick = 0.92 + 0.08 * Math.sin(t * 17) * Math.sin(t * 5.3);
	const glowC = P(add(lantern, [0, -0.09, 0]));
	const shadowC = P([j.Hips[0], 0, j.Hips[2]]);
	return (
		<AbsoluteFill style={{background: '#0b0d10'}}>
			<svg width={W} height={H}>
				<defs>
					<linearGradient id="f35-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.28} /></linearGradient>
					<radialGradient id="f35-glow"><stop offset="0" stopColor="#ffd590" stopOpacity={0.55} /><stop offset="0.35" stopColor="#ffb860" stopOpacity={0.18} /><stop offset="1" stopColor="#ffb860" stopOpacity={0} /></radialGradient>
					<radialGradient id="f35-hole"><stop offset="0" stopColor="#000" /><stop offset="0.5" stopColor="#555" /><stop offset="1" stopColor="#fff" /></radialGradient>
					<mask id="f35-dark"><rect width={W} height={H} fill="#fff" /><circle cx={glowC[0]} cy={glowC[1]} r={600 * zoom * flick} fill="url(#f35-hole)" /></mask>
				</defs>
				<path d={`M${poly([[-4, 0, 1.1], [9, 0, 1.1], [9, 2.4, 1.1], [-4, 2.4, 1.1]])} Z`} fill="#1c2620" />
				<path d={`M${poly([[-4, 0, 1.1], [9, 0, 1.1], [9, 0.42, 1.1], [-4, 0.42, 1.1]])} Z`} fill="#2a1c14" />
				<path d={`M${poly([[3.2, 0.75, 1.1], [3.95, 0.75, 1.1], [3.95, 1.7, 1.1], [3.2, 1.7, 1.1]])} Z`} fill="#1a2438" stroke="#2a1c12" strokeWidth={0.04 * SC} />
				<path d={`M${poly([[-4, 0, 1.1], [9, 0, 1.1], [9, 0, -3], [-4, 0, -3]])} Z`} fill="#2b1e15" />
				{Array.from({length: 14}, (_, i) => <path key={i} d={`M${poly([[-4, 0, 1.1 - i * 0.3], [9, 0, 1.1 - i * 0.3]])}`} stroke="#1e140e" strokeWidth={2} />)}
				<circle cx={glowC[0]} cy={glowC[1]} r={520 * zoom * flick} fill="url(#f35-glow)" />
				<ellipse cx={shadowC[0]} cy={shadowC[1]} rx={0.14 * SC} ry={0.035 * SC} fill="#000" opacity={0.35} />
				{!D.held ? <g transform={`translate(${f1(pl[0])} ${f1(pl[1])})`}><Lantern2D s={(0.21 * SC) / 66} on={flick} /></g> : null}
				<g>{parts.map((p) => p.el)}</g>
				{D.held ? <g transform={`translate(${f1(pl[0])} ${f1(pl[1])})`}><Lantern2D s={(0.21 * SC) / 66} on={flick} /></g> : null}
				<rect width={W} height={H} fill="#05070c" opacity={0.6} mask="url(#f35-dark)" />
				<text x={60} y={1030} style={{fontFamily: 'Noto Sans CJK SC, sans-serif', fontSize: 26, fill: '#c9b48a', letterSpacing: '0.06em'}}>A · 平面 2D，真 35° 视角 · 同一套动捕数据</text>
			</svg>
		</AbsoluteFill>
	);
};
export const FLAT35_N = 12 * 30;
export {T_GRAB, T_READ, T_TALK, len};

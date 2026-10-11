import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {demoAt, camDir, cross, norm, sub, add, mul, dot, len, lerp3, smooth, torso, HEAD_R, DEMO_T, T_GRAB, T_READ, T_TALK, type V3, type J} from './rig3';

/* A · flat 2D drawn at a true 35° three-quarter view (v2).
   The mocap actor's own skeleton (no retargeting) is projected through one camera; every part is a flat
   shape whose outline comes from projecting its 3D cross-sections, so widths change as the body turns.
   v2: a real head volume (skull + jaw + nose) and hair cap; two-tone cel shading and a warm rim, both
   from the lantern's actual position; the lantern is put down before talking so both hands gesture. */

export const W = 1920, H = 1080;

/** shared camera: follows the hips with lag, pushes in while he reads */
export const camAt = (t: number) => {
	let x = 0, z = 0;
	for (let k = -6; k <= 6; k++) {
		const j = demoAt(Math.max(0, Math.min(DEMO_T - 0.01, t + k * 0.08))).j;
		x += j.Hips[0];
		z += j.Hips[2];
	}
	const zoom = 1 + 0.3 * smooth((t - 4.6) / 1.6) - 0.22 * smooth((t - 7.0) / 1.4) + 0.12 * smooth((t - 9.6) / 1.6);
	const y = 0.52 + 0.06 * smooth((t - 4.6) / 1.6) - 0.06 * smooth((t - 7.0) / 1.4) + 0.05 * smooth((t - 9.6) / 1.6);
	return {target: [x / 13 + 0.12, y, z / 13] as V3, zoom};
};

const C = {skin: '#ecc7a3', skinD: '#c99a7a', suit: '#363a46', suitD: '#23252e', shoe: '#17161b', shoeD: '#0e0d11', hair: '#2a201b', hairD: '#1a1411', shirt: '#ece8de', tie: '#8e2e2e', ink: '#17151a', rim: '#ffcf8f'};
type P2 = [number, number];
const f1 = (v: number) => v.toFixed(1);
const capsule = (a: P2, b: P2, ra: number, rb: number) => {
	const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
	const p = (q: P2, r: number, s: number) => `${f1(q[0] + nx * r * s)} ${f1(q[1] + ny * r * s)}`;
	return `M${p(a, ra, 1)} L${p(b, rb, 1)} A${f1(rb)} ${f1(rb)} 0 0 0 ${p(b, rb, -1)} L${p(a, ra, -1)} A${f1(ra)} ${f1(ra)} 0 0 0 ${p(a, ra, 1)} Z`;
};
const hull = (pts: P2[]) => {
	const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
	const cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lo: P2[] = [], up: P2[] = [];
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
const smoothPath = (ps: P2[]) => {
	const m = (a: P2, b: P2) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	let d = `M${m(ps[ps.length - 1], ps[0]).map(f1).join(' ')}`;
	ps.forEach((q, i) => (d += ` Q${f1(q[0])} ${f1(q[1])} ${m(q, ps[(i + 1) % ps.length]).map(f1).join(' ')}`));
	return d + ' Z';
};
/** points on a sphere (fibonacci), for building 3D volumes to project */
const SPHERE = Array.from({length: 90}, (_, i) => {
	const y = 1 - (2 * (i + 0.5)) / 90, r = Math.sqrt(1 - y * y), a = i * 2.39996;
	return [Math.cos(a) * r, y, Math.sin(a) * r] as V3;
});

const MITTEN = 'M-6.5,0 C-8.5,8 -8.5,17 -6,23 C-3.5,27.5 3.5,27.5 6,23.5 C7.5,20 8,16 8,13 C11,12 12,7 8.5,3.5 L6.5,0 Z';
const OPEN = 'M-6.5,0 C-8.8,9 -8.8,20 -6.2,26.5 C-3.6,31 3.8,31 6.2,26.5 C8.2,21 8.2,9 6.5,0 Z M7,3 C11,5 14.5,9 15.5,13 C16.2,15.5 13.6,16.6 12.6,14.6 C11.4,12 9.5,10 6.5,8.5 Z';
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
	const P = (p: V3): P2 => {
		const q = sub(p, target);
		return [W / 2 + dot(q, r) * SC, H / 2 - dot(q, u) * SC];
	};
	const depth = (p: V3) => dot(p, c);
	const parts: {z: number; el: React.ReactNode}[] = [];
	const push = (z: number, el: React.ReactNode) => parts.push({z, el});
	const tf = torso(j);
	const flick = 0.92 + 0.08 * Math.sin(t * 17) * Math.sin(t * 5.3);
	// the key light is the lantern; its glass sits ~0.12 below the handle
	const L3 = add(D.lantern, [0, -0.12, 0]);
	const LP = P(L3);
	const lit = (p: V3) => Math.max(0.25, Math.min(1, 1.35 - len(sub(p, L3)) * 0.9));
	let uid = 0;

	/** a shaded capsule: base, a shadow band on the side away from the light, a warm rim toward it */
	const shaded = (a: V3, b: V3, ra: number, rb: number, base: string, dark: string, key: string, z: number) => {
		const pa = P(a), pb = P(b);
		const Ra = ra * SC, Rb = rb * SC;
		const dx = pb[0] - pa[0], dy = pb[1] - pa[1], Ln = Math.hypot(dx, dy) || 1, nx = -dy / Ln, ny = dx / Ln;
		const m: P2 = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
		const s = Math.sign((LP[0] - m[0]) * nx + (LP[1] - m[1]) * ny) || 1;
		const k = lit(lerp3(a, b, 0.5));
		const off = (q: P2, d: number): P2 => [q[0] + nx * d * s, q[1] + ny * d * s];
		const id = `cl${f}_${uid++}`;
		push(z, (
			<g key={key}>
				<path d={capsule(off(pa, 2.2), off(pb, 2.2), Ra, Rb)} fill={C.rim} opacity={0.55 * k} />
				<path d={capsule(pa, pb, Ra, Rb)} fill={base} />
				<clipPath id={id}><path d={capsule(pa, pb, Ra, Rb)} /></clipPath>
				<path d={capsule(off(pa, -Ra * 1.05), off(pb, -Rb * 1.05), Ra, Rb)} fill={dark} clipPath={`url(#${id})`} />
			</g>
		));
	};
	/** a shaded volume from 3D points: hull silhouette, shadow = the hull pushed away from the light, clipped */
	const volume = (pts: V3[], base: string, dark: string, key: string, z: number, extra?: React.ReactNode, shift = 0.35) => {
		const p2 = pts.map(P);
		const hl = hull(p2);
		const cx = p2.reduce((a, q) => a + q[0], 0) / p2.length, cy = p2.reduce((a, q) => a + q[1], 0) / p2.length;
		const span = Math.max(...hl.map((q) => Math.hypot(q[0] - cx, q[1] - cy)));
		const lx = LP[0] - cx, ly = LP[1] - cy, ll = Math.hypot(lx, ly) || 1;
		const sh: P2[] = hl.map((q) => [q[0] - (lx / ll) * span * shift, q[1] - (ly / ll) * span * shift]);
		const id = `cv${f}_${uid++}`;
		const k = lit(pts[0]);
		const path = smoothPath(hl);
		push(z, (
			<g key={key}>
				<path d={smoothPath(hl.map((q) => [q[0] + (lx / ll) * 2.4, q[1] + (ly / ll) * 2.4] as P2))} fill={C.rim} opacity={0.55 * k} />
				<path d={path} fill={base} />
				<clipPath id={id}><path d={path} /></clipPath>
				<path d={smoothPath(sh)} fill={dark} clipPath={`url(#${id})`} />
				{extra}
			</g>
		));
	};

	// ---- legs, shoes, arms, hands
	for (const side of ['Left', 'Right']) {
		const near = side === 'Right';
		const bias = near ? 0.02 : -0.02;
		shaded(j[`${side}UpLeg`], j[`${side}Leg`], 0.044, 0.035, C.suit, C.suitD, side + 'th', depth(j[`${side}Leg`]) - 0.03);
		shaded(j[`${side}Leg`], j[`${side}Foot`], 0.035, 0.028, C.suit, C.suitD, side + 'sh', depth(j[`${side}Foot`]) - 0.03);
		const F = j[`${side}Foot`], T = j[`${side}ToeBase`];
		const fd = norm([T[0] - F[0], 0, T[2] - F[2]]);
		const sd = norm(cross([0, 1, 0], fd));
		const shoePts: V3[] = [];
		for (const [k, w, h] of [[-0.035, 0.026, 0.036], [0.02, 0.03, 0.034], [0.08, 0.026, 0.022], [0.11, 0.016, 0.014]] as [number, number, number][]) {
			const o: V3 = [F[0] + fd[0] * k, 0, F[2] + fd[2] * k];
			const lift = Math.max(0, Math.min(F[1], T[1]) - 0.035);
			for (const s of [-1, 1]) for (const y of [0, h]) shoePts.push(add(add(o, mul(sd, s * w)), [0, y + 0.002 + lift, 0]));
		}
		volume(shoePts, C.shoe, C.shoeD, side + 'shoe', depth(F) - 0.028);
		shaded(j[`${side}Arm`], j[`${side}ForeArm`], 0.032, 0.028, C.suit, C.suitD, side + 'ua', (depth(j[`${side}Arm`]) + depth(j[`${side}ForeArm`])) / 2 + bias);
		shaded(j[`${side}ForeArm`], j[`${side}Hand`], 0.028, 0.024, C.suit, C.suitD, side + 'fa', (depth(j[`${side}ForeArm`]) + depth(j[`${side}Hand`])) / 2 + bias);
		const Wr = j[`${side}Hand`], I = j[`${side}HandIndex1`], Th = j[side === 'Right' ? 'RThumb' : 'LThumb'];
		const pw = P(Wr), pi = P(add(Wr, mul(norm(sub(I, Wr)), 0.1))), pt = P(add(Wr, mul(norm(sub(Th, Wr)), 0.05)));
		const ang = (Math.atan2(pi[1] - pw[1], pi[0] - pw[0]) * 180) / Math.PI - 90;
		const ax = [pi[0] - pw[0], pi[1] - pw[1]], at = [pt[0] - pw[0], pt[1] - pw[1]];
		const mirror = ax[0] * at[1] - ax[1] * at[0] > 0 ? -1 : 1;
		const s = (0.088 * SC) / 27;
		const shape = near && D.held ? FIST : t > T_TALK + 0.6 ? OPEN : MITTEN;
		push(depth(Wr) + bias + 0.002, (
			<g key={side + 'hand'}>
				<circle cx={pw[0]} cy={pw[1]} r={0.025 * SC} fill={C.shirt} />
				<g transform={`translate(${f1(pw[0])} ${f1(pw[1])}) rotate(${ang.toFixed(1)}) scale(${(mirror * s).toFixed(3)} ${s.toFixed(3)})`}>
					<path d={shape} fill={near ? C.skin : C.skinD} stroke="#a87c5e" strokeWidth={1.2} />
				</g>
			</g>
		));
	}

	// ---- torso: hull of cross-sections from the collar to the coat hem
	const ring = (o: V3, w: number, dpt: number, n = 16): V3[] => Array.from({length: n}, (_, i) => {
		const a = (i / n) * Math.PI * 2;
		return add(o, add(mul(tf.left, Math.cos(a) * w), mul(tf.fwd, Math.sin(a) * dpt)));
	});
	const chest = add(lerp3(j.LeftArm, j.RightArm, 0.5), mul(tf.up, -0.035));
	const hipC = lerp3(j.LeftUpLeg, j.RightUpLeg, 0.5);
	const hem = add(hipC, [0, -0.075, 0]);
	const torsoPts = [...ring(add(j.Neck, mul(tf.up, -0.005)), 0.052, 0.046), ...ring(chest, 0.158, 0.076), ...ring(add(chest, mul(tf.up, 0.03)), 0.125, 0.062), ...ring(lerp3(chest, hipC, 0.5), 0.128, 0.072), ...ring(hipC, 0.132, 0.076), ...ring(hem, 0.138, 0.082)];
	const front = (p: V3, d: number) => add(p, mul(tf.fwd, d));
	const facing = dot(tf.fwd, c);
	const pp = (p: V3) => P(p).map(f1).join(' ');
	volume(torsoPts, C.suit, C.suitD, 'torso', depth(hipC), facing > -0.1 ? (
		<g>
			<path d={`M${pp(front(add(j.Neck, mul(tf.left, 0.04)), 0.045))} L${pp(front(add(j.Neck, mul(tf.left, -0.04)), 0.045))} L${pp(front(add(chest, mul(tf.up, -0.1)), 0.079))} Z`} fill={C.shirt} />
			<path d={`M${pp(front(add(j.Neck, mul(tf.left, 0.045)), 0.046))} L${pp(front(add(chest, mul(tf.up, -0.11)), 0.08))} L${pp(front(add(add(chest, mul(tf.up, -0.02)), mul(tf.left, 0.07)), 0.07))} Z`} fill={C.suitD} opacity={0.8} />
			<path d={`M${pp(front(add(j.Neck, mul(tf.left, -0.045)), 0.046))} L${pp(front(add(chest, mul(tf.up, -0.11)), 0.08))} L${pp(front(add(add(chest, mul(tf.up, -0.02)), mul(tf.left, -0.07)), 0.07))} Z`} fill={C.suitD} opacity={0.8} />
			<path d={`M${pp(front(j.Neck, 0.05))} L${pp(front(add(chest, mul(tf.up, -0.095)), 0.081))}`} stroke={C.tie} strokeWidth={0.015 * SC * Math.max(0.4, facing)} strokeLinecap="round" />
			{[0.15, 0.22].map((k) => {
				const b = P(front(add(chest, mul(tf.up, -k)), 0.08));
				return <circle key={k} cx={b[0]} cy={b[1]} r={0.006 * SC} fill={C.ink} />;
			})}
		</g>
	) : undefined);

	// ---- neck and head: skull + jaw + nose volume, hair cap, features placed on the 3D head
	const hd = D.head;
	shaded(j.Neck, add(j.Head, mul(hd.up, 0.01)), 0.03, 0.028, C.skin, C.skinD, 'neck', depth(hipC) - 0.001);
	const R = HEAD_R;
	const onH = (fw: number, lf: number, up: number): V3 => add(hd.c, add(add(mul(hd.fwd, fw * R), mul(hd.left, lf * R)), mul(hd.up, up * R)));
	const headPts: V3[] = [...SPHERE.map(([x, y, z]) => onH(x * 0.98 - 0.04, z * 0.92, y * 1.02)), ...SPHERE.filter(([, y]) => y < 0.2).map(([x, y, z]) => onH(0.28 + x * 0.6, z * 0.62, -0.42 + y * 0.48)), onH(1.1, 0, -0.14)];
	const hairAxis = norm(add(mul(hd.up, 0.78), mul(hd.fwd, -0.62)));
	const hairPts: V3[] = SPHERE.filter((q) => {
		const n = add(add(mul(hd.fwd, q[0]), mul(hd.left, q[2])), mul(hd.up, q[1]));
		return dot(n, hairAxis) > 0.26;
	}).map(([x, y, z]) => onH(x * 1.04 - 0.04, z * 0.97, y * 1.07 + 0.02));
	const feat = (fw: number, lf: number, up: number) => {
		const p = onH(fw, lf, up);
		return {p: P(p), v: dot(norm(sub(p, hd.c)), c)};
	};
	const PR = R * SC;
	const eyes = [feat(0.9, 0.34, 0.04), feat(0.9, -0.34, 0.04)];
	const ear = feat(-0.08, -0.95, -0.08);
	const nose = feat(1.06, 0, -0.16);
	const mouth = feat(0.86, 0, -0.5);
	const blink = f % 117 < 3 ? 0.15 : 1;
	const headZ = depth(hd.c) + 0.04;
	volume(headPts, C.skin, C.skinD, 'head', headZ, undefined, 0.22);
	volume(hairPts, C.hair, C.hairD, 'hair', headZ + 0.0001, undefined, 0.2);
	push(headZ + 0.0002, (
		<g key="face">
			{ear.v > 0.05 ? <ellipse cx={ear.p[0]} cy={ear.p[1]} rx={PR * 0.15 * Math.max(0.35, ear.v)} ry={PR * 0.24} fill={C.skinD} /> : null}
			{eyes.map((e, i) => (e.v > 0.12 ? (
				<g key={i}>
					<ellipse cx={e.p[0]} cy={e.p[1]} rx={PR * 0.075 * Math.max(0.45, e.v)} ry={PR * 0.11 * blink} fill={C.ink} />
					<ellipse cx={e.p[0]} cy={e.p[1]} rx={PR * 0.2 * Math.max(0.35, e.v)} ry={PR * 0.19} fill="rgba(210,230,255,0.07)" stroke="#2a2522" strokeWidth={PR * 0.035} />
					<path d={`M${f1(e.p[0] - PR * 0.15 * e.v)} ${f1(e.p[1] - PR * 0.27)} L${f1(e.p[0] + PR * 0.15 * e.v)} ${f1(e.p[1] - PR * (D.expr === 'thinking' ? 0.32 : 0.28))}`} stroke={C.hair} strokeWidth={PR * 0.06} strokeLinecap="round" />
				</g>
			) : null))}
			{eyes[0].v > 0.12 && eyes[1].v > 0.12 ? <line x1={eyes[0].p[0]} y1={eyes[0].p[1]} x2={eyes[1].p[0]} y2={eyes[1].p[1]} stroke="#2a2522" strokeWidth={PR * 0.03} /> : null}
			{nose.v > 0.1 ? <path d={`M${f1(nose.p[0])} ${f1(nose.p[1] - PR * 0.12)} Q${f1(nose.p[0] + PR * 0.1)} ${f1(nose.p[1] + PR * 0.04)} ${f1(nose.p[0] - PR * 0.02)} ${f1(nose.p[1] + PR * 0.06)}`} stroke={C.skinD} strokeWidth={PR * 0.05} fill="none" strokeLinecap="round" /> : null}
			{mouth.v > 0.1 ? (D.talk ? <ellipse cx={mouth.p[0]} cy={mouth.p[1]} rx={PR * 0.09 * mouth.v} ry={PR * 0.07} fill="#3a1f1a" /> : (
				<path d={`M${f1(mouth.p[0] - PR * 0.14 * mouth.v)} ${f1(mouth.p[1])} Q${f1(mouth.p[0])} ${f1(mouth.p[1] + PR * (D.expr === 'smile' ? 0.09 : 0.03))} ${f1(mouth.p[0] + PR * 0.14 * mouth.v)} ${f1(mouth.p[1])}`} stroke={C.ink} strokeWidth={PR * 0.045} fill="none" strokeLinecap="round" />
			)) : null}
		</g>
	));

	parts.sort((a, b) => a.z - b.z);

	// ---- room: floor and back wall projected with the same camera
	const poly = (pts: V3[]) => pts.map(P).map((q) => q.map(f1).join(' ')).join(' L');
	const pl = P(D.lantern);
	const shadowC = P([j.Hips[0], 0, j.Hips[2]]);
	const lanternNode = <g transform={`translate(${f1(pl[0])} ${f1(pl[1])})`}><Lantern2D s={(0.21 * SC) / 66} on={flick} /></g>;
	return (
		<AbsoluteFill style={{background: '#0d1014'}}>
			<svg width={W} height={H}>
				<defs>
					<radialGradient id="f35-glow"><stop offset="0" stopColor="#ffd590" stopOpacity={0.6} /><stop offset="0.35" stopColor="#ffb860" stopOpacity={0.2} /><stop offset="1" stopColor="#ffb860" stopOpacity={0} /></radialGradient>
					<radialGradient id="f35-hole"><stop offset="0" stopColor="#000" /><stop offset="0.55" stopColor="#666" /><stop offset="1" stopColor="#fff" /></radialGradient>
					<mask id="f35-dark"><rect width={W} height={H} fill="#fff" /><circle cx={LP[0]} cy={LP[1]} r={700 * zoom * flick} fill="url(#f35-hole)" /></mask>
				</defs>
				<path d={`M${poly([[-4, 0, 1.1], [10, 0, 1.1], [10, 2.4, 1.1], [-4, 2.4, 1.1]])} Z`} fill="#22302a" />
				{Array.from({length: 30}, (_, i) => Array.from({length: 5}, (_, k) => {
					const q = P([-3 + i * 0.45 + (k % 2) * 0.22, 0.75 + k * 0.3, 1.1]);
					return <ellipse key={`${i}-${k}`} cx={q[0]} cy={q[1]} rx={0.025 * SC} ry={0.012 * SC} fill="#2c3c34" />;
				}))}
				<path d={`M${poly([[-4, 0, 1.1], [10, 0, 1.1], [10, 0.42, 1.1], [-4, 0.42, 1.1]])} Z`} fill="#2e2017" />
				<path d={`M${poly([[-4, 0.42, 1.1], [10, 0.42, 1.1], [10, 0.45, 1.1], [-4, 0.45, 1.1]])} Z`} fill="#3e2a1d" />
				<path d={`M${poly([[3.2, 0.75, 1.1], [3.95, 0.75, 1.1], [3.95, 1.7, 1.1], [3.2, 1.7, 1.1]])} Z`} fill="#1e2a44" stroke="#2a1c12" strokeWidth={0.04 * SC} />
				<path d={`M${poly([[-4, 0, 1.1], [10, 0, 1.1], [10, 0, -3], [-4, 0, -3]])} Z`} fill="#30221a" />
				{Array.from({length: 14}, (_, i) => <path key={i} d={`M${poly([[-4, 0, 1.1 - i * 0.3], [10, 0, 1.1 - i * 0.3]])}`} stroke="#22170f" strokeWidth={2} />)}
				<circle cx={LP[0]} cy={LP[1]} r={560 * zoom * flick} fill="url(#f35-glow)" />
				<ellipse cx={shadowC[0]} cy={shadowC[1]} rx={0.15 * SC} ry={0.04 * SC} fill="#000" opacity={0.35} />
				{!D.held ? lanternNode : null}
				<g>{parts.map((p) => p.el)}</g>
				{D.held ? lanternNode : null}
				<rect width={W} height={H} fill="#05070c" opacity={0.45} mask="url(#f35-dark)" />
				<text x={60} y={1030} style={{fontFamily: 'Noto Sans CJK SC, sans-serif', fontSize: 26, fill: '#c9b48a', letterSpacing: '0.06em'}}>A · 平面 2D，真 35° 视角（第二版：头部体积、明暗、放下灯再说话）</text>
			</svg>
		</AbsoluteFill>
	);
};
export const FLAT35_N = Math.round(DEMO_T * 30);
export {T_GRAB, T_READ, T_TALK};
